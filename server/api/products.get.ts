import {
  createDirectus,
  rest,
  staticToken,
  readItems,
  aggregate,
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

  // Create authenticated client for server-side operations
  let client = createDirectus<Schema>(directusUrl).with(rest());
  if (staticTokenValue) {
    client = client.with(staticToken(staticTokenValue));
  }

  // Default fields with category relation expanded and images M2M relation
  // For M2M images, Directus returns file IDs directly as an array
  const defaultFields = [
    "*",
    "category.id",
    "category.name",
    "category.slug",
    "images",
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
    // Fetch data and total count in parallel
    const [dataResponse, countResponse] = await Promise.all([
      client.request(readItems("products", queryParams)),
      client.request(
        aggregate(
          "products" as any,
          {
            aggregate: { count: "*" },
            query: query.filter
              ? { filter: JSON.parse(query.filter as string) }
              : undefined,
          } as any
        ) as any
      ),
    ]);

    // Extract total count from aggregate response
    const total =
      Array.isArray(countResponse) && countResponse.length > 0
        ? (countResponse[0] as any)?.count?.["*"] || 0
        : 0;

    // Expand images M2M field manually if SDK doesn't return it
    // Directus SDK sometimes doesn't expand M2M alias fields in readItems
    const normalizedUrl = directusUrl.replace(/\/$/, "");
    const productsWithImages = Array.isArray(dataResponse)
      ? await Promise.all(
          dataResponse.map(async (product: any) => {
            // Always expand images: SDK may return junction IDs or file IDs
            // Directus M2M returns junction table IDs, we need to convert them to file IDs
            try {
              // Fetch junction items to get file IDs
              const junctionItems = await client.request(
                readItems("products_files" as any, {
                  filter: {
                    products_id: { _eq: product.id },
                  },
                  fields: ["id", "directus_files_id"],
                  sort: ["sort"],
                })
              );

              // Extract file IDs from junction items
              if (Array.isArray(junctionItems) && junctionItems.length > 0) {
                product.images = junctionItems.map(
                  (item: any) => item.directus_files_id
                );
              } else {
                // No junction items found, set empty array
                product.images = [];
              }
            } catch (error: any) {
              console.warn(
                `Failed to fetch images for product ${product.id}:`,
                error
              );
              // Set empty array on error
              product.images = [];
            }
            return product;
          })
        )
      : dataResponse;

    // Return response with meta (matching Directus format)
    return {
      data: Array.isArray(productsWithImages)
        ? productsWithImages
        : productsWithImages,
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
