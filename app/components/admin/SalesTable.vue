<template>
  <div v-if="sales.length > 0" class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-200 bg-gray-50">
          <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
            Tarih
          </th>
          <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
            Tip
          </th>
          <th class="text-right py-3 px-6 text-sm font-medium text-gray-600">
            Tutar
          </th>
          <th class="text-right py-3 px-6 text-sm font-medium text-gray-600">
            Kar
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="sale in sales"
          :key="sale.id"
          class="border-b border-gray-100 hover:bg-gray-50"
        >
          <td class="py-3 px-6 text-sm text-gray-700">
            {{ new Date(sale.sale_date).toLocaleDateString("tr-TR") }}
          </td>
          <td class="py-3 px-6 text-sm text-gray-700">
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
          <td class="py-3 px-6 text-sm text-right font-medium text-black">
            {{ formatPrice(sale.total_amount) }}
          </td>
          <td class="py-3 px-6 text-sm text-right font-medium text-green-600">
            {{ formatPrice(sale.total_profit) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="p-12 text-center">
    <p class="text-gray-500">Henüz satış kaydı yok</p>
  </div>
</template>

<script setup lang="ts">
import type { Sale } from "~/types";
import { formatPrice } from "~/utils";

interface Props {
  sales: Sale[];
}

defineProps<Props>();
</script>
