import {
  createDirectus,
  rest,
  readItems,
  aggregate,
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

  const query = getQuery(event);
  let client = createDirectus<Schema>(directusUrl).with(rest());

  // Add static token authentication if available (for server-side operations)
  if (staticTokenValue) {
    client = client.with(staticToken(staticTokenValue));
  }

  // Default fields - include sale_items and product info for display
  const defaultFields = [
    "id",
    "sale_date",
    "sale_type",
    "total_amount",
    "total_cost",
    "total_profit",
    "notes",
    "user_created",
    "date_created",
    "user_updated",
    "date_updated",
    "sale_items.id",
    "sale_items.quantity",
    "sale_items.unit_price",
    "sale_items.unit_cost",
    "sale_items.product.id",
    "sale_items.product.name",
  ];

  // Parse fields from query, but replace ["*"] with explicit fields to avoid alias field issues
  let requestedFields = query.fields
    ? JSON.parse(query.fields as string)
    : defaultFields;

  // If ["*"] is requested, use explicit fields instead to avoid alias field errors
  if (
    Array.isArray(requestedFields) &&
    requestedFields.length === 1 &&
    requestedFields[0] === "*"
  ) {
    requestedFields = defaultFields;
  }

  const queryParams: any = {
    fields: requestedFields,
    sort: query.sort
      ? JSON.parse(query.sort as string)
      : ["-sale_date", "-date_created"],
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
      client.request(readItems("sales" as any, queryParams)),
      client.request(
        aggregate(
          "sales" as any,
          {
            aggregate: { count: "*" },
            query: query.filter
              ? { filter: JSON.parse(query.filter as string) }
              : undefined,
          } as any
        )
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
      statusMessage: error?.message || "Failed to fetch sales",
    });
  }
});
