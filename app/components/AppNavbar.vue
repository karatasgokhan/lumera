<template>
  <header class="border-b border-gray-200 bg-white">
    <nav class="container mx-auto px-4 py-6">
      <div class="flex flex-col items-center space-y-6">
        <!-- Logo -->
        <NuxtLink to="/" class="group">
          <h1
            class="font-serif text-3xl font-light tracking-wider text-black transition-opacity group-hover:opacity-70"
          >
            LUMERA
          </h1>
        </NuxtLink>

        <!-- Category Links -->
        <div
          v-if="categories.length > 0"
          class="flex flex-wrap items-center justify-center gap-6"
        >
          <NuxtLink
            to="/"
            class="font-sans text-sm font-light uppercase tracking-wider text-gray-700 transition-colors hover:text-black"
          >
            Ana Sayfa
          </NuxtLink>
          <NuxtLink
            v-for="category in categories"
            :key="category.id"
            :to="`/category/${category.slug}`"
            class="font-sans text-sm font-light uppercase tracking-wider text-gray-700 transition-colors hover:text-black"
          >
            {{ category.name }}
          </NuxtLink>
          <NuxtLink
            to="/admin"
            class="font-sans text-sm font-light uppercase tracking-wider text-gray-700 transition-colors hover:text-black border-l border-gray-300 pl-6"
          >
            Admin
          </NuxtLink>
        </div>
        <div v-else class="flex items-center justify-center gap-6">
          <NuxtLink
            to="/"
            class="font-sans text-sm font-light uppercase tracking-wider text-gray-700 transition-colors hover:text-black"
          >
            Ana Sayfa
          </NuxtLink>
          <NuxtLink
            to="/admin"
            class="font-sans text-sm font-light uppercase tracking-wider text-gray-700 transition-colors hover:text-black border-l border-gray-300 pl-6"
          >
            Admin
          </NuxtLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import type { Category } from "~/types";

const { getCategories } = useCategories();

let categories: Category[] = [];
try {
  categories = await getCategories();
} catch (error) {
  // Silently fail - Navbar should still render even if categories fail
  categories = [];
}
</script>
