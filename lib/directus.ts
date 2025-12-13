import {
  createDirectus,
  rest,
  readItems,
  readItem,
  createItem,
  updateItem,
} from "@directus/sdk";

import type {
  Product,
  Category,
  Sale,
  SaleItem,
  StockMovement,
  Schema,
} from "~/types";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;

if (!DIRECTUS_URL) {
  console.error(
    "❌ NEXT_PUBLIC_DIRECTUS_URL environment variable is not set. Please configure it in your .env.local file."
  );
}

let directusClient = createDirectus<Schema>(DIRECTUS_URL || "").with(rest());

export const directus = directusClient;

async function handleDirectusRequest<T>(
  request: () => Promise<T>,
  fallback: T,
  silent = false
): Promise<T> {
  if (!DIRECTUS_URL) {
    if (!silent) {
      console.warn("Directus URL not configured. Returning empty data.");
    }
    return fallback;
  }

  try {
    return await request();
  } catch (error: any) {
    if (!silent && process.env.NODE_ENV === "development") {
      const errorMessage = error?.message || "Unknown error";
      const errorStatus = error?.response?.status;

      // Check for CORS errors
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("CORS")
      ) {
        console.error(
          "❌ CORS Hatası: Directus sunucusu localhost'tan gelen isteklere izin vermiyor. " +
            "Backend'de CORS ayarlarını kontrol edin veya API route kullanın."
        );
      } else if (errorStatus === 500) {
        console.warn(
          `Directus API error (500): ${errorMessage}. Collection may not exist or has permission issues.`
        );
      } else {
        console.error("Directus request failed:", errorMessage);
      }
    }
    return fallback;
  }
}

export async function getProducts(filters?: any): Promise<Product[]> {
  return handleDirectusRequest(async () => {
    const query: any = {
      fields: ["*", "category.id", "category.name", "category.slug"],
      sort: ["-date_created"],
    };

    if (filters) {
      query.filter = filters;
    }

    return (await directus.request(
      readItems("products", query)
    )) as unknown as Product[];
  }, []);
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!DIRECTUS_URL) {
    console.error("[getProduct] Directus URL not configured");
    return null;
  }

  if (!id) {
    console.error("[getProduct] Product ID is required");
    return null;
  }

  return handleDirectusRequest(async () => {
    try {
      const product = await directus.request(
        readItem("products", id, {
          fields: ["*", "category.id", "category.name", "category.slug"],
        })
      );
      return product as unknown as Product;
    } catch (error: any) {
      // Log more details in development
      if (process.env.NODE_ENV === "development") {
        console.error(`[getProduct] Error fetching product ${id}:`, {
          message: error?.message,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
        });
      }
      throw error;
    }
  }, null);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts({ slug: { _eq: slug } });
  return products[0] || null;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  return (await directus.request(
    createItem("products", data as any)
  )) as unknown as Product;
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<Product> {
  return (await directus.request(
    updateItem("products", id, data as any)
  )) as unknown as Product;
}

export async function updateStock(
  productId: string,
  quantity: number
): Promise<Product> {
  return await updateProduct(productId, { stock_quantity: quantity });
}

export async function getCategories(): Promise<Category[]> {
  return handleDirectusRequest(
    async () => {
      return (await directus.request(
        readItems("categories", {
          fields: [
            "id",
            "name",
            "slug",
            "image",
            "date_created",
            "date_updated",
          ],
          sort: ["-date_created"],
          // Removed status filter - Category type doesn't have status field
        } as any)
      )) as unknown as Category[];
    },
    [],
    true // Silent mode for Navbar to avoid console spam
  );
}

export async function getCategory(id: string): Promise<Category | null> {
  return handleDirectusRequest(async () => {
    return (await directus.request(
      readItem("categories", id, {
        fields: ["id", "name", "slug", "image", "date_created", "date_updated"],
      })
    )) as unknown as Category;
  }, null);
}

export async function createCategory(
  data: Partial<Category>
): Promise<Category> {
  return (await directus.request(
    createItem("categories", data as any)
  )) as unknown as Category;
}

export async function updateCategory(
  id: string,
  data: Partial<Category>
): Promise<Category> {
  return (await directus.request(
    updateItem("categories", id, data as any)
  )) as unknown as Category;
}

export async function createSale(saleData: {
  sale_date: string;
  sale_type: "online" | "counter";
  notes?: string;
}): Promise<Sale> {
  // Don't set readonly fields (total_amount, total_cost, total_profit)
  // They will be calculated automatically by Directus or updated later
  const sale = await directus.request(
    createItem("sales" as any, saleData as any)
  );
  return sale as unknown as Sale;
}

export async function createSaleItems(
  saleId: string,
  items: Array<{
    product: string;
    quantity: number;
    unit_price: number;
    unit_cost: number;
  }>
): Promise<SaleItem[]> {
  // Don't set readonly fields (subtotal, cost_total, profit)
  // They will be calculated automatically by Directus
  const saleItems = items.map((item) => ({
    sale: saleId,
    product: item.product,
    quantity: item.quantity,
    unit_price: item.unit_price,
    unit_cost: item.unit_cost,
  }));

  const createdItems = (await Promise.all(
    saleItems.map((item) =>
      directus.request(createItem("sale_items" as any, item as any))
    )
  )) as unknown as SaleItem[];

  // Calculate totals from created items (they should have subtotal, cost_total, profit calculated)
  // If Directus doesn't auto-calculate, we'll calculate manually
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const totalCost = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0
  );
  const totalProfit = totalAmount - totalCost;

  // Update sale totals (these fields might also be readonly, but we try to update)
  try {
    await directus.request(
      updateItem("sales" as any, saleId, {
        total_amount: totalAmount,
        total_cost: totalCost,
        total_profit: totalProfit,
      } as any)
    );
  } catch (error) {
    // If totals are readonly and can't be updated, that's okay
    // They might be calculated automatically by Directus hooks/triggers
    console.warn("Could not update sale totals (may be readonly):", error);
  }

  return createdItems;
}

export async function getSales(
  filters?: any,
  options?: { limit?: number }
): Promise<Sale[]> {
  return handleDirectusRequest(
    async () => {
      const query: any = {
        fields: ["*"],
        sort: ["-sale_date", "-date_created"],
      };

      if (filters) {
        // Separate limit from filters if it exists
        if (filters.limit !== undefined) {
          query.limit = filters.limit;
          const { limit, ...filterParams } = filters;
          if (Object.keys(filterParams).length > 0) {
            query.filter = filterParams;
          }
        } else {
          query.filter = filters;
        }
      }

      // Apply options if provided
      if (options?.limit !== undefined) {
        query.limit = options.limit;
      }

      return (await directus.request(
        readItems("sales" as any, query)
      )) as unknown as Sale[];
    },
    [],
    false // Allow errors to be logged for sales (admin functionality)
  );
}

export async function getSale(id: string): Promise<Sale | null> {
  return handleDirectusRequest(async () => {
    return (await directus.request(
      readItem("sales" as any, id, {
        fields: ["*"],
      })
    )) as unknown as Sale;
  }, null);
}

export async function getDailyReport(date: string): Promise<{
  date: string;
  total_amount: number;
  total_cost: number;
  total_profit: number;
  sales_count: number;
  items: Sale[];
}> {
  const startOfDay = `${date}T00:00:00`;
  const endOfDay = `${date}T23:59:59`;

  const sales = await getSales({
    sale_date: {
      _gte: startOfDay,
      _lte: endOfDay,
    },
  });

  const totalAmount = sales.reduce(
    (sum, sale) => sum + (sale.total_amount || 0),
    0
  );
  const totalCost = sales.reduce(
    (sum, sale) => sum + (sale.total_cost || 0),
    0
  );
  const totalProfit = totalAmount - totalCost;

  return {
    date,
    total_amount: totalAmount,
    total_cost: totalCost,
    total_profit: totalProfit,
    sales_count: sales.length,
    items: sales,
  };
}

export async function getMonthlyReport(
  year: number,
  month: number
): Promise<{
  year: number;
  month: number;
  total_amount: number;
  total_cost: number;
  total_profit: number;
  sales_count: number;
  items: Sale[];
  topProducts: Array<{ product: Product; quantity: number; revenue: number }>;
}> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  const sales = await getSales({
    sale_date: {
      _gte: startDate,
      _lte: endDate,
    },
  });

  const totalAmount = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalCost = sales.reduce((sum, sale) => sum + sale.total_cost, 0);
  const totalProfit = totalAmount - totalCost;

  // Calculate top products
  const productMap = new Map<
    string,
    { product: Product; quantity: number; revenue: number }
  >();

  sales.forEach((sale) => {
    if (sale.sale_items) {
      sale.sale_items.forEach((item) => {
        const productId =
          typeof item.product === "string" ? item.product : item.product.id;
        const product = typeof item.product === "string" ? null : item.product;

        if (productId && product) {
          // Use subtotal if available, otherwise calculate from quantity * unit_price
          const revenue = item.subtotal ?? item.quantity * item.unit_price;

          const existing = productMap.get(productId);
          if (existing) {
            existing.quantity += item.quantity;
            existing.revenue += revenue;
          } else {
            productMap.set(productId, {
              product,
              quantity: item.quantity,
              revenue: revenue,
            });
          }
        }
      });
    }
  });

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    year,
    month,
    total_amount: totalAmount,
    total_cost: totalCost,
    total_profit: totalProfit,
    sales_count: sales.length,
    items: sales,
    topProducts,
  };
}

export async function getStockMovements(
  productId?: string
): Promise<StockMovement[]> {
  return handleDirectusRequest(async () => {
    const query: any = {
      fields: ["*"],
      sort: ["-date_created"],
    };

    if (productId) {
      query.filter = { product: { _eq: productId } };
    }

    return (await directus.request(
      readItems("stock_movements" as any, query)
    )) as unknown as StockMovement[];
  }, []);
}

export async function createStockMovement(data: {
  product: string;
  movement_type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  related_sale?: string;
  notes?: string;
}): Promise<StockMovement> {
  return (await directus.request(
    createItem("stock_movements" as any, data as any)
  )) as unknown as StockMovement;
}
