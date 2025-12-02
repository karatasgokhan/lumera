<template>
  <header class="border-b border-gray-200 bg-white">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo & Home Link -->
        <div class="flex items-center gap-6">
          <NuxtLink
            to="/"
            class="font-serif text-2xl font-light tracking-wider text-black transition-opacity hover:opacity-70"
          >
            LUMERA
          </NuxtLink>
        </div>

        <!-- Navigation Links -->
        <div class="flex items-center gap-6">
          <NuxtLink
            to="/"
            :class="`font-sans text-sm font-light uppercase tracking-wider transition-colors ${
              $route.path === '/' || $route.path === ''
                ? 'text-black border-b-2 border-black pb-1'
                : 'text-gray-600 hover:text-black'
            }`"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/products"
            :class="`font-sans text-sm font-light uppercase tracking-wider transition-colors ${
              $route.path === '/products'
                ? 'text-black border-b-2 border-black pb-1'
                : 'text-gray-600 hover:text-black'
            }`"
          >
            Ürünler
          </NuxtLink>
          <NuxtLink
            to="/sales"
            :class="`font-sans text-sm font-light uppercase tracking-wider transition-colors ${
              $route.path === '/sales'
                ? 'text-black border-b-2 border-black pb-1'
                : 'text-gray-600 hover:text-black'
            }`"
          >
            Satışlar
          </NuxtLink>
          <NuxtLink
            to="/reports"
            :class="`font-sans text-sm font-light uppercase tracking-wider transition-colors ${
              $route.path === '/reports'
                ? 'text-black border-b-2 border-black pb-1'
                : 'text-gray-600 hover:text-black'
            }`"
          >
            Raporlar
          </NuxtLink>
        </div>
      </div>
    </nav>
  </header>
</template>
