import { createDirectus, rest, createItem } from "@directus/sdk";
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

  const body = await readBody(event);
  const client = createDirectus<Schema>(directusUrl).with(rest());

  try {
    const response = await client.request(createItem("products", body));
    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.status || 500,
      statusMessage: error?.message || "Failed to create product",
    });
  }
});
