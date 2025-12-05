import type { Category } from "~/types";
import { useDirectus } from "./useDirectus";
import { readItems, readItem, createItem, updateItem } from "@directus/sdk";

export const useCategories = () => {
  const { client, handleDirectusRequest } = useDirectus();

  const getCategories = async (): Promise<Category[]> => {
    // On client, use server API route to avoid CORS
    if (process.client) {
      try {
        const queryParams: Record<string, string> = {
          fields: JSON.stringify([
            "id",
            "name",
            "slug",
            "image",
            "date_created",
            "date_updated",
          ]),
          sort: JSON.stringify(["-date_created"]),
        };

        const response = await $fetch<Category[]>("/api/categories", {
          query: queryParams,
        });

        if (process.env.NODE_ENV === "development") {
          console.log(`✅ Fetched ${response.length} categories via API`);
        }

        return Array.isArray(response) ? response : [];
      } catch (error: any) {
        console.error("Failed to fetch categories via API:", error);
        return [];
      }
    }

    // On server, use direct Directus call
    return handleDirectusRequest(
      async () => {
        if (process.env.NODE_ENV === "development") {
          console.log("📦 Fetching categories from Directus...");
        }
        const result = (await client.request(
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
          } as any)
        )) as unknown as Category[];
        if (process.env.NODE_ENV === "development") {
          console.log(`✅ Fetched ${result.length} categories`);
        }
        return result;
      },
      [],
      false // Enable logging to debug why categories aren't loading
    );
  };

  const getCategory = async (id: string): Promise<Category | null> => {
    if (!id) {
      console.error("[getCategory] Category ID is required");
      return null;
    }

    // On client, use server API route to avoid CORS
    if (process.client) {
      try {
        const category = await $fetch<Category>(`/api/categories/${id}`);
        return category;
      } catch (error: any) {
        if (process.env.NODE_ENV === "development") {
          console.error(`[getCategory] Error fetching category ${id}:`, error);
        }
        return null;
      }
    }

    // On server, use direct Directus call
    return handleDirectusRequest(async () => {
      return (await client.request(
        readItem("categories", id, {
          fields: [
            "id",
            "name",
            "slug",
            "image",
            "date_created",
            "date_updated",
          ],
        })
      )) as unknown as Category;
    }, null);
  };

  const createCategory = async (data: Partial<Category>): Promise<Category> => {
    return (await client.request(
      createItem("categories", data as any)
    )) as unknown as Category;
  };

  const updateCategory = async (
    id: string,
    data: Partial<Category>
  ): Promise<Category> => {
    return (await client.request(
      updateItem("categories", id, data as any)
    )) as unknown as Category;
  };

  return {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
  };
};
