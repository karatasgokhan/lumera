<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="font-serif text-4xl font-light text-black mb-2">
            Raporlar
          </h1>
          <p class="text-gray-600">Günlük ve aylık kar-zarar analizi</p>
        </div>
        <NuxtLink to="/admin" class="text-sm text-gray-600 hover:text-black">
          ← Dashboard'a Dön
        </NuxtLink>
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
                      <div class="text-sm text-gray-500">
                        {{ item.product.sku }}
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
import type { Product } from "~/types";

const { getDailyReport, getMonthlyReport } = useSales();

const now = new Date();
const today =
  now.toISOString().split("T")[0] || now.toISOString().substring(0, 10);
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const dailyReport = await getDailyReport(today);
const monthlyReport = await getMonthlyReport(currentYear, currentMonth);

useSeoMeta({
  title: "Raporlar - Admin - Lumera",
});
</script>
