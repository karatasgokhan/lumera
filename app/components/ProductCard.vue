<template>
  <NuxtLink :to="`/product/${product.slug}`">
    <div
      class="group h-full overflow-hidden border-0 bg-white shadow-none transition-shadow hover:shadow-lg"
    >
      <!-- Image Container -->
      <div class="relative aspect-square w-full overflow-hidden bg-gray-50">
        <NuxtImg
          v-if="imageUrl"
          :src="imageUrl"
          :alt="product.name"
          class="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
        <div v-else class="flex h-full items-center justify-center bg-gray-100">
          <span class="text-sm text-gray-400">No Image</span>
        </div>

        <!-- Sold Out Badge -->
        <div
          v-if="isSoldOut"
          class="absolute inset-0 flex items-center justify-center bg-black/40"
        >
          <span
            class="bg-black/80 text-white backdrop-blur-sm px-2 py-1 rounded text-sm"
          >
            Sold Out
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="p-4">
        <h3 class="font-serif text-lg font-light text-black">
          {{ product.name }}
        </h3>
      </div>

      <!-- Footer with Price -->
      <div class="flex flex-col items-start gap-1 p-4 pt-0">
        <div class="flex items-baseline gap-2">
          <span class="font-sans text-lg font-medium text-black">
            {{ formatPrice(displayPrice) }}
          </span>
          <span
            v-if="originalPrice"
            class="font-sans text-sm text-gray-500 line-through"
          >
            {{ formatPrice(originalPrice) }}
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Product } from "~/types";
import { getImageUrlWithTransformations, formatPrice } from "~/utils";

interface Props {
  product: Product;
}

const props = defineProps<Props>();

// Get first image from images array
const firstImage =
  props.product.images &&
  Array.isArray(props.product.images) &&
  props.product.images.length > 0
    ? props.product.images[0]
    : null;

const imageUrl = getImageUrlWithTransformations(firstImage, {
  width: 600,
  quality: 85,
});

const isSoldOut = props.product.stock_quantity === 0;
const hasDiscount =
  props.product.discount_price &&
  props.product.discount_price < props.product.price;
const displayPrice = hasDiscount
  ? props.product.discount_price!
  : props.product.price;
const originalPrice = hasDiscount ? props.product.price : null;
</script>
