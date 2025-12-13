import {
  createDirectus,
  rest,
  staticToken,
  updateItem,
  readItem,
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

  const body = await readBody(event);

  // Create authenticated client for server-side operations
  let client = createDirectus<Schema>(directusUrl).with(rest());
  if (staticTokenValue) {
    client = client.with(staticToken(staticTokenValue));
  }

  // Normalize URL: remove trailing slash
  let normalizedUrl = directusUrl;
  if (normalizedUrl.endsWith("/")) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }

  // Separate images field (M2M) from other fields
  const { images, ...otherFields } = body;

  try {
    // Update product fields (excluding images)
    let response: any;
    if (Object.keys(otherFields).length > 0) {
      response = await client.request(updateItem("products", id, otherFields));
    } else {
      // If only images are being updated, fetch the product first
      response = await client.request(readItem("products", id));
    }

    // Update images field separately using junction collection (M2M relationships)
    if (images !== undefined) {
      // Get existing relationships
      const existingRelationsResponse = await fetch(
        `${normalizedUrl}/items/products_files?filter[products_id][_eq]=${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${staticTokenValue}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (existingRelationsResponse.ok) {
        const existingRelations = await existingRelationsResponse.json();
        const existingIds = existingRelations.data?.map((r: any) => r.id) || [];

        // Delete existing relationships
        if (existingIds.length > 0) {
          // Directus DELETE: use body with keys array
          const deleteResponse = await fetch(
            `${normalizedUrl}/items/products_files`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${staticTokenValue}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ keys: existingIds }),
            }
          );

          if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            // Log but don't throw - continue with creating new relationships
            console.warn(
              `Failed to delete existing image relationships: ${errorText}`
            );
          }
        }
      }

      // Create new relationships
      const imageIdsArray = Array.isArray(images)
        ? images
        : images
        ? [images]
        : [];

      if (imageIdsArray.length > 0) {
        const newRelations = imageIdsArray.map(
          (fileId: string, index: number) => ({
            products_id: id,
            directus_files_id: fileId,
            sort: index + 1,
          })
        );

        // Directus batch create expects array in body
        const createResponse = await fetch(
          `${normalizedUrl}/items/products_files`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${staticTokenValue}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newRelations),
          }
        );

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(
            `Failed to create image relationships: ${createResponse.status} ${errorText}`
          );
        }
      }

      const imagesUpdateData = { data: response };

      // Merge the response (Directus returns { data: {...} })
      response = {
        ...response,
        ...(imagesUpdateData?.data || imagesUpdateData),
      };
    }

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.status || 500,
      statusMessage: error?.message || "Failed to update product",
    });
  }
});
