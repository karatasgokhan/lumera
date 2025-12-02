<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div>
        <div class="text-sm font-medium text-gray-500 mb-1">Toplam Satış</div>
        <div class="text-2xl font-light text-black">
          {{ report.sales_count }}
        </div>
      </div>
      <div>
        <div class="text-sm font-medium text-gray-500 mb-1">Toplam Gelir</div>
        <div class="text-2xl font-light text-black">
          {{ formatPrice(report.total_amount) }}
        </div>
      </div>
      <div>
        <div class="text-sm font-medium text-gray-500 mb-1">Toplam Maliyet</div>
        <div class="text-2xl font-light text-gray-700">
          {{ formatPrice(report.total_cost) }}
        </div>
      </div>
      <div>
        <div class="text-sm font-medium text-gray-500 mb-1">Toplam Kar</div>
        <div
          :class="`text-2xl font-light ${
            report.total_profit >= 0 ? 'text-green-600' : 'text-red-600'
          }`"
        >
          {{ formatPrice(report.total_profit) }}
        </div>
        <div
          v-if="report.total_amount > 0"
          :class="`text-sm mt-1 ${
            report.total_profit >= 0 ? 'text-green-600' : 'text-red-600'
          }`"
        >
          {{ ((report.total_profit / report.total_amount) * 100).toFixed(1) }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from "~/utils";

interface Props {
  report: {
    sales_count: number;
    total_amount: number;
    total_cost: number;
    total_profit: number;
  };
  type: "daily" | "monthly";
}

defineProps<Props>();
</script>
