import type { Category } from "~/types";
import { useDirectus } from "./useDirectus";
import { readItems, readItem, createItem, updateItem } from "@directus/sdk";

export const useCategories = () => {
  const { client, handleDirectusRequest } = useDirectus();

  const getCategories = async (): Promise<Category[]> => {
    return handleDirectusRequest(
      async () => {
        return (await client.request(
          readItems("categories", {
            fields: ["*"],
            sort: ["-date_created"],
          } as any)
        )) as unknown as Category[];
      },
      [],
      true // Silent mode for Navbar to avoid console spam
    );
  };

  const getCategory = async (id: string): Promise<Category | null> => {
    return handleDirectusRequest(async () => {
      return (await client.request(
        readItem("categories", id, {
          fields: ["*"],
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
