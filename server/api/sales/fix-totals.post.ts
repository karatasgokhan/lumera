import {
  createDirectus,
  rest,
  staticToken,
  readItems,
  updateItem,
} from "@directus/sdk";
import type { Schema } from "~/types";

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

  let client = createDirectus<Schema>(directusUrl).with(rest());
  if (staticTokenValue) {
    client = client.with(staticToken(staticTokenValue));
  }

  try {
    // Get all sales - we'll recalculate totals for all
    const sales = await client.request(
      readItems("sales" as any, {
        fields: ["id", "total_amount", "total_cost", "total_profit"],
        limit: 1000,
      })
    );

    // Get all sale items at once (much faster)
    const allSaleItems = await client.request(
      readItems("sale_items" as any, {
        fields: ["id", "sale", "quantity", "unit_price", "unit_cost"],
        limit: 10000,
      })
    );

    // Group sale items by sale ID
    const saleItemsMap = new Map<string, any[]>();
    for (const item of allSaleItems as any[]) {
      const saleId = item.sale;
      if (!saleItemsMap.has(saleId)) {
        saleItemsMap.set(saleId, []);
      }
      saleItemsMap.get(saleId)!.push(item);
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const sale of sales as any[]) {
      try {
        // Get sale items from map
        const saleItems = saleItemsMap.get(sale.id) || [];

        if (saleItems.length === 0) {
          continue;
        }

        // Calculate totals from sale items
        let totalAmount = 0;
        let totalCost = 0;

        for (const item of saleItems as any[]) {
          const quantity = Number(item.quantity) || 0;
          const unitPrice = Number(item.unit_price) || 0;
          const unitCost = Number(item.unit_cost) || 0;

          const subtotal = quantity * unitPrice;
          const costTotal = quantity * unitCost;

          totalAmount += subtotal;
          totalCost += costTotal;
        }

        const totalProfit = totalAmount - totalCost;

        // Only update if totals are different (to avoid unnecessary updates)
        const currentTotalAmount = Number(sale.total_amount) || 0;
        const currentTotalCost = Number(sale.total_cost) || 0;
        const currentTotalProfit = Number(sale.total_profit) || 0;

        if (
          Math.abs(currentTotalAmount - totalAmount) > 0.01 ||
          Math.abs(currentTotalCost - totalCost) > 0.01 ||
          Math.abs(currentTotalProfit - totalProfit) > 0.01
        ) {
          // Update sale totals - try as numbers first
          try {
            const updateResult = await client.request(
              updateItem("sales" as any, sale.id, {
                total_amount: totalAmount,
                total_cost: totalCost,
                total_profit: totalProfit,
              } as any)
            );
            updatedCount++;
            if (process.env.NODE_ENV === "development") {
              console.log(`✅ Updated sale ${sale.id}:`, {
                totalAmount,
                totalCost,
                totalProfit,
                updateResult,
              });
            }
          } catch (updateError: any) {
            // Try as strings if numbers don't work
            try {
              await client.request(
                updateItem("sales" as any, sale.id, {
                  total_amount: totalAmount.toFixed(2),
                  total_cost: totalCost.toFixed(2),
                  total_profit: totalProfit.toFixed(2),
                } as any)
              );
              updatedCount++;
              if (process.env.NODE_ENV === "development") {
                console.log(`✅ Updated sale ${sale.id} as strings`);
              }
            } catch (stringError: any) {
              console.error(`❌ Error updating sale ${sale.id}:`, {
                numberError: updateError?.message || updateError,
                stringError: stringError?.message || stringError,
                totalAmount,
                totalCost,
                totalProfit,
              });
              errorCount++;
            }
          }
        } else {
          // Totals are already correct, skip
          if (process.env.NODE_ENV === "development") {
            console.log(`⏭️ Skipping sale ${sale.id} - totals already correct`);
          }
        }
      } catch (error: any) {
        console.error(
          `Error processing sale ${sale.id}:`,
          error?.message || error
        );
        errorCount++;
      }
    }

    return {
      success: true,
      message: `Updated ${updatedCount} sales, ${errorCount} errors`,
      updated: updatedCount,
      errors: errorCount,
      total: (sales as any[]).length,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to fix sale totals",
    });
  }
});
