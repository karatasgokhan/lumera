import { createDirectus, rest, readItems, aggregate } from "@directus/sdk";
import type { Schema } from "~/types";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const directusUrl = config.public.directusUrl;

  if (!directusUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "Directus URL not configured",
    });
  }

  const query = getQuery(event);
  const client = createDirectus<Schema>(directusUrl).with(rest());

  // Default fields with category relation expanded
  const defaultFields = ["*", "category.id", "category.name", "category.slug"];

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
    // Fetch data and total count in parallel
    const [dataResponse, countResponse] = await Promise.all([
      client.request(readItems("products", queryParams)),
      client.request(
        aggregate("products", {
          aggregate: { count: "*" },
          query: query.filter
            ? { filter: JSON.parse(query.filter as string) }
            : undefined,
        } as any) as any
      ),
    ]);

    // Extract total count from aggregate response
    const total =
      Array.isArray(countResponse) && countResponse.length > 0
        ? (countResponse[0] as any)?.count?.["*"] || 0
        : 0;

    // Return response with meta (matching Directus format)
    return {
      data: Array.isArray(dataResponse) ? dataResponse : dataResponse,
      meta: {
        total_count: total,
      },
    };
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.status || 500,
      statusMessage: error?.message || "Failed to fetch products",
    });
  }
});
