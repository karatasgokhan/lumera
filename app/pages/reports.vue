<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="mb-6">
          <h1 class="font-serif text-4xl font-light text-black mb-2">
            Raporlar
          </h1>
          <p class="text-gray-600">
            Detaylı kar-zarar analizi ve satış raporları
          </p>
        </div>

        <!-- Report Type Selector (Segmented Control) -->
        <div class="bg-white rounded-lg shadow-sm p-1 mb-4 inline-flex">
          <button
            v-for="type in reportTypes"
            :key="type.value"
            @click="reportType = type.value"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap',
              reportType === type.value
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-700 hover:text-black hover:bg-gray-100',
            ]"
          >
            {{ type.label }}
          </button>
        </div>

        <!-- Date Selectors based on Report Type -->
        <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div class="flex flex-col md:flex-row gap-4 items-end">
            <!-- Daily Report Date Selector -->
            <div v-if="reportType === 'daily'" class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tarih
              </label>
              <input
                v-model="selectedDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                :max="today"
              />
            </div>

            <!-- Weekly Report Date Selector -->
            <div v-if="reportType === 'weekly'" class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Hafta Seç
              </label>
              <input
                v-model="selectedDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                :max="today"
              />
            </div>

            <!-- Monthly Report Date Selector -->
            <div v-if="reportType === 'monthly'" class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ay Seç
              </label>
              <input
                v-model="selectedMonthYear"
                type="month"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                :max="currentMonthYear"
              />
            </div>

            <!-- Yearly Report Date Selector -->
            <div v-if="reportType === 'yearly'" class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Yıl Seç
              </label>
              <input
                v-model="selectedYear"
                type="number"
                :min="2020"
                :max="currentYear"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>

            <!-- Custom Range Date Selector -->
            <template v-if="reportType === 'custom'">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Tarihi
                </label>
                <input
                  v-model="dateRange.start"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  :max="dateRange.end || today"
                />
              </div>
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  v-model="dateRange.end"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  :min="dateRange.start"
                  :max="today"
                />
              </div>
            </template>

            <!-- Preset Shortcuts -->
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="preset in presets"
                :key="preset.label"
                @click="applyPreset(preset)"
                class="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="mb-8 text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"
        ></div>
        <p class="text-gray-600 mt-4">Raporlar yükleniyor...</p>
      </div>

      <!-- Report Content -->
      <div v-else>
        <!-- Report Header -->
        <div class="mb-6">
          <h2 class="font-medium text-black text-xl mb-2">
            {{ reportTitle }}
          </h2>
          <p class="text-gray-600 text-sm">{{ reportSubtitle }}</p>
        </div>

        <!-- Report Card -->
        <div class="mb-8">
          <AdminReportCard :report="currentReport" :type="reportType" />
        </div>

        <!-- Sales Type Breakdown -->
        <div
          v-if="currentReport.onlineAmount !== undefined"
          class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-medium text-black mb-4">Online Satışlar</h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Toplam Gelir</span>
                <span class="font-medium text-black">
                  {{ formatPrice(currentReport.onlineAmount || 0) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Satış Sayısı</span>
                <span class="font-medium text-black">
                  {{ currentReport.onlineCount || 0 }} satış
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all"
                  :style="`width: ${
                    currentReport.total_amount > 0
                      ? ((currentReport.onlineAmount || 0) /
                          currentReport.total_amount) *
                        100
                      : 0
                  }%`"
                ></div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-medium text-black mb-4">Tezgah Satışları</h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Toplam Gelir</span>
                <span class="font-medium text-black">
                  {{ formatPrice(currentReport.counterAmount || 0) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Satış Sayısı</span>
                <span class="font-medium text-black">
                  {{ currentReport.counterCount || 0 }} satış
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  class="bg-green-600 h-2 rounded-full transition-all"
                  :style="`width: ${
                    currentReport.total_amount > 0
                      ? ((currentReport.counterAmount || 0) /
                          currentReport.total_amount) *
                        100
                      : 0
                  }%`"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div
          v-if="
            currentReport.topProducts && currentReport.topProducts.length > 0
          "
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
                  v-for="(item, index) in currentReport.topProducts"
                  :key="item.product.id"
                  class="border-b border-gray-100"
                >
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <span class="text-gray-400 text-sm"
                        >#{{ index + 1 }}</span
                      >
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
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from "~/utils";
import type { Product, Sale } from "~/types";

definePageMeta({
  layout: "admin",
});

const {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getYearlyReport,
  getCustomRangeReport,
  getSales,
} = useSales();

// Helper function to safely get date string
const getDateString = (date: Date): string => {
  return (
    date.toISOString().split("T")[0] || date.toISOString().substring(0, 10)
  );
};

const now = new Date();
const today = getDateString(now);
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const currentMonthYear = `${currentYear}-${String(currentMonth).padStart(
  2,
  "0"
)}`;

// Report Types
type ReportType = "daily" | "weekly" | "monthly" | "yearly" | "custom";

const reportTypes: Array<{ value: ReportType; label: string }> = [
  { value: "daily", label: "Günlük" },
  { value: "weekly", label: "Haftalık" },
  { value: "monthly", label: "Aylık" },
  { value: "yearly", label: "Yıllık" },
  { value: "custom", label: "Özel Aralık" },
];

const reportType = ref<ReportType>("daily");

// Date selectors
const selectedDate = ref(today);
const selectedMonthYear = ref(currentMonthYear);
const selectedYear = ref(currentYear);
const dateRange = ref({
  start: today,
  end: today,
});

// Calculate current week number (week 1 starts on January 1st)
const getWeekNumber = (date: Date | string): number => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const jan1 = new Date(dateObj.getFullYear(), 0, 1);
  const daysDiff = Math.floor(
    (dateObj.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.floor(daysDiff / 7) + 1;
};

// Preset shortcuts
const presets = computed(() => {
  const todayDate = new Date();
  const presetsList = [
    {
      label: "Bugün",
      action: () => {
        selectedDate.value = today;
        reportType.value = "daily";
      },
    },
    {
      label: "Bu Hafta",
      action: () => {
        const weekStart = new Date(todayDate);
        weekStart.setDate(todayDate.getDate() - todayDate.getDay());
        selectedDate.value = getDateString(weekStart);
        reportType.value = "weekly";
      },
    },
    {
      label: "Bu Ay",
      action: () => {
        selectedMonthYear.value = currentMonthYear;
        reportType.value = "monthly";
      },
    },
    {
      label: "Bu Yıl",
      action: () => {
        selectedYear.value = currentYear;
        reportType.value = "yearly";
      },
    },
    {
      label: "Son 7 Gün",
      action: () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);
        dateRange.value = {
          start: getDateString(startDate),
          end: getDateString(endDate),
        };
        reportType.value = "custom";
      },
    },
    {
      label: "Son 30 Gün",
      action: () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 29);
        dateRange.value = {
          start: getDateString(startDate),
          end: getDateString(endDate),
        };
        reportType.value = "custom";
      },
    },
  ];

  return presetsList;
});

const applyPreset = (preset: { action: () => void }) => {
  preset.action();
};

// Reactive data refs
const currentReport = ref<{
  sales_count: number;
  total_amount: number;
  total_cost: number;
  total_profit: number;
  items?: Sale[];
  topProducts?: Array<{
    product: Product;
    quantity: number;
    revenue: number;
    profit: number;
  }>;
  onlineAmount?: number;
  onlineCount?: number;
  counterAmount?: number;
  counterCount?: number;
}>({
  sales_count: 0,
  total_amount: 0,
  total_cost: 0,
  total_profit: 0,
  items: [],
  topProducts: [],
});

const isLoading = ref(false);

// Report title and subtitle
const reportTitle = computed(() => {
  switch (reportType.value) {
    case "daily":
      return `Günlük Rapor - ${new Date(selectedDate.value).toLocaleDateString(
        "tr-TR"
      )}`;
    case "weekly":
      return `Haftalık Rapor - ${getWeekRangeText(selectedDate.value)}`;
    case "monthly":
      const [year, month] = selectedMonthYear.value.split("-");
      if (!year || !month) return "Aylık Rapor";
      return `Aylık Rapor - ${new Date(
        parseInt(year),
        parseInt(month) - 1
      ).toLocaleDateString("tr-TR", { year: "numeric", month: "long" })}`;
    case "yearly":
      return `Yıllık Rapor - ${selectedYear.value}`;
    case "custom":
      return `Özel Aralık Raporu`;
    default:
      return "Rapor";
  }
});

const reportSubtitle = computed(() => {
  switch (reportType.value) {
    case "daily":
      return "Seçilen gün için detaylı satış analizi";
    case "weekly":
      return "Seçilen hafta için detaylı satış analizi";
    case "monthly":
      return "Seçilen ay için detaylı satış analizi";
    case "yearly":
      return "Seçilen yıl için detaylı satış analizi";
    case "custom":
      if (!dateRange.value.start || !dateRange.value.end) {
        return "Özel aralık için başlangıç ve bitiş tarihlerini seçin";
      }
      return `${new Date(dateRange.value.start).toLocaleDateString(
        "tr-TR"
      )} - ${new Date(dateRange.value.end).toLocaleDateString(
        "tr-TR"
      )} tarihleri arası detaylı satış analizi`;
    default:
      return "";
  }
});

const getWeekRangeText = (date: string): string => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const week = getWeekNumber(dateObj);

  const jan1 = new Date(year, 0, 1);
  const daysOffset = (week - 1) * 7;
  const startDate = new Date(jan1);
  startDate.setDate(jan1.getDate() + daysOffset);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const startStr = startDate.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
  const endStr = endDate.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${startStr} - ${endStr}`;
};

// Function to load reports
const loadReports = async () => {
  isLoading.value = true;
  try {
    let reportData: any;
    let salesData: { data: Sale[]; total?: number } = { data: [] };

    switch (reportType.value) {
      case "daily":
        reportData = await getDailyReport(selectedDate.value);
        salesData = await getSales({
          sale_date: {
            _gte: `${selectedDate.value}T00:00:00`,
            _lte: `${selectedDate.value}T23:59:59`,
          },
        });
        break;

      case "weekly":
        const weekDate = new Date(selectedDate.value);
        const weekYear = weekDate.getFullYear();
        const week = getWeekNumber(weekDate);
        reportData = await getWeeklyReport(weekYear, week);
        break;

      case "monthly":
        const [year, month] = selectedMonthYear.value.split("-");
        if (!year || !month) break;
        reportData = await getMonthlyReport(parseInt(year), parseInt(month));
        break;

      case "yearly":
        reportData = await getYearlyReport(selectedYear.value);
        break;

      case "custom":
        if (!dateRange.value.start || !dateRange.value.end) break;
        reportData = await getCustomRangeReport(
          dateRange.value.start,
          dateRange.value.end
        );
        break;
    }

    // Process report data
    const sales = reportData.items || [];
    const onlineSales = sales.filter((s: Sale) => s.sale_type === "online");
    const counterSales = sales.filter((s: Sale) => s.sale_type === "counter");

    // Calculate profit for top products if they exist
    let topProductsWithProfit = reportData.topProducts || [];
    if (topProductsWithProfit.length > 0 && sales.length > 0) {
      topProductsWithProfit = topProductsWithProfit.map((item: any) => {
        const productId =
          typeof item.product === "string" ? item.product : item.product?.id;
        const productSales = sales
          .flatMap((sale: Sale) => sale.sale_items || [])
          .filter((saleItem: any) => {
            const saleItemProductId =
              typeof saleItem.product === "string"
                ? saleItem.product
                : saleItem.product?.id;
            return saleItemProductId === productId;
          });

        const profit = productSales.reduce((sum: number, si: any) => {
          if (si.profit !== undefined && si.profit !== null) {
            return sum + (Number(si.profit) || 0);
          }
          const subtotal = si.subtotal ?? si.quantity * si.unit_price;
          const costTotal = si.cost_total ?? si.quantity * si.unit_cost;
          return sum + (subtotal - costTotal);
        }, 0);

        const revenue =
          item.revenue ??
          productSales.reduce((sum: number, si: any) => {
            const subtotal = si.subtotal ?? si.quantity * si.unit_price;
            return sum + (Number(subtotal) || 0);
          }, 0);

        return {
          ...item,
          revenue,
          profit,
        };
      });
    }

    currentReport.value = {
      sales_count: reportData.sales_count || 0,
      total_amount: reportData.total_amount || 0,
      total_cost: reportData.total_cost || 0,
      total_profit: reportData.total_profit || 0,
      items: sales,
      topProducts: topProductsWithProfit,
      onlineAmount: onlineSales.reduce(
        (sum: number, s: Sale) => sum + (s.total_amount || 0),
        0
      ),
      onlineCount: onlineSales.length,
      counterAmount: counterSales.reduce(
        (sum: number, s: Sale) => sum + (s.total_amount || 0),
        0
      ),
      counterCount: counterSales.length,
    };
  } catch (error) {
    console.error("Failed to load reports:", error);
  } finally {
    isLoading.value = false;
  }
};

// Watch for changes and reload reports
watch(
  [reportType, selectedDate, selectedMonthYear, selectedYear, dateRange],
  () => {
    loadReports();
  },
  { deep: true }
);

// Initial load
onMounted(async () => {
  await loadReports();
});

useSeoMeta({
  title: "Raporlar - Admin - Lumera",
});
</script>
