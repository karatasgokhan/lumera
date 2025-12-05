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
      statusMessage: "Sale ID is required",
    });
  }

  const query = getQuery(event);
  let client = createDirectus<Schema>(directusUrl).with(rest());

  // Add static token authentication if available (for server-side operations)
  if (staticTokenValue) {
    client = client.with(staticToken(staticTokenValue));
  }

  // Default fields - exclude alias fields unless explicitly requested
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
  };

  try {
    const sale = await client.request(
      readItem("sales" as any, id, queryParams)
    );
    return sale;
  } catch (error: any) {
    if (error?.response?.status === 404 || error?.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: "Sale not found",
      });
    }
    throw createError({
      statusCode: error?.response?.status || error?.status || 500,
      statusMessage: error?.message || "Failed to fetch sale",
    });
  }
});
