<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="container mx-auto max-w-4xl">
      <h1 class="text-3xl font-bold mb-6">Directus Debug</h1>

      <!-- Configuration Info -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Configuration</h2>
        <div class="space-y-2">
          <p>
            <strong>Directus URL:</strong> {{ config.directusUrl || "Not set" }}
          </p>
          <p>
            <strong>Environment:</strong>
            {{ isDev ? "Development" : "Production" }}
          </p>
        </div>
      </div>

      <!-- Test Results -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Test Results</h2>

        <div class="space-y-4">
          <!-- Categories Test -->
          <div>
            <h3 class="font-medium mb-2">Categories</h3>
            <button
              @click="testCategories"
              :disabled="loading"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Test Categories
            </button>
            <div v-if="categoriesResult" class="mt-2">
              <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{
                JSON.stringify(categoriesResult, null, 2)
              }}</pre>
            </div>
          </div>

          <!-- Products Test -->
          <div>
            <h3 class="font-medium mb-2">Products</h3>
            <button
              @click="testProducts"
              :disabled="loading"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Test Products
            </button>
            <div v-if="productsResult" class="mt-2">
              <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{
                JSON.stringify(productsResult, null, 2)
              }}</pre>
            </div>
          </div>

          <!-- Direct API Test -->
          <div>
            <h3 class="font-medium mb-2">Direct API Test</h3>
            <button
              @click="testDirectAPI"
              :disabled="loading"
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Test Direct API Call
            </button>
            <div v-if="directApiResult" class="mt-2">
              <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{
                JSON.stringify(directApiResult, null, 2)
              }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Console Logs -->
      <div
        class="bg-black text-green-400 rounded-lg shadow p-6 font-mono text-sm"
      >
        <h2 class="text-xl font-semibold mb-4 text-white">Console Output</h2>
        <div class="space-y-1">
          <div v-for="(log, index) in consoleLogs" :key="index" class="text-xs">
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

const config = useRuntimeConfig();
const isDev = process.env.NODE_ENV === "development";

const loading = ref(false);
const categoriesResult = ref<any>(null);
const productsResult = ref<any>(null);
const directApiResult = ref<any>(null);
const consoleLogs = ref<string[]>([]);

// Capture console logs
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args: any[]) => {
  originalLog(...args);
  consoleLogs.value.push(
    `[LOG] ${args
      .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
      .join(" ")}`
  );
};

console.error = (...args: any[]) => {
  originalError(...args);
  consoleLogs.value.push(
    `[ERROR] ${args
      .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
      .join(" ")}`
  );
};

console.warn = (...args: any[]) => {
  originalWarn(...args);
  consoleLogs.value.push(
    `[WARN] ${args
      .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
      .join(" ")}`
  );
};

const { getCategories } = useCategories();
const { getProducts } = useProducts();

const testCategories = async () => {
  loading.value = true;
  categoriesResult.value = null;
  try {
    const categories = await getCategories();
    categoriesResult.value = {
      success: true,
      count: categories.length,
      data: categories,
    };
  } catch (error: any) {
    categoriesResult.value = {
      success: false,
      error: error.message,
      stack: error.stack,
    };
  } finally {
    loading.value = false;
  }
};

const testProducts = async () => {
  loading.value = true;
  productsResult.value = null;
  try {
    const products = await getProducts();
    productsResult.value = {
      success: true,
      count: products.length,
      data: products.slice(0, 3), // Show first 3
    };
  } catch (error: any) {
    productsResult.value = {
      success: false,
      error: error.message,
      stack: error.stack,
    };
  } finally {
    loading.value = false;
  }
};

const testDirectAPI = async () => {
  loading.value = true;
  directApiResult.value = null;
  try {
    const directusUrl = config.public.directusUrl?.replace(/\/$/, "");
    const url = `${directusUrl}/items/categories?fields=*&sort=-date_created`;

    console.log(`Testing direct API call to: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    directApiResult.value = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: url,
      data: data,
    };
  } catch (error: any) {
    directApiResult.value = {
      success: false,
      error: error.message,
      stack: error.stack,
    };
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  console.log("Debug page mounted");
  console.log("Directus URL:", config.public.directusUrl);
});
</script>
