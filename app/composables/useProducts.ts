import type { Product } from "~/types";
import { useDirectus } from "./useDirectus";
import { readItems, readItem, createItem, updateItem } from "@directus/sdk";

export const useProducts = () => {
  const { client, handleDirectusRequest } = useDirectus();

  const getProducts = async (filters?: any): Promise<Product[]> => {
    return handleDirectusRequest(async () => {
      const query: any = {
        fields: ["*"],
        sort: ["-date_created"],
      };

      if (filters) {
        query.filter = filters;
      }

      return (await client.request(
        readItems("products", query)
      )) as unknown as Product[];
    }, []);
  };

  const getProduct = async (id: string): Promise<Product | null> => {
    const config = useRuntimeConfig();
    if (!config.public.directusUrl) {
      console.error("[getProduct] Directus URL not configured");
      return null;
    }

    if (!id) {
      console.error("[getProduct] Product ID is required");
      return null;
    }

    return handleDirectusRequest(async () => {
      try {
        const product = await client.request(
          readItem("products", id, {
            fields: ["*"],
          })
        );
        return product as unknown as Product;
      } catch (error: any) {
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
  };

  const getProductBySlug = async (slug: string): Promise<Product | null> => {
    const products = await getProducts({ slug: { _eq: slug } });
    return products[0] || null;
  };

  const createProduct = async (data: Partial<Product>): Promise<Product> => {
    return (await client.request(
      createItem("products", data as any)
    )) as unknown as Product;
  };

  const updateProduct = async (
    id: string,
    data: Partial<Product>
  ): Promise<Product> => {
    return (await client.request(
      updateItem("products", id, data as any)
    )) as unknown as Product;
  };

  const updateStock = async (
    productId: string,
    quantity: number
  ): Promise<Product> => {
    return await updateProduct(productId, { stock_quantity: quantity });
  };

  return {
    getProducts,
    getProduct,
    getProductBySlug,
    createProduct,
    updateProduct,
    updateStock,
  };
};
