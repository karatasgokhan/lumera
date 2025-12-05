import { createDirectus, rest, staticToken, updateItem } from "@directus/sdk";
import type { Schema } from "~/types";
import { useSales } from "~/composables/useSales";
import { useProducts } from "~/composables/useProducts";
import { useStockMovements } from "~/composables/useStockMovements";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const directusUrl = config.public.directusUrl;
  const staticTokenValue = config.directusStaticToken;

  if (!directusUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "Directus URL not configured",
    });
  }

  // Create authenticated client for server-side operations
  let client = createDirectus<Schema>(directusUrl).with(rest());
  if (staticTokenValue) {
    client = client.with(staticToken(staticTokenValue));
  }

  const body = await readBody(event);

  if (
    !body.sale_date ||
    !body.sale_type ||
    !body.items ||
    !Array.isArray(body.items)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields: sale_date, sale_type, items",
    });
  }

  const { createSale, createSaleItems } = useSales();
  const { getProduct, updateProduct } = useProducts();
  const { createStockMovement } = useStockMovements();

  try {
    // Validate stock availability before creating sale
    for (const item of body.items) {
      const product = await getProduct(item.product);
      if (!product) {
        throw createError({
          statusCode: 400,
          statusMessage: `Ürün bulunamadı: ${item.product}`,
        });
      }
      if (product.stock_quantity < item.quantity) {
        throw createError({
          statusCode: 400,
          statusMessage: `Yetersiz stok: ${product.name} (Mevcut: ${product.stock_quantity}, İstenen: ${item.quantity})`,
        });
      }
    }

    // Create sale
    const sale = await createSale({
      sale_date: body.sale_date,
      sale_type: body.sale_type,
      notes: body.notes,
    });

    // Create sale items - convert string prices to numbers
    const itemsWithNumbers = body.items.map((item: any) => ({
      product: item.product,
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unit_price) || 0,
      unit_cost: Number(item.unit_cost) || 0,
    }));
    await createSaleItems(sale.id, itemsWithNumbers);

    // Calculate totals from items
    const totalAmount = itemsWithNumbers.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    );
    const totalCost = itemsWithNumbers.reduce(
      (sum: number, item: { quantity: number; unit_cost: number }) =>
        sum + item.quantity * item.unit_cost,
      0
    );
    const totalProfit = totalAmount - totalCost;

    // Update sale totals directly - ensure they are saved
    try {
      await client.request(
        updateItem("sales" as any, sale.id, {
          total_amount: totalAmount,
          total_cost: totalCost,
          total_profit: totalProfit,
        } as any)
      );
    } catch (updateError: any) {
      // If numbers don't work, try as strings
      try {
        await client.request(
          updateItem("sales" as any, sale.id, {
            total_amount: totalAmount.toFixed(2),
            total_cost: totalCost.toFixed(2),
            total_profit: totalProfit.toFixed(2),
          } as any)
        );
      } catch (stringError: any) {
        // If both fail, log error but don't fail the request
        console.error("Failed to update sale totals:", {
          saleId: sale.id,
          totalAmount,
          totalCost,
          totalProfit,
          error: stringError?.message || stringError,
        });
      }
    }

    // Update stock and create stock movements
    for (const item of body.items) {
      const product = await getProduct(item.product);
      if (!product) continue;

      const newStockQuantity = product.stock_quantity - item.quantity;

      // Update product stock
      await updateProduct(item.product, {
        stock_quantity: newStockQuantity,
      });

      // Create stock movement record
      await createStockMovement({
        product: item.product,
        movement_type: "out",
        quantity: -item.quantity, // Negative for out
        reason: "Satış",
        related_sale: sale.id,
        notes: `${body.sale_type === "online" ? "Online" : "Tezgah"} satış`,
      });
    }

    // Read back the sale with updated totals
    const { getSale } = useSales();
    let updatedSale = await getSale(sale.id);

    if (!updatedSale) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to retrieve created sale",
      });
    }

    // Verify totals were saved correctly - if not, update again
    const savedTotalAmount = Number(updatedSale.total_amount) || 0;
    const savedTotalCost = Number(updatedSale.total_cost) || 0;
    const savedTotalProfit = Number(updatedSale.total_profit) || 0;

    if (
      Math.abs(savedTotalAmount - totalAmount) > 0.01 ||
      Math.abs(savedTotalCost - totalCost) > 0.01 ||
      Math.abs(savedTotalProfit - totalProfit) > 0.01
    ) {
      // Totals don't match, try updating again
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ Sale totals mismatch, retrying update:", {
          saleId: sale.id,
          expected: { totalAmount, totalCost, totalProfit },
          actual: {
            total_amount: savedTotalAmount,
            total_cost: savedTotalCost,
            total_profit: savedTotalProfit,
          },
        });
      }

      try {
        await client.request(
          updateItem("sales" as any, sale.id, {
            total_amount: totalAmount,
            total_cost: totalCost,
            total_profit: totalProfit,
          } as any)
        );
        // Read again to get updated values
        const retryUpdatedSale = await getSale(sale.id);
        if (retryUpdatedSale) {
          updatedSale = retryUpdatedSale;
        }
      } catch (retryError: any) {
        // Try as strings
        try {
          await client.request(
            updateItem("sales" as any, sale.id, {
              total_amount: totalAmount.toFixed(2),
              total_cost: totalCost.toFixed(2),
              total_profit: totalProfit.toFixed(2),
            } as any)
          );
          // Read again to get updated values
          const finalUpdatedSale = await getSale(sale.id);
          if (finalUpdatedSale) {
            updatedSale = finalUpdatedSale;
          }
        } catch (finalError: any) {
          console.error("❌ Failed to update sale totals after retry:", {
            saleId: sale.id,
            error: finalError?.message || finalError,
          });
          // Continue anyway - sale is created, totals might be updated later
        }
      }
    }

    // Final null check before returning
    if (!updatedSale) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to retrieve created sale after update",
      });
    }

    // Return sale with explicit fields only
    return {
      success: true,
      sale: {
        id: updatedSale.id,
        sale_date: updatedSale.sale_date,
        sale_type: updatedSale.sale_type,
        total_amount: updatedSale.total_amount,
        total_cost: updatedSale.total_cost,
        total_profit: updatedSale.total_profit,
        notes: updatedSale.notes,
        user_created: updatedSale.user_created,
        date_created: updatedSale.date_created,
        user_updated: updatedSale.user_updated,
        date_updated: updatedSale.date_updated,
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to create sale",
    });
  }
});
