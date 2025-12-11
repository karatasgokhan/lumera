import type { Sale, SaleItem, Product } from "~/types";
import { useDirectus } from "./useDirectus";
import { readItems, readItem, createItem, updateItem } from "@directus/sdk";

export const useSales = () => {
  const { client, handleDirectusRequest } = useDirectus();

  const createSale = async (saleData: {
    sale_date: string;
    sale_type: "online" | "counter";
    notes?: string;
  }): Promise<Sale> => {
    // Explicitly specify fields to avoid alias field issues (like stock_movements)
    const explicitFields = [
      "id",
      "sale_date",
      "sale_type",
      "total_amount",
      "total_cost",
      "total_profit",
      "notes",
      "user_created",
      "date_created",
      "user_updated",
      "date_updated",
    ];
    const createdSale = await client.request(
      createItem(
        "sales" as any,
        saleData as any,
        {
          fields: explicitFields,
        } as any
      )
    );
    return createdSale as unknown as Sale;
  };

  const createSaleItems = async (
    saleId: string,
    items: Array<{
      product: string;
      quantity: number;
      unit_price: number;
      unit_cost: number;
    }>
  ): Promise<SaleItem[]> => {
    // Ensure all values are numbers
    const normalizedItems = items.map((item) => ({
      product: item.product,
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unit_price) || 0,
      unit_cost: Number(item.unit_cost) || 0,
    }));

    // Create sale items (computed fields like subtotal, cost_total, profit are readonly and calculated by Directus)
    const saleItems = normalizedItems.map((item) => ({
      sale: saleId,
      product: item.product,
      quantity: item.quantity,
      unit_price: item.unit_price,
      unit_cost: item.unit_cost,
    }));

    const createdItems = (await Promise.all(
      saleItems.map((item) =>
        client.request(createItem("sale_items" as any, item as any))
      )
    )) as unknown as SaleItem[];

    // Update sale items with calculated fields (if they're not computed by Directus)
    // Try to update computed fields - if they're truly readonly, this will fail silently
    try {
      await Promise.all(
        createdItems.map(async (createdItem, index) => {
          const item = normalizedItems[index];
          if (!item || !createdItem.id) return;

          const subtotal = item.quantity * item.unit_price;
          const costTotal = item.quantity * item.unit_cost;
          const profit = subtotal - costTotal;

          try {
            await client.request(
              updateItem("sale_items" as any, createdItem.id, {
                subtotal: subtotal.toFixed(2),
                cost_total: costTotal.toFixed(2),
                profit: profit.toFixed(2),
              } as any)
            );
          } catch (updateError) {
            // If fields are readonly/computed, this is expected - Directus will calculate them
            if (process.env.NODE_ENV === "development") {
              console.log(
                `Sale item ${createdItem.id} computed fields may be readonly:`,
                updateError
              );
            }
          }
        })
      );
    } catch (error) {
      // Ignore errors - computed fields might be handled by Directus
      if (process.env.NODE_ENV === "development") {
        console.log("Could not update sale item computed fields:", error);
      }
    }

    // Calculate totals from normalized items
    const totalAmount = normalizedItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const totalCost = normalizedItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_cost,
      0
    );
    const totalProfit = totalAmount - totalCost;

    // Update sale totals - explicitly specify fields to avoid alias field issues
    const explicitFields = [
      "id",
      "sale_date",
      "sale_type",
      "total_amount",
      "total_cost",
      "total_profit",
      "notes",
      "user_created",
      "date_created",
      "user_updated",
      "date_updated",
    ];

    // Note: We don't update sale totals here anymore
    // The server-side endpoint (sales.post.ts) handles updating totals
    // This avoids alias field issues with Directus SDK
    if (process.env.NODE_ENV === "development") {
      console.log("ℹ️ Sale totals will be updated by server endpoint:", {
        saleId,
        totalAmount,
        totalCost,
        totalProfit,
      });
    }

    return createdItems;
  };

  const getSales = async (
    filters?: any,
    options?: { limit?: number; offset?: number }
  ): Promise<{ data: Sale[]; total?: number }> => {
    // On client, use server API route to avoid CORS
    if (process.client) {
      try {
        // Use explicit fields including sale_items and product info
        const explicitFields = [
          "id",
          "sale_date",
          "sale_type",
          "total_amount",
          "total_cost",
          "total_profit",
          "notes",
          "user_created",
          "date_created",
          "user_updated",
          "date_updated",
          "sale_items.id",
          "sale_items.quantity",
          "sale_items.unit_price",
          "sale_items.unit_cost",
          "sale_items.product.id",
          "sale_items.product.name",
        ];
        const queryParams: Record<string, string> = {
          fields: JSON.stringify(explicitFields),
          sort: JSON.stringify(["-sale_date", "-date_created"]),
        };

        // Handle filters
        if (filters) {
          // Remove limit from filters if it exists (limit should be in options, not filters)
          const { limit: filterLimit, ...filterParams } = filters;
          if (Object.keys(filterParams).length > 0) {
            queryParams.filter = JSON.stringify(filterParams);
          }
          // If limit was in filters, use it (backward compatibility)
          if (filterLimit !== undefined && options?.limit === undefined) {
            queryParams.limit = filterLimit.toString();
          }
        }

        // Handle options (preferred way to pass limit and offset)
        if (options?.limit !== undefined) {
          queryParams.limit = options.limit.toString();
        }

        if (options?.offset !== undefined) {
          queryParams.offset = options.offset.toString();
        }

        const response = await $fetch<
          { data: Sale[]; meta: { total_count: number } } | Sale[]
        >("/api/sales", { query: queryParams });

        let data: Sale[];
        let total: number | undefined;

        if (Array.isArray(response)) {
          data = response;
          total = undefined;
        } else if (response && typeof response === "object") {
          const result = response as any;
          data = (result.data || result) as Sale[];
          total = result.meta?.total_count;
        } else {
          data = [];
          total = undefined;
        }

        return {
          data: Array.isArray(data) ? data : [],
          total: total,
        };
      } catch (error: any) {
        console.error("Failed to fetch sales via API:", error);
        return { data: [], total: 0 };
      }
    }

    // On server, use direct Directus call
    return handleDirectusRequest(
      async () => {
        // Use explicit fields including sale_items and product info
        const explicitFields = [
          "id",
          "sale_date",
          "sale_type",
          "total_amount",
          "total_cost",
          "total_profit",
          "notes",
          "user_created",
          "date_created",
          "user_updated",
          "date_updated",
          "sale_items.id",
          "sale_items.quantity",
          "sale_items.unit_price",
          "sale_items.unit_cost",
          "sale_items.product.id",
          "sale_items.product.name",
        ];
        const query: any = {
          fields: explicitFields,
          sort: ["-sale_date", "-date_created"],
        };

        // Handle filters
        if (filters) {
          // Remove limit from filters if it exists (limit should be in options, not filters)
          const { limit: filterLimit, ...filterParams } = filters;
          if (Object.keys(filterParams).length > 0) {
            query.filter = filterParams;
          }
          // If limit was in filters, use it (backward compatibility)
          if (filterLimit !== undefined && options?.limit === undefined) {
            query.limit = filterLimit;
          }
        }

        // Handle options (preferred way to pass limit and offset)
        if (options?.limit !== undefined) {
          query.limit = options.limit;
        }

        if (options?.offset !== undefined) {
          query.offset = options.offset;
        }

        if (process.env.NODE_ENV === "development") {
          console.log("📦 Fetching sales from Directus...", { query });
        }

        const response = await client.request(readItems("sales" as any, query));

        // Directus returns { data: [...], meta: { total_count: ... } } when meta is requested
        // Or just [...] when meta is not requested
        let data: Sale[];
        let total: number | undefined;

        if (Array.isArray(response)) {
          // Response is directly an array (no meta requested or old SDK version)
          data = response as Sale[];
          total = undefined;
        } else if (response && typeof response === "object") {
          // Response is an object with data and meta
          const result = response as any;
          data = (result.data || result) as Sale[];
          total = result.meta?.total_count;
        } else {
          data = [];
          total = undefined;
        }

        if (process.env.NODE_ENV === "development") {
          console.log(`✅ Fetched ${data.length} sales`, {
            total,
            responseType: Array.isArray(response) ? "array" : "object",
            hasMeta: !Array.isArray(response) && (response as any)?.meta,
          });
        }

        return {
          data: Array.isArray(data) ? data : [],
          total: total,
        };
      },
      { data: [], total: 0 },
      false
    );
  };

  const getSale = async (id: string): Promise<Sale | null> => {
    // On client, use server API route to avoid CORS
    if (process.client) {
      try {
        return await $fetch<Sale>(`/api/sales/${id}`);
      } catch (error: any) {
        if (process.env.NODE_ENV === "development") {
          console.error(`[getSale] Error fetching sale ${id}:`, error);
        }
        return null;
      }
    }

    // On server, use direct Directus call
    return handleDirectusRequest(async () => {
      // Use explicit fields instead of ["*"] to avoid alias field issues
      const explicitFields = [
        "id",
        "sale_date",
        "sale_type",
        "total_amount",
        "total_cost",
        "total_profit",
        "notes",
        "user_created",
        "date_created",
        "user_updated",
        "date_updated",
      ];
      return (await client.request(
        readItem("sales" as any, id, {
          fields: explicitFields,
        })
      )) as unknown as Sale;
    }, null);
  };

  const getDailyReport = async (
    date: string
  ): Promise<{
    date: string;
    total_amount: number;
    total_cost: number;
    total_profit: number;
    sales_count: number;
    items: Sale[];
  }> => {
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const result = await getSales({
      sale_date: {
        _gte: startOfDay,
        _lte: endOfDay,
      },
    });

    const sales = result.data || [];

    // Safely convert to numbers, handling null, undefined, and string values
    const totalAmount = sales.reduce((sum, sale) => {
      const amount = Number(sale.total_amount) || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const totalCost = sales.reduce((sum, sale) => {
      const cost = Number(sale.total_cost) || 0;
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0);

    const totalProfit = totalAmount - totalCost;

    return {
      date,
      total_amount: isNaN(totalAmount) ? 0 : totalAmount,
      total_cost: isNaN(totalCost) ? 0 : totalCost,
      total_profit: isNaN(totalProfit) ? 0 : totalProfit,
      sales_count: sales.length,
      items: sales,
    };
  };

  const getMonthlyReport = async (
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
  }> => {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

    const result = await getSales({
      sale_date: {
        _gte: startDate,
        _lte: endDate,
      },
    });

    const sales = result.data || [];

    // Safely convert to numbers, handling null, undefined, and string values
    const totalAmount = sales.reduce((sum: number, sale: Sale) => {
      const amount = Number(sale.total_amount) || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const totalCost = sales.reduce((sum: number, sale: Sale) => {
      const cost = Number(sale.total_cost) || 0;
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0);

    const totalProfit = totalAmount - totalCost;

    const productMap = new Map<
      string,
      { product: Product; quantity: number; revenue: number }
    >();

    sales.forEach((sale: Sale) => {
      if (sale.sale_items) {
        sale.sale_items.forEach((item) => {
          const productId =
            typeof item.product === "string" ? item.product : item.product.id;
          const product =
            typeof item.product === "string" ? null : item.product;

          if (productId && product) {
            const existing = productMap.get(productId);
            if (existing) {
              existing.quantity += item.quantity;
              existing.revenue += item.subtotal;
            } else {
              productMap.set(productId, {
                product,
                quantity: item.quantity,
                revenue: item.subtotal,
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
      total_amount: isNaN(totalAmount) ? 0 : totalAmount,
      total_cost: isNaN(totalCost) ? 0 : totalCost,
      total_profit: isNaN(totalProfit) ? 0 : totalProfit,
      sales_count: sales.length,
      items: sales,
      topProducts,
    };
  };

  return {
    createSale,
    createSaleItems,
    getSales,
    getSale,
    getDailyReport,
    getMonthlyReport,
  };
};
