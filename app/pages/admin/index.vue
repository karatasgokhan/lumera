<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-serif text-4xl font-light text-black mb-2">
          Admin Dashboard
        </h1>
        <p class="text-gray-600">Stok takip ve satış yönetim sistemi</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Toplam Ürün</h3>
          <p class="text-3xl font-light text-black">
            {{ stats.totalProducts }}
          </p>
          <p class="text-sm text-gray-400 mt-1">
            {{ stats.activeProducts }} aktif
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-sm font-medium text-gray-500 mb-1">
            Bugünkü Satışlar
          </h3>
          <p class="text-3xl font-light text-black">{{ stats.todaySales }}</p>
          <p class="text-sm text-gray-400 mt-1">adet</p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Bugünkü Gelir</h3>
          <p class="text-3xl font-light text-black">
            {{ formatPrice(stats.todayRevenue) }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Bugünkü Kar</h3>
          <p class="text-3xl font-light text-black">
            {{ formatPrice(stats.todayProfit) }}
          </p>
          <p
            :class="`text-sm mt-1 ${
              stats.todayProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`"
          >
            {{ stats.todayProfit >= 0 ? "+" : "" }}
            {{
              stats.todayRevenue > 0
                ? ((stats.todayProfit / stats.todayRevenue) * 100).toFixed(1)
                : "0.0"
            }}%
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <NuxtLink
          to="/admin/products"
          class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 class="font-medium text-black mb-2">Ürün Yönetimi</h3>
          <p class="text-sm text-gray-600">
            Ürün ekle, düzenle ve stok takibi yap
          </p>
        </NuxtLink>

        <NuxtLink
          to="/admin/sales"
          class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 class="font-medium text-black mb-2">Satış İşaretleme</h3>
          <p class="text-sm text-gray-600">Tek tek veya toplu satış işaretle</p>
        </NuxtLink>

        <NuxtLink
          to="/admin/reports"
          class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 class="font-medium text-black mb-2">Raporlar</h3>
          <p class="text-sm text-gray-600">
            Günlük ve aylık kar-zarar raporları
          </p>
        </NuxtLink>
      </div>

      <!-- Recent Sales -->
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="font-medium text-black mb-4">Son Satışlar</h2>
        <div v-if="stats.recentSales.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-2 text-sm font-medium text-gray-600">
                  Tarih
                </th>
                <th class="text-left py-2 text-sm font-medium text-gray-600">
                  Tip
                </th>
                <th class="text-right py-2 text-sm font-medium text-gray-600">
                  Tutar
                </th>
                <th class="text-right py-2 text-sm font-medium text-gray-600">
                  Kar
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="sale in stats.recentSales"
                :key="sale.id"
                class="border-b border-gray-100"
              >
                <td class="py-3 text-sm text-gray-700">
                  {{ new Date(sale.sale_date).toLocaleDateString("tr-TR") }}
                </td>
                <td class="py-3 text-sm text-gray-700">
                  <span
                    :class="`px-2 py-1 rounded ${
                      sale.sale_type === 'online'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`"
                  >
                    {{ sale.sale_type === "online" ? "Online" : "Tezgah" }}
                  </span>
                </td>
                <td class="py-3 text-sm text-right font-medium text-black">
                  {{ formatPrice(sale.total_amount) }}
                </td>
                <td class="py-3 text-sm text-right font-medium text-green-600">
                  {{ formatPrice(sale.total_profit) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-gray-500 text-sm">Henüz satış kaydı yok</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, Sale } from "~/types";
import { formatPrice } from "~/utils";

const { getProducts } = useProducts();
const { getSales, getDailyReport } = useSales();

const today =
  new Date().toISOString().split("T")[0] ??
  new Date().toISOString().substring(0, 10);
const products = await getProducts();
const todayReport = await getDailyReport(today);
const recentSales = await getSales(undefined, { limit: 5 });

const stats = {
  totalProducts: products.length,
  activeProducts: products.filter((p) => p.is_active).length,
  todaySales: todayReport.sales_count,
  todayRevenue: todayReport.total_amount,
  todayProfit: todayReport.total_profit,
  recentSales,
};

useSeoMeta({
  title: "Admin Dashboard - Lumera",
});
</script>
