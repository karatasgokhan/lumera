// Directus File type (simplified)
export interface DirectusFile {
  id: string;
  title?: string | null;
  type?: string | null;
  width?: number | null;
  height?: number | null;
}

// Category type matching Directus schema
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | DirectusFile | null;
  date_created?: string;
  date_updated?: string;
}

// Product type matching Directus schema
export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  price: number; // Decimal - Sales Price
  discount_price?: number | null; // Decimal - Discounted Price
  cost_price?: number; // Decimal - NEVER expose this to UI
  stock_quantity: number;
  is_active: boolean;
  material?: string | null;
  category?: string | Category | null; // Many-to-One relation
  images?: string[] | DirectusFile[] | null; // Files relation
  date_created?: string;
  date_updated?: string;
  user_created?: string;
  user_updated?: string;
}

// Schema definition for Directus SDK type safety
export interface Schema {
  products: Product[];
  categories: Category[];
}

// Cart item type
export interface CartItem {
  product: Product;
  quantity: number;
}

// Order type
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
}

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  createdAt: Date;
}

// Stock movement type
export interface StockMovement {
  id: string;
  productId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  createdAt: Date;
  createdBy: string;
}
