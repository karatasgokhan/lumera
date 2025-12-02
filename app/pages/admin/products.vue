<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="font-serif text-4xl font-light text-black mb-2">
            Ürün Yönetimi
          </h1>
          <p class="text-gray-600">Ürün ekle, düzenle ve stok takibi yap</p>
        </div>
        <NuxtLink to="/admin" class="text-sm text-gray-600 hover:text-black">
          ← Dashboard'a Dön
        </NuxtLink>
      </div>

      <!-- Add Product Form -->
      <div class="mb-8">
        <AdminProductForm :categories="categories" />
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h2 class="font-medium text-black">Tüm Ürünler</h2>
        </div>
        <div v-if="products.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50">
                <th
                  class="text-left py-3 px-6 text-sm font-medium text-gray-600"
                >
                  Ürün Adı
                </th>
                <th
                  class="text-left py-3 px-6 text-sm font-medium text-gray-600"
                >
                  SKU
                </th>
                <th
                  class="text-left py-3 px-6 text-sm font-medium text-gray-600"
                >
                  Kategori
                </th>
                <th
                  class="text-right py-3 px-6 text-sm font-medium text-gray-600"
                >
                  Maliyet
                </th>
                <th
                  class="text-right py-3 px-6 text-sm font-medium text-gray-600"
                >
                  Satış Fiyatı
                </th>
                <th
                  class="text-right py-3 px-6 text-sm font-medium text-gray-600"
                >
                  Stok
                </th>
                <th
                  class="text-center py-3 px-6 text-sm font-medium text-gray-600"
                >
                  Durum
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in products"
                :key="product.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-4 px-6">
                  <div class="font-medium text-black">{{ product.name }}</div>
                  <div
                    v-if="product.description"
                    class="text-sm text-gray-500 mt-1 line-clamp-1"
                  >
                    {{ product.description }}
                  </div>
                </td>
                <td class="py-4 px-6 text-sm text-gray-700">
                  {{ product.sku }}
                </td>
                <td class="py-4 px-6 text-sm text-gray-700">
                  {{
                    typeof product.category === "object" && product.category
                      ? product.category.name
                      : "-"
                  }}
                </td>
                <td
                  class="py-4 px-6 text-sm text-right font-medium text-gray-700"
                >
                  {{ formatPrice(product.cost_price ?? 0) }}
                </td>
                <td class="py-4 px-6 text-sm text-right font-medium text-black">
                  {{ formatPrice(product.price) }}
                </td>
                <td class="py-4 px-6 text-right">
                  <span
                    :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock_quantity > 10
                        ? 'bg-green-100 text-green-800'
                        : product.stock_quantity > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`"
                  >
                    {{ product.stock_quantity }}
                  </span>
                </td>
                <td class="py-4 px-6 text-center">
                  <span
                    :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`"
                  >
                    {{ product.is_active ? "Aktif" : "Pasif" }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="p-12 text-center">
          <p class="text-gray-500">Henüz ürün eklenmemiş</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, Category } from "~/types";
import { formatPrice } from "~/utils";

const { getProducts } = useProducts();
const { getCategories } = useCategories();

const products: Product[] = await getProducts();
const categories: Category[] = await getCategories();

useSeoMeta({
  title: "Ürün Yönetimi - Admin - Lumera",
});
</script>
