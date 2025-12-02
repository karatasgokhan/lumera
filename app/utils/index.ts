import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DirectusFile } from "~/types";

// Shadcn UI için cn fonksiyonu
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Yardımcı fonksiyonlar

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Generate Directus image URL
 * Handles both string IDs and DirectusFile objects
 */
export function getImageUrl(
  image: string | DirectusFile | null | undefined,
  transformations?: string
): string | null {
  if (!image) {
    return null;
  }

  const config = useRuntimeConfig();
  const apiUrl = config.public.directusUrl || "";

  if (!apiUrl) {
    console.warn("Directus API URL not configured. Image URLs will not work.");
    return null;
  }

  const fileId = typeof image === "string" ? image : image.id;

  if (!fileId) {
    return null;
  }

  const baseUrl = apiUrl.replace(/\/$/, "");
  const assetPath = `/assets/${fileId}`;
  const transformQuery = transformations || "";

  return `${baseUrl}${assetPath}${transformQuery}`;
}

/**
 * Generate Directus image URL with common transformations
 */
export function getImageUrlWithTransformations(
  image: string | DirectusFile | null | undefined,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    fit?: "cover" | "contain" | "inside" | "outside";
  }
): string | null {
  if (!image) {
    return null;
  }

  const params = new URLSearchParams();

  if (options?.width) {
    params.append("width", options.width.toString());
  }

  if (options?.height) {
    params.append("height", options.height.toString());
  }

  if (options?.quality) {
    params.append("quality", options.quality.toString());
  }

  if (options?.fit) {
    params.append("fit", options.fit);
  }

  const transformations = params.toString() ? `?${params.toString()}` : "";

  return getImageUrl(image, transformations);
}
