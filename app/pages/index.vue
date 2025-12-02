<template>
  <div class="min-h-screen bg-white">
    <main class="container mx-auto px-4 py-12">
      <!-- Hero Section -->
      <section class="mb-16 text-center">
        <h2
          class="mb-4 font-serif text-4xl font-light tracking-wide text-black"
        >
          Lumera Collection
        </h2>
        <p class="mx-auto max-w-2xl font-sans text-sm font-light text-gray-600">
          Handcrafted jewelry pieces that celebrate elegance and timeless beauty
        </p>
      </section>

      <!-- Products Grid -->
      <section v-if="products.length > 0">
        <div
          class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>
      </section>
      <div v-else class="py-20 text-center">
        <p class="font-serif text-2xl font-light text-gray-700">
          Yakında Gelecek
        </p>
        <p class="mt-2 font-sans text-sm text-gray-500">Coming Soon</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/types";

const { getProducts } = useProducts();

const products: Product[] = await getProducts();

useSeoMeta({
  title: "Lumera - Takı E-Ticaret",
  description: "Lumera takı koleksiyonu - Özel tasarım takılar",
});
</script>
