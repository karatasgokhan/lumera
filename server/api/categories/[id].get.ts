import { createDirectus, rest, readItem, staticToken } from "@directus/sdk";
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
      statusMessage: "Category ID is required",
    });
  }

  const query = getQuery(event);
  let client = createDirectus<Schema>(directusUrl).with(rest());

  // Add static token authentication if available
  if (staticTokenValue) {
    client = client.with(staticToken(staticTokenValue));
  }

  // Default fields (excluding alias fields like 'products')
  const defaultFields = [
    "id",
    "name",
    "slug",
    "image",
    "date_created",
    "date_updated",
  ];

  const queryParams: any = {
    fields: query.fields ? JSON.parse(query.fields as string) : defaultFields,
  };

  try {
    const dataResponse = await client.request(
      readItem("categories", id, queryParams)
    );

    return dataResponse;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.status || 500,
      statusMessage: error?.message || "Failed to fetch category",
    });
  }
});
