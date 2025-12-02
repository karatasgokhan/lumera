import { useSales } from "~/composables/useSales";

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

  try {
    // Create sale
    const sale = await createSale({
      sale_date: body.sale_date,
      sale_type: body.sale_type,
      notes: body.notes,
    });

    // Create sale items
    await createSaleItems(sale.id, body.items);

    return { success: true, sale };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to create sale",
    });
  }
});
