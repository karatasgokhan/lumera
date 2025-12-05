import type { Product } from "~/types";
import { useDirectus } from "./useDirectus";
import { readItems, readItem, createItem, updateItem } from "@directus/sdk";

export const useProducts = () => {
  const { client, handleDirectusRequest } = useDirectus();

  const getProducts = async (
    filters?: any,
    options?: { limit?: number; offset?: number }
  ): Promise<{ data: Product[]; total?: number }> => {
    // On client, use server API route to avoid CORS
    if (process.client) {
      try {
        const queryParams: Record<string, string> = {
          fields: JSON.stringify([
            "*",
            "category.id",
            "category.name",
            "category.slug",
          ]),
          sort: JSON.stringify(["-date_created"]),
        };

        if (filters) {
          queryParams.filter = JSON.stringify(filters);
        }

        if (options?.limit !== undefined) {
          queryParams.limit = options.limit.toString();
        }

        if (options?.offset !== undefined) {
          queryParams.offset = options.offset.toString();
        }

        const response = await $fetch<any>("/api/products", {
          query: queryParams,
        });

        let data: Product[];
        let total: number | undefined;

        if (Array.isArray(response)) {
          data = response as Product[];
          total = undefined;
        } else if (response && typeof response === "object") {
          const result = response as any;
          data = Array.isArray(result.data)
            ? (result.data as Product[])
            : (result as Product[]);
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
        console.error("Failed to fetch products via API:", error);
        return { data: [], total: 0 };
      }
    }

    // On server, use direct Directus call
    return handleDirectusRequest(
      async () => {
        const query: any = {
          fields: ["*", "category.id", "category.name", "category.slug"],
          sort: ["-date_created"],
        };

        if (filters) {
          query.filter = filters;
        }

        if (options?.limit !== undefined) {
          query.limit = options.limit;
        }

        if (options?.offset !== undefined) {
          query.offset = options.offset;
        }

        if (process.env.NODE_ENV === "development") {
          console.log("📦 Fetching products from Directus...", {
            filters,
            options,
          });
        }

        const response = await client.request(readItems("products", query));

        // Directus returns { data: [...], meta: { total_count: ... } } when meta is requested
        // Or just [...] when meta is not requested
        let data: Product[];
        let total: number | undefined;

        if (Array.isArray(response)) {
          // Response is directly an array (no meta requested or old SDK version)
          data = response as unknown as Product[];
          total = undefined;
        } else if (response && typeof response === "object") {
          // Response is an object with data and meta
          const result = response as any;
          data = (result.data || result) as Product[];
          total = result.meta?.total_count;
        } else {
          data = [];
          total = undefined;
        }

        if (process.env.NODE_ENV === "development") {
          console.log(`✅ Fetched ${data.length} products`, {
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
      { data: [], total: 0 }
    );
  };

  const getProduct = async (id: string): Promise<Product | null> => {
    if (!id) {
      console.error("[getProduct] Product ID is required");
      return null;
    }

    // On client, use server API route to avoid CORS
    if (process.client) {
      try {
        const product = await $fetch<Product>(`/api/products/${id}`);
        return product;
      } catch (error: any) {
        if (process.env.NODE_ENV === "development") {
          console.error(`[getProduct] Error fetching product ${id}:`, error);
        }
        return null;
      }
    }

    // On server, use direct Directus call
    const config = useRuntimeConfig();
    if (!config.public.directusUrl) {
      console.error("[getProduct] Directus URL not configured");
      return null;
    }

    return handleDirectusRequest(async () => {
      try {
        const product = await client.request(
          readItem("products", id, {
            fields: ["*", "category.id", "category.name", "category.slug"],
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
    const result = await getProducts({ slug: { _eq: slug } });
    return result.data[0] || null;
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
