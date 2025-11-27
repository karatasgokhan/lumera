import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Shadcn UI için cn fonksiyonu
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Yardımcı fonksiyonlar

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(price)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

