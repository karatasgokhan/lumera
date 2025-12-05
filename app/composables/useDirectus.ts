import {
  createDirectus,
  rest,
  staticToken,
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
  let directusUrl = config.public.directusUrl || "";
  // Only access staticToken on server-side (it's not available on client)
  const staticTokenValue = process.server
    ? config.directusStaticToken
    : undefined;

  // Normalize URL: remove trailing slash
  if (directusUrl.endsWith("/")) {
    directusUrl = directusUrl.slice(0, -1);
  }

  if (!directusUrl) {
    console.error(
      "❌ NUXT_PUBLIC_DIRECTUS_URL environment variable is not set. Please configure it in your .env file."
    );
  } else {
    // Log in both dev and production for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`🔗 Directus URL: ${directusUrl}`, {
        isServer: process.server,
        isClient: process.client,
        hasToken: !!staticTokenValue,
      });
    }
  }

  let client = createDirectus<Schema>(directusUrl).with(rest());

  // Add static token authentication on server-side (for authenticated operations)
  if (process.server && staticTokenValue) {
    client = client.with(staticToken(staticTokenValue));
  }

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
      if (!silent) {
        const errorMessage = error?.message || "Unknown error";
        const errorStatus = error?.response?.status || error?.status;
        const errorUrl = error?.config?.url || error?.request?.url || "unknown";

        if (process.env.NODE_ENV === "development") {
          console.error("❌ Directus API Error:", {
            message: errorMessage,
            status: errorStatus,
            url: errorUrl,
            directusUrl: directusUrl,
            error: error,
          });
        }

        if (
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("CORS") ||
          errorMessage.includes("NetworkError")
        ) {
          console.error(
            "❌ CORS/Network Hatası: Directus sunucusuna bağlanılamıyor. " +
              `URL: ${directusUrl}. ` +
              "Backend'de CORS ayarlarını kontrol edin veya server-side API route kullanın."
          );
        } else if (errorStatus === 401 || errorStatus === 403) {
          console.error(
            `❌ Authentication Error (${errorStatus}): Directus API'ye erişim için yetkilendirme gerekli olabilir.`
          );
        } else if (errorStatus === 404) {
          console.warn(
            `⚠️ Not Found (404): Collection veya endpoint bulunamadı. URL: ${errorUrl}`
          );
        } else if (errorStatus === 500) {
          console.warn(
            `⚠️ Server Error (500): ${errorMessage}. Collection may not exist or has permission issues.`
          );
        } else {
          console.error(
            `❌ Directus request failed (${errorStatus || "unknown"}):`,
            errorMessage
          );
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
