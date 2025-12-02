import type { StockMovement } from "~/types";
import { useDirectus } from "./useDirectus";
import { readItems, createItem } from "@directus/sdk";

export const useStockMovements = () => {
  const { client, handleDirectusRequest } = useDirectus();

  const getStockMovements = async (
    productId?: string
  ): Promise<StockMovement[]> => {
    return handleDirectusRequest(async () => {
      const query: any = {
        fields: ["*"],
        sort: ["-date_created"],
      };

      if (productId) {
        query.filter = { product: { _eq: productId } };
      }

      return (await client.request(
        readItems("stock_movements" as any, query)
      )) as unknown as StockMovement[];
    }, []);
  };

  const createStockMovement = async (data: {
    product: string;
    movement_type: "in" | "out" | "adjustment";
    quantity: number;
    reason: string;
    related_sale?: string;
    notes?: string;
  }): Promise<StockMovement> => {
    return (await client.request(
      createItem("stock_movements" as any, data as any)
    )) as unknown as StockMovement;
  };

  return {
    getStockMovements,
    createStockMovement,
  };
};
