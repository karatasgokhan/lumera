<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-serif text-4xl font-light text-black mb-2">
          Satış İşaretleme
        </h1>
        <p class="text-gray-600">
          Tek tek veya toplu satış işaretle (Online veya Tezgah)
        </p>
      </div>

      <!-- Sale Form -->
      <div class="mb-8">
        <AdminSaleForm :products="productsData" />
      </div>

      <!-- Recent Sales -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div
          class="p-6 border-b border-gray-200 flex justify-between items-center"
        >
          <h2 class="font-medium text-black">Son Satışlar</h2>
          <div v-if="totalSales > 0" class="text-sm text-gray-600">
            Toplam {{ totalSales }} satış
          </div>
        </div>
        <AdminSalesTable :sales="sales" />

        <!-- Pagination -->
        <div
          v-if="totalSales > itemsPerPage"
          class="p-6 border-t border-gray-200 flex items-center justify-between"
        >
          <div class="text-sm text-gray-600">
            {{ (currentPage - 1) * itemsPerPage + 1 }} -
            {{ Math.min(currentPage * itemsPerPage, totalSales) }} arası, toplam
            {{ totalSales }} satış
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
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, Sale } from "~/types";

definePageMeta({
  layout: "admin",
});

const { getProducts } = useProducts();
const { getSales } = useSales();

// Pagination state
const itemsPerPage = 50;
const currentPage = ref(1);
const totalSales = ref(0);
const sales = ref<Sale[]>([]);
const isLoading = ref(false);

// Use useAsyncData for SSR, but also fetch directly on client
const { data: products } = await useAsyncData<{
  data: Product[];
  total?: number;
}>("sales-page-products", () => getProducts({ is_active: { _eq: true } }), {
  default: () => ({ data: [] }),
  server: true,
  lazy: false,
});

// Fetch sales with pagination
const fetchSales = async (page: number = 1) => {
  isLoading.value = true;
  if (process.env.NODE_ENV === "development") {
    console.log(`🔄 Fetching sales page ${page}...`);
  }
  try {
    const offset = (page - 1) * itemsPerPage;
    const result = await getSales(undefined, {
      limit: itemsPerPage,
      offset: offset,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Sales fetched:`, {
        count: result.data.length,
        total: result.total,
        page,
      });
    }

    sales.value = result.data;
    totalSales.value = result.total || result.data.length;
    currentPage.value = page;
  } catch (error) {
    console.error("❌ Error fetching sales:", error);
    sales.value = [];
    totalSales.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// Pagination helpers
const totalPages = computed(() => Math.ceil(totalSales.value / itemsPerPage));

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
    fetchSales(page);
  }
};

// Watch for route changes to refetch data on client-side navigation
const route = useRoute();
watch(
  () => route.path,
  () => {
    if (process.client) {
      fetchSales(1);
    }
  },
  { immediate: false }
);

// Always fetch directly on mount (client-side navigation)
onMounted(async () => {
  if (process.client) {
    console.log("🔄 Sales page mounted, fetching data...");
    const [productsResult] = await Promise.all([
      getProducts({ is_active: { _eq: true } }),
      fetchSales(1),
    ]);
    products.value = productsResult;
    console.log("✅ Sales page data fetched");
  }
});

// Extract products data for component
const productsData = computed(() => products.value?.data || []);

useSeoMeta({
  title: "Satış İşaretleme - Admin - Lumera",
});
</script>
