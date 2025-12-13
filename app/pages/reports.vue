<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-serif text-4xl font-light text-black mb-2">Raporlar</h1>
        <p class="text-gray-600">Günlük ve aylık kar-zarar analizi</p>
      </div>

      <!-- Daily Report -->
      <div class="mb-8">
        <h2 class="font-medium text-black mb-4 text-xl">
          Günlük Rapor - {{ new Date(today).toLocaleDateString("tr-TR") }}
        </h2>
        <AdminReportCard :report="dailyReport" type="daily" />
      </div>

      <!-- Monthly Report -->
      <div class="mb-8">
        <h2 class="font-medium text-black mb-4 text-xl">
          Aylık Rapor -
          {{
            new Date(currentYear, currentMonth - 1).toLocaleDateString(
              "tr-TR",
              {
                year: "numeric",
                month: "long",
              }
            )
          }}
        </h2>
        <AdminReportCard :report="monthlyReport" type="monthly" />
      </div>

      <!-- Sales Type Breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="font-medium text-black mb-4">
            Satış Tipi Dağılımı (Günlük)
          </h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">Online Satışlar</span>
                <span class="font-medium text-black">
                  {{ formatPrice(dailyReport.onlineAmount || 0) }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full"
                  :style="`width: ${
                    dailyReport.total_amount > 0
                      ? ((dailyReport.onlineAmount || 0) /
                          dailyReport.total_amount) *
                        100
                      : 0
                  }%`"
                ></div>
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ dailyReport.onlineCount || 0 }} satış
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">Tezgah Satışları</span>
                <span class="font-medium text-black">
                  {{ formatPrice(dailyReport.counterAmount || 0) }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-green-600 h-2 rounded-full"
                  :style="`width: ${
                    dailyReport.total_amount > 0
                      ? ((dailyReport.counterAmount || 0) /
                          dailyReport.total_amount) *
                        100
                      : 0
                  }%`"
                ></div>
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ dailyReport.counterCount || 0 }} satış
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="font-medium text-black mb-4">
            Satış Tipi Dağılımı (Aylık)
          </h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">Online Satışlar</span>
                <span class="font-medium text-black">
                  {{ formatPrice(monthlyReport.onlineAmount || 0) }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full"
                  :style="`width: ${
                    monthlyReport.total_amount > 0
                      ? (monthlyReport.onlineAmount /
                          monthlyReport.total_amount) *
                        100
                      : 0
                  }%`"
                ></div>
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ monthlyReport.onlineCount || 0 }} satış
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">Tezgah Satışları</span>
                <span class="font-medium text-black">
                  {{ formatPrice(monthlyReport.counterAmount || 0) }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-green-600 h-2 rounded-full"
                  :style="`width: ${
                    monthlyReport.total_amount > 0
                      ? (monthlyReport.counterAmount /
                          monthlyReport.total_amount) *
                        100
                      : 0
                  }%`"
                ></div>
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ monthlyReport.counterCount || 0 }} satış
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div
        v-if="monthlyReport.topProducts.length > 0"
        class="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div class="p-6 border-b border-gray-200">
          <h2 class="font-medium text-black">En Çok Satan Ürünler</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50">
                <th
                  class="text-left py-3 px-6 text-sm font-medium text-gray-600"
                >
                  Ürün
                </th>
                <th
                  class="text-right py-3 px-6 text-sm font-medium text-gray-600"
                >
                  Satılan Miktar
                </th>
                <th
                  class="text-right py-3 px-6 text-sm font-medium text-gray-600"
                >
                  Toplam Gelir
                </th>
                <th
                  class="text-right py-3 px-6 text-sm font-medium text-gray-600"
                >
                  Toplam Kar
                </th>
                <th
                  class="text-right py-3 px-6 text-sm font-medium text-gray-600"
                >
                  Kar Marjı
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in monthlyReport.topProducts"
                :key="item.product.id"
                class="border-b border-gray-100"
              >
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <span class="text-gray-400 text-sm">#{{ index + 1 }}</span>
                    <div>
                      <div class="font-medium text-black">
                        {{ item.product.name }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-right font-medium text-black">
                  {{ item.quantity }} adet
                </td>
                <td class="py-4 px-6 text-right font-medium text-black">
                  {{ formatPrice(item.revenue) }}
                </td>
                <td class="py-4 px-6 text-right font-medium text-green-600">
                  {{ formatPrice(item.profit || 0) }}
                </td>
                <td class="py-4 px-6 text-right font-medium text-gray-700">
                  {{
                    item.revenue > 0
                      ? ((item.profit / item.revenue) * 100).toFixed(1)
                      : "0.0"
                  }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from "~/utils";
import type { Product, Sale } from "~/types";

definePageMeta({
  layout: "admin",
});

const { getDailyReport, getMonthlyReport, getSales } = useSales();

const now = new Date();
const today =
  now.toISOString().split("T")[0] || now.toISOString().substring(0, 10);
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

// Use useAsyncData for SSR, but also fetch directly on client
const { data: dailyReportRaw } = await useAsyncData(
  "reports-page-daily",
  () => getDailyReport(today),
  {
    default: () => ({
      sales_count: 0,
      total_amount: 0,
      total_cost: 0,
      total_profit: 0,
    }),
    server: true,
    lazy: false,
  }
);

const { data: monthlyReportRaw } = await useAsyncData(
  "reports-page-monthly",
  () => getMonthlyReport(currentYear, currentMonth),
  {
    default: () => ({
      sales_count: 0,
      total_amount: 0,
      total_cost: 0,
      total_profit: 0,
      items: [],
      topProducts: [],
    }),
    server: true,
    lazy: false,
  }
);

// Calculate sales type breakdown for daily
const { data: dailySales } = await useAsyncData<{
  data: Sale[];
  total?: number;
}>(
  "reports-page-daily-sales",
  () =>
    getSales({
      sale_date: {
        _gte: `${today}T00:00:00`,
        _lte: `${today}T23:59:59`,
      },
    }),
  {
    default: () => ({ data: [] }),
    server: true,
    lazy: false,
  }
);

// Always fetch directly on mount (client-side navigation)
onMounted(async () => {
  if (process.client) {
    // Direct API calls to ensure network requests are made
    const [dailyReportData, monthlyReportData, dailySalesResult] =
      await Promise.all([
        getDailyReport(today),
        getMonthlyReport(currentYear, currentMonth),
        getSales({
          sale_date: {
            _gte: `${today}T00:00:00`,
            _lte: `${today}T23:59:59`,
          },
        }),
      ]);
    dailyReportRaw.value = dailyReportData;
    monthlyReportRaw.value = monthlyReportData;
    dailySales.value = dailySalesResult;
  }
});

const dailyReport = computed(() => {
  const sales = dailySales.value?.data || [];
  const dailyOnlineSales = sales.filter((s) => s.sale_type === "online");
  const dailyCounterSales = sales.filter((s) => s.sale_type === "counter");
  const raw = dailyReportRaw.value || {
    sales_count: 0,
    total_amount: 0,
    total_cost: 0,
    total_profit: 0,
  };

  return {
    ...raw,
    onlineAmount: dailyOnlineSales.reduce(
      (sum, s) => sum + (s.total_amount || 0),
      0
    ),
    onlineCount: dailyOnlineSales.length,
    counterAmount: dailyCounterSales.reduce(
      (sum, s) => sum + (s.total_amount || 0),
      0
    ),
    counterCount: dailyCounterSales.length,
  };
});

// Calculate sales type breakdown for monthly
const monthlyReport = computed(() => {
  const raw = monthlyReportRaw.value || {
    sales_count: 0,
    total_amount: 0,
    total_cost: 0,
    total_profit: 0,
    items: [],
    topProducts: [],
  };
  const monthlySales = raw.items || [];
  const monthlyOnlineSales = monthlySales.filter(
    (s) => s.sale_type === "online"
  );
  const monthlyCounterSales = monthlySales.filter(
    (s) => s.sale_type === "counter"
  );

  // Calculate profit for top products
  const topProductsWithProfit = (raw.topProducts || []).map((item: any) => {
    const productId =
      typeof item.product === "string" ? item.product : item.product?.id;
    const productSales = monthlySales
      .flatMap((sale) => sale.sale_items || [])
      .filter((saleItem: any) => {
        const saleItemProductId =
          typeof saleItem.product === "string"
            ? saleItem.product
            : saleItem.product?.id;
        return saleItemProductId === productId;
      });

    const profit = productSales.reduce(
      (sum: number, si: any) => sum + (si.profit || 0),
      0
    );

    return {
      ...item,
      profit,
    };
  });

  return {
    ...raw,
    onlineAmount: monthlyOnlineSales.reduce(
      (sum, s) => sum + (s.total_amount || 0),
      0
    ),
    onlineCount: monthlyOnlineSales.length,
    counterAmount: monthlyCounterSales.reduce(
      (sum, s) => sum + (s.total_amount || 0),
      0
    ),
    counterCount: monthlyCounterSales.length,
    topProducts: topProductsWithProfit,
  };
});

useSeoMeta({
  title: "Raporlar - Admin - Lumera",
});
</script>
