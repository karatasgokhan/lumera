import { createDirectus, rest, readItems, staticToken } from "@directus/sdk";
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
    sort: query.sort ? JSON.parse(query.sort as string) : ["-date_created"],
  };

  if (query.filter) {
    queryParams.filter = JSON.parse(query.filter as string);
  }

  if (query.limit) {
    queryParams.limit = parseInt(query.limit as string);
  }

  if (query.offset) {
    queryParams.offset = parseInt(query.offset as string);
  }

  try {
    const dataResponse = await client.request(
      readItems("categories", queryParams)
    );

    // Return array directly (matching Directus format)
    return Array.isArray(dataResponse) ? dataResponse : dataResponse;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.status || 500,
      statusMessage: error?.message || "Failed to fetch categories",
    });
  }
});
