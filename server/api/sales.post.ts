import { useSales } from "~/composables/useSales";
import { useProducts } from "~/composables/useProducts";
import { useStockMovements } from "~/composables/useStockMovements";

export default defineEventHandler(async (event) => {
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

    // Create sale items
    await createSaleItems(sale.id, body.items);

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

    return { success: true, sale };
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
