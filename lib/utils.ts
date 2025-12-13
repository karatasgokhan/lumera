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
 *
 * @param image - Can be a string (file ID), DirectusFile object, or null/undefined
 * @param transformations - Optional Directus image transformations (e.g., '?width=800&quality=80')
 * @returns Full URL to the image asset, or null if no image provided
 *
 * @example
 * getImageUrl('abc-123-def') // Returns: 'https://api.example.com/assets/abc-123-def'
 * getImageUrl(fileObject, '?width=800') // Returns: 'https://api.example.com/assets/abc-123-def?width=800'
 */
export function getImageUrl(
  image: string | DirectusFile | null | undefined,
  transformations?: string
): string | null {
  // Return null if no image provided
  if (!image) {
    return null;
  }

  // Get the Directus API URL from environment
  const apiUrl =
    process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    console.warn("Directus API URL not configured. Image URLs will not work.");
    return null;
  }

  // Extract file ID from string or DirectusFile object
  const fileId = typeof image === "string" ? image : image.id;

  if (!fileId) {
    return null;
  }

  // Remove trailing slash from API URL if present
  const baseUrl = apiUrl.replace(/\/$/, "");

  // Build the asset URL
  const assetPath = `/assets/${fileId}`;
  const transformQuery = transformations || "";

  return `${baseUrl}${assetPath}${transformQuery}`;
}

/**
 * Generate Directus image URL with common transformations
 *
 * @param image - Can be a string (file ID), DirectusFile object, or null/undefined
 * @param width - Optional width in pixels
 * @param height - Optional height in pixels
 * @param quality - Optional quality (1-100)
 * @param fit - Optional fit mode: 'cover', 'contain', 'inside', 'outside'
 * @returns Full URL to the image asset with transformations, or null if no image provided
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
