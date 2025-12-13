import {
  createDirectus,
  rest,
  readItem,
  readItems,
  staticToken,
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

  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Product ID is required",
    });
  }

  const query = getQuery(event);
  let client = createDirectus<Schema>(directusUrl).with(rest());
  if (staticTokenValue) {
    client = client.with(staticToken(staticTokenValue));
  }

  const queryParams: any = {
    fields: query.fields ? JSON.parse(query.fields as string) : ["*", "images"],
  };

  try {
    const product: any = await client.request(
      readItem("products", id, queryParams)
    );

    // Expand images: Convert junction IDs to file IDs
    if (product && product.images) {
      try {
        const junctionItems = await client.request(
          readItems("products_files" as any, {
            filter: {
              products_id: { _eq: id },
            },
            fields: ["id", "directus_files_id"],
            sort: ["sort"],
          })
        );

        // Extract file IDs from junction items
        if (Array.isArray(junctionItems) && junctionItems.length > 0) {
          (product as any).images = junctionItems.map(
            (item: any) => item.directus_files_id
          );
        } else {
          (product as any).images = [];
        }
      } catch (error: any) {
        console.warn(`Failed to expand images for product ${id}:`, error);
        (product as any).images = [];
      }
    }

    return product;
  } catch (error: any) {
    if (error?.response?.status === 404 || error?.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product not found",
      });
    }
    throw createError({
      statusCode: error?.response?.status || error?.status || 500,
      statusMessage: error?.message || "Failed to fetch product",
    });
  }
});
