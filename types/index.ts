// Ürün tipleri
export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  stock: number
  category: string
  sku: string
  createdAt: Date
  updatedAt: Date
}

// Sepet item tipi
export interface CartItem {
  product: Product
  quantity: number
}

// Sipariş tipi
export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: Date
}

// Kullanıcı tipi
export interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'admin'
  createdAt: Date
}

// Stok hareket tipi
export interface StockMovement {
  id: string
  productId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  createdAt: Date
  createdBy: string
}

