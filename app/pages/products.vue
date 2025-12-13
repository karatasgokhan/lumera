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
        <AdminProductForm
          v-if="!editingProductId"
          :categories="categories"
          @saved="handleProductSaved"
        />
      </div>

      <!-- Edit Product Form Modal -->
      <div
        v-if="editingProductId"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeEditModal"
      >
        <div
          class="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div
            class="p-6 border-b border-gray-200 flex justify-between items-center"
          >
            <h2 class="font-medium text-black text-lg">Ürün Düzenle</h2>
            <button
              @click="closeEditModal"
              class="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <div class="p-6 overflow-y-auto flex-1">
            <AdminProductForm
              :categories="categories"
              :product="editingProductId"
              @saved="handleProductSaved"
              @cancelled="closeEditModal"
            />
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Arama
            </label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Ürün adı veya açıklama ile ara..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              @input="handleSearch"
            />
          </div>

          <!-- Category Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              v-model="selectedCategory"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              @change="applyFilters"
            >
              <option value="">Tüm Kategoriler</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Durum
            </label>
            <select
              v-model="selectedStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              @change="applyFilters"
            >
              <option value="">Tümü</option>
              <option value="true">Aktif</option>
              <option value="false">Pasif</option>
            </select>
          </div>
        </div>

        <!-- Stock Filter -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Stok Durumu
          </label>
          <div class="flex gap-4">
            <label class="flex items-center">
              <input
                v-model="stockFilter"
                type="radio"
                value=""
                class="mr-2"
                @change="applyFilters"
              />
              <span class="text-sm text-gray-700">Tümü</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="stockFilter"
                type="radio"
                value="in_stock"
                class="mr-2"
                @change="applyFilters"
              />
              <span class="text-sm text-gray-700">Stokta Var</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="stockFilter"
                type="radio"
                value="low_stock"
                class="mr-2"
                @change="applyFilters"
              />
              <span class="text-sm text-gray-700">Stok Az</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="stockFilter"
                type="radio"
                value="out_of_stock"
                class="mr-2"
                @change="applyFilters"
              />
              <span class="text-sm text-gray-700">Stokta Yok</span>
            </label>
          </div>
        </div>

        <!-- Clear Filters Button -->
        <div v-if="hasActiveFilters" class="mt-4">
          <button
            @click="clearFilters"
            class="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Filtreleri Temizle
          </button>
        </div>
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div
          class="p-6 border-b border-gray-200 flex justify-between items-center"
        >
          <h2 class="font-medium text-black">Tüm Ürünler</h2>
          <div v-if="totalProducts > 0" class="text-sm text-gray-600">
            Toplam {{ totalProducts }} ürün
          </div>
        </div>
        <div v-if="products && products.length > 0" class="overflow-x-auto">
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
                <th
                  class="text-center py-3 px-6 text-sm font-medium text-gray-600"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in products || []"
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
                  <div class="flex items-center justify-center gap-2">
                    <Switch
                      :model-value="product.is_active"
                      :disabled="isTogglingStatus === product.id"
                      @update:model-value="toggleProductStatus(product)"
                    />
                    <span
                      :class="`text-xs font-medium ${
                        product.is_active ? 'text-green-700' : 'text-gray-600'
                      }`"
                    >
                      {{ product.is_active ? "Aktif" : "Pasif" }}
                    </span>
                  </div>
                </td>
                <td class="py-4 px-6 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="openEditModal(product)"
                      class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Düzenle
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else-if="!isLoading" class="p-12 text-center">
          <p class="text-gray-500">
            {{
              hasActiveFilters
                ? "Arama kriterlerinize uygun ürün bulunamadı"
                : "Henüz ürün eklenmemiş"
            }}
          </p>
        </div>
        <div v-else class="p-12 text-center">
          <p class="text-gray-500">Yükleniyor...</p>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalProducts > itemsPerPage"
          class="p-6 border-t border-gray-200 flex items-center justify-between"
        >
          <div class="text-sm text-gray-600">
            {{ (currentPage - 1) * itemsPerPage + 1 }} -
            {{ Math.min(currentPage * itemsPerPage, totalProducts) }} arası,
            toplam {{ totalProducts }} ürün
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              :class="`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`"
            >
              Önceki
            </button>
            <div class="flex items-center gap-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  page === currentPage
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`"
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`"
            >
              Sonraki
            </button>
          </div>
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
import Switch from "~/components/ui/Switch.vue";

definePageMeta({
  layout: "admin",
});

const { getProducts } = useProducts();
const { getCategories } = useCategories();
const { getStockMovements } = useStockMovements();

// Pagination state
const itemsPerPage = 20;
const currentPage = ref(1);
const totalProducts = ref(0);
const products = ref<Product[]>([]);
const isLoading = ref(false);

// Search and filter state
const searchQuery = ref("");
const selectedCategory = ref("");
const selectedStatus = ref("");
const stockFilter = ref("");
const searchTimeout = ref<NodeJS.Timeout | null>(null);

// Use useAsyncData for SSR, but also fetch directly on client
const { data: categories } = await useAsyncData<Category[]>(
  "products-page-categories",
  () => getCategories(),
  {
    default: () => [],
    server: true,
    lazy: false,
  }
);

// Build filters from search and filter state
const buildFilters = () => {
  const filters: any = {};
  const conditions: any[] = [];

  // Search filter - search in name and description
  if (searchQuery.value.trim()) {
    conditions.push({
      _or: [
        {
          name: {
            _icontains: searchQuery.value.trim(),
          },
        },
        {
          description: {
            _icontains: searchQuery.value.trim(),
          },
        },
      ],
    });
  }

  // Category filter
  if (selectedCategory.value) {
    conditions.push({
      category: {
        _eq: selectedCategory.value,
      },
    });
  }

  // Status filter
  if (selectedStatus.value !== "") {
    conditions.push({
      is_active: {
        _eq: selectedStatus.value === "true",
      },
    });
  }

  // Stock filter
  if (stockFilter.value) {
    if (stockFilter.value === "in_stock") {
      conditions.push({
        stock_quantity: {
          _gt: 10,
        },
      });
    } else if (stockFilter.value === "low_stock") {
      // Use _and for range condition (0 < stock <= 10)
      conditions.push({
        _and: [
          {
            stock_quantity: {
              _gt: 0,
            },
          },
          {
            stock_quantity: {
              _lte: 10,
            },
          },
        ],
      });
    } else if (stockFilter.value === "out_of_stock") {
      conditions.push({
        stock_quantity: {
          _eq: 0,
        },
      });
    }
  }

  // Combine all conditions with _and if there are multiple
  if (conditions.length === 0) {
    return undefined;
  } else if (conditions.length === 1) {
    return conditions[0];
  } else {
    // Flatten nested _and conditions if needed
    const flattenedConditions: any[] = [];
    conditions.forEach((condition) => {
      if (condition._and && Array.isArray(condition._and)) {
        // If condition is already an _and, merge its conditions
        flattenedConditions.push(...condition._and);
      } else {
        flattenedConditions.push(condition);
      }
    });
    return {
      _and: flattenedConditions,
    };
  }
};

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() !== "" ||
    selectedCategory.value !== "" ||
    selectedStatus.value !== "" ||
    stockFilter.value !== ""
  );
});

// Fetch products with pagination and filters
const fetchProducts = async (page: number = 1) => {
  isLoading.value = true;
  if (process.env.NODE_ENV === "development") {
    console.log(`🔄 Fetching products page ${page}...`);
  }
  try {
    const offset = (page - 1) * itemsPerPage;
    const filters = buildFilters();
    const result = await getProducts(filters, {
      limit: itemsPerPage,
      offset: offset,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Products fetched:`, {
        count: result.data.length,
        total: result.total,
        page,
        filters,
      });
    }

    products.value = result.data;
    totalProducts.value = result.total || result.data.length;
    currentPage.value = page;
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    products.value = [];
    totalProducts.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// Handle search with debounce
const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    fetchProducts(1);
  }, 500);
};

// Apply filters
const applyFilters = () => {
  currentPage.value = 1;
  fetchProducts(1);
};

// Clear all filters
const clearFilters = () => {
  searchQuery.value = "";
  selectedCategory.value = "";
  selectedStatus.value = "";
  stockFilter.value = "";
  currentPage.value = 1;
  fetchProducts(1);
};

// Pagination helpers
const totalPages = computed(() =>
  Math.ceil(totalProducts.value / itemsPerPage)
);

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    fetchProducts(page);
  }
};

// Watch for route changes to refetch data on client-side navigation
const route = useRoute();
watch(
  () => route.path,
  () => {
    if (process.client) {
      fetchProducts(1);
    }
  },
  { immediate: false }
);

// Initialize from SSR data if available, then fetch on client
onMounted(async () => {
  if (process.client) {
    console.log("🔄 Products page mounted, fetching data...");
    // Always fetch on client-side navigation to ensure fresh data
    await Promise.all([
      fetchProducts(1),
      (async () => {
        const categoriesData = await getCategories();
        if (categoriesData) {
          categories.value = categoriesData;
        }
      })(),
    ]);
    console.log("✅ Products page data fetched");
  }
});

const selectedProductId = ref<string | null>(null);
const stockMovements = ref<StockMovement[]>([]);
const editingProductId = ref<string | null>(null);
const isTogglingStatus = ref<string | null>(null);

const { updateProduct } = useProducts();

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

const openEditModal = (product: Product) => {
  editingProductId.value = product.id;
};

const closeEditModal = () => {
  editingProductId.value = null;
};

const handleProductSaved = async () => {
  editingProductId.value = null;
  // Refresh products list
  await fetchProducts(currentPage.value);
};

const toggleProductStatus = async (product: Product) => {
  if (isTogglingStatus.value === product.id) return;

  const newStatus = !product.is_active;

  isTogglingStatus.value = product.id;
  try {
    await updateProduct(product.id, {
      is_active: newStatus,
    });
    // Update local state immediately for better UX
    const productIndex = products.value.findIndex((p) => p.id === product.id);
    if (productIndex !== -1 && products.value[productIndex]) {
      products.value[productIndex].is_active = newStatus;
    }
  } catch (error) {
    console.error("Error toggling product status:", error);
    alert("Ürün durumu güncellenirken bir hata oluştu");
    // Revert switch on error - find product and revert status
    const productIndex = products.value.findIndex((p) => p.id === product.id);
    if (productIndex !== -1 && products.value[productIndex]) {
      products.value[productIndex].is_active = product.is_active;
    }
  } finally {
    isTogglingStatus.value = null;
  }
};

useSeoMeta({
  title: "Ürün Yönetimi - Admin - Lumera",
});
</script>
