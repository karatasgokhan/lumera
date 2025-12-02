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
    const sale = await client.request(
      createItem("sales" as any, saleData as any)
    );
    return sale as unknown as Sale;
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
    const saleItems = items.map((item) => ({
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

    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const totalCost = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_cost,
      0
    );
    const totalProfit = totalAmount - totalCost;

    try {
      await client.request(
        updateItem("sales" as any, saleId, {
          total_amount: totalAmount,
          total_cost: totalCost,
          total_profit: totalProfit,
        } as any)
      );
    } catch (error) {
      console.warn("Could not update sale totals (may be readonly):", error);
    }

    return createdItems;
  };

  const getSales = async (
    filters?: any,
    options?: { limit?: number }
  ): Promise<Sale[]> => {
    return handleDirectusRequest(
      async () => {
        const query: any = {
          fields: ["*"],
          sort: ["-sale_date", "-date_created"],
        };

        if (filters) {
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

        if (options?.limit !== undefined) {
          query.limit = options.limit;
        }

        return (await client.request(
          readItems("sales" as any, query)
        )) as unknown as Sale[];
      },
      [],
      false
    );
  };

  const getSale = async (id: string): Promise<Sale | null> => {
    return handleDirectusRequest(async () => {
      return (await client.request(
        readItem("sales" as any, id, {
          fields: ["*"],
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

    const sales = await getSales({
      sale_date: {
        _gte: startDate,
        _lte: endDate,
      },
    });

    const totalAmount = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalCost = sales.reduce((sum, sale) => sum + sale.total_cost, 0);
    const totalProfit = totalAmount - totalCost;

    const productMap = new Map<
      string,
      { product: Product; quantity: number; revenue: number }
    >();

    sales.forEach((sale) => {
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
      total_amount: totalAmount,
      total_cost: totalCost,
      total_profit: totalProfit,
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
