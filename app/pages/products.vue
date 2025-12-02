<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-serif text-4xl font-light text-black mb-2">
          Ürün Yönetimi
        </h1>
        <p class="text-gray-600">Ürün ekle, düzenle ve stok takibi yap</p>
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
                  Görsel
                </th>
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
                  <div
                    class="w-16 h-16 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center"
                  >
                    <img
                      v-if="getProductImage(product)"
                      :src="getProductImage(product) || ''"
                      :alt="product.name"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-gray-400 text-xs">Görsel Yok</span>
                  </div>
                </td>
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
                  <button
                    @click="openStockHistory(product.id)"
                    :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                      product.stock_quantity > 10
                        ? 'bg-green-100 text-green-800'
                        : product.stock_quantity > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`"
                  >
                    {{ product.stock_quantity }}
                  </button>
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

      <!-- Stock History Modal -->
      <div
        v-if="selectedProductId"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="closeStockHistory"
      >
        <div
          class="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        >
          <div
            class="p-6 border-b border-gray-200 flex justify-between items-center"
          >
            <h2 class="font-medium text-black text-lg">Stok Geçmişi</h2>
            <button
              @click="closeStockHistory"
              class="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div class="p-6 overflow-y-auto flex-1">
            <div v-if="stockMovements.length > 0" class="space-y-3">
              <div
                v-for="movement in stockMovements"
                :key="movement.id"
                class="border border-gray-200 rounded-md p-4"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-medium text-black">
                      {{ getMovementTypeLabel(movement.movement_type) }}
                    </div>
                    <div class="text-sm text-gray-600 mt-1">
                      {{ movement.reason }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{
                        new Date(movement.date_created || "").toLocaleString(
                          "tr-TR"
                        )
                      }}
                    </div>
                    <div
                      v-if="movement.notes"
                      class="text-sm text-gray-500 mt-1"
                    >
                      {{ movement.notes }}
                    </div>
                  </div>
                  <div
                    :class="`text-lg font-medium ${
                      movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`"
                  >
                    {{ movement.quantity > 0 ? "+" : ""
                    }}{{ movement.quantity }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-gray-500 py-8">
              Bu ürün için stok hareketi kaydı bulunmamaktadır.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, Category, DirectusFile, StockMovement } from "~/types";
import { formatPrice, getImageUrl } from "~/utils";
import { useStockMovements } from "~/composables/useStockMovements";

definePageMeta({
  layout: "admin",
});

const { getProducts } = useProducts();
const { getCategories } = useCategories();
const { getStockMovements } = useStockMovements();

const products: Product[] = await getProducts();
const categories: Category[] = await getCategories();

const selectedProductId = ref<string | null>(null);
const stockMovements = ref<StockMovement[]>([]);

const getProductImage = (product: Product): string | null => {
  if (!product.images || product.images.length === 0) return null;

  const firstImage = product.images[0];
  if (typeof firstImage === "string") {
    return getImageUrl(firstImage, "?width=128&height=128&fit=cover") || null;
  }
  if (firstImage && typeof firstImage === "object" && "id" in firstImage) {
    return (
      getImageUrl(
        firstImage as DirectusFile,
        "?width=128&height=128&fit=cover"
      ) || null
    );
  }
  return null;
};

const openStockHistory = async (productId: string) => {
  selectedProductId.value = productId;
  stockMovements.value = await getStockMovements(productId);
};

const closeStockHistory = () => {
  selectedProductId.value = null;
  stockMovements.value = [];
};

const getMovementTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    in: "Stok Girişi",
    out: "Stok Çıkışı",
    adjustment: "Stok Düzeltmesi",
  };
  return labels[type] || type;
};

useSeoMeta({
  title: "Ürün Yönetimi - Admin - Lumera",
});
</script>
