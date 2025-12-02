<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="font-serif text-4xl font-light text-black mb-2">
            Satış İşaretleme
          </h1>
          <p class="text-gray-600">
            Tek tek veya toplu satış işaretle (Online veya Tezgah)
          </p>
        </div>
        <NuxtLink to="/admin" class="text-sm text-gray-600 hover:text-black">
          ← Dashboard'a Dön
        </NuxtLink>
      </div>

      <!-- Sale Form -->
      <div class="mb-8">
        <AdminSaleForm :products="products" />
      </div>

      <!-- Recent Sales -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h2 class="font-medium text-black">Son Satışlar</h2>
        </div>
        <AdminSalesTable :sales="sales" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, Sale } from "~/types";

const { getProducts } = useProducts();
const { getSales } = useSales();

const products: Product[] = await getProducts({ is_active: { _eq: true } });
const sales: Sale[] = await getSales({ limit: 50 });

useSeoMeta({
  title: "Satış İşaretleme - Admin - Lumera",
});
</script>
