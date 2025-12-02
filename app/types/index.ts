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
  sales: Sale[];
  sale_items: SaleItem[];
  stock_movements: StockMovement[];
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

// Sale type matching Directus schema
export interface Sale {
  id: string;
  sale_date: string; // ISO date string
  sale_type: "online" | "counter"; // online or tezgah
  total_amount: number; // Decimal
  total_cost: number; // Decimal
  total_profit: number; // Decimal (total_amount - total_cost)
  notes?: string | null;
  sale_items?: SaleItem[] | null; // One-to-Many relation
  date_created?: string;
  date_updated?: string;
  user_created?: string;
  user_updated?: string;
}

// Sale Item type matching Directus schema
export interface SaleItem {
  id: string;
  sale: string | Sale; // Many-to-One: Sales
  product: string | Product; // Many-to-One: Products
  quantity: number; // Integer
  unit_price: number; // Decimal - Sales price at time of sale
  unit_cost: number; // Decimal - Cost price at time of sale
  subtotal: number; // Decimal (quantity * unit_price)
  cost_total: number; // Decimal (quantity * unit_cost)
  profit: number; // Decimal (subtotal - cost_total)
  date_created?: string;
  user_created?: string;
}

// Stock movement type matching Directus schema
export interface StockMovement {
  id: string;
  product: string | Product; // Many-to-One: Products
  movement_type: "in" | "out" | "adjustment";
  quantity: number; // Integer (positive for in, negative for out)
  reason: string; // e.g., "Satış", "Stok Girişi", "Düzeltme"
  related_sale?: string | Sale | null; // Many-to-One: Sales (optional)
  notes?: string | null;
  date_created?: string;
  user_created?: string;
}
