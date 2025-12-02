import {
  createDirectus,
  rest,
  readItems,
  readItem,
  createItem,
  updateItem,
} from "@directus/sdk";
import type {
  Product,
  Category,
  Sale,
  SaleItem,
  StockMovement,
  Schema,
} from "~/types";

export const useDirectus = () => {
  const config = useRuntimeConfig();
  const directusUrl = config.public.directusUrl || "";

  if (!directusUrl) {
    console.error(
      "❌ NUXT_PUBLIC_DIRECTUS_URL environment variable is not set. Please configure it in your .env file."
    );
  }

  const client = createDirectus<Schema>(directusUrl).with(rest());

  // Helper function to handle Directus errors
  async function handleDirectusRequest<T>(
    request: () => Promise<T>,
    fallback: T,
    silent = false
  ): Promise<T> {
    if (!directusUrl) {
      if (!silent) {
        console.warn("Directus URL not configured. Returning empty data.");
      }
      return fallback;
    }

    try {
      return await request();
    } catch (error: any) {
      if (!silent && process.env.NODE_ENV === "development") {
        const errorMessage = error?.message || "Unknown error";
        const errorStatus = error?.response?.status;

        if (
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("CORS")
        ) {
          console.error(
            "❌ CORS Hatası: Directus sunucusu localhost'tan gelen isteklere izin vermiyor. " +
              "Backend'de CORS ayarlarını kontrol edin veya API route kullanın."
          );
        } else if (errorStatus === 500) {
          console.warn(
            `Directus API error (500): ${errorMessage}. Collection may not exist or has permission issues.`
          );
        } else {
          console.error("Directus request failed:", errorMessage);
        }
      }
      return fallback;
    }
  }

  return {
    client,
    handleDirectusRequest,
  };
};
