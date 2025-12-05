<template>
  <div v-if="sales.length > 0" class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-200 bg-gray-50">
          <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
            Tarih
          </th>
          <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
            Saat
          </th>
          <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
            Ürün
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
        <template v-for="sale in sales" :key="sale.id">
          <tr
            v-if="!sale.sale_items || sale.sale_items.length === 0"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="py-3 px-6 text-sm text-gray-700">
              {{ new Date(sale.sale_date).toLocaleDateString("tr-TR") }}
            </td>
            <td class="py-3 px-6 text-sm text-gray-700">
              {{
                sale.date_created
                  ? new Date(sale.date_created).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"
              }}
            </td>
            <td class="py-3 px-6 text-sm text-gray-500">Ürün bilgisi yok</td>
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
          <tr
            v-for="(item, itemIndex) in sale.sale_items"
            :key="`${sale.id}-${item.id || itemIndex}`"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td
              v-if="itemIndex === 0"
              :rowspan="sale.sale_items?.length || 1"
              class="py-3 px-6 text-sm text-gray-700"
            >
              {{ new Date(sale.sale_date).toLocaleDateString("tr-TR") }}
            </td>
            <td
              v-if="itemIndex === 0"
              :rowspan="sale.sale_items?.length || 1"
              class="py-3 px-6 text-sm text-gray-700"
            >
              {{
                sale.date_created
                  ? new Date(sale.date_created).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"
              }}
            </td>
            <td class="py-3 px-6 text-sm text-gray-700">
              {{
                typeof item.product === "object" && item.product
                  ? item.product.name
                  : "Ürün bilgisi yok"
              }}
              <span class="text-gray-500 ml-2">
                ({{ item.quantity }} adet)
              </span>
            </td>
            <td
              v-if="itemIndex === 0"
              :rowspan="sale.sale_items?.length || 1"
              class="py-3 px-6 text-sm text-gray-700"
            >
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
            <td
              v-if="itemIndex === 0"
              :rowspan="sale.sale_items?.length || 1"
              class="py-3 px-6 text-sm text-right font-medium text-black"
            >
              {{ formatPrice(sale.total_amount) }}
            </td>
            <td
              v-if="itemIndex === 0"
              :rowspan="sale.sale_items?.length || 1"
              class="py-3 px-6 text-sm text-right font-medium text-green-600"
            >
              {{ formatPrice(sale.total_profit) }}
            </td>
          </tr>
        </template>
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
