<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="font-medium text-black">Yeni Ürün Ekle</h2>
      <Button
        :variant="isOpen ? 'outline' : 'default'"
        @click="isOpen = !isOpen"
      >
        {{ isOpen ? "İptal" : "+ Ürün Ekle" }}
      </Button>
    </div>

    <form v-if="isOpen" @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Ürün Adı *
          </label>
          <input
            v-model="formData.name"
            type="text"
            required
            @input="formData.slug = generateSlug(formData.name)"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <input
            v-model="formData.slug"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            SKU *
          </label>
          <input
            v-model="formData.sku"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            v-model="formData.category"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Kategori Seçin</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Maliyet Fiyatı (TL) *
          </label>
          <input
            v-model.number="formData.cost_price"
            type="number"
            step="0.01"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Satış Fiyatı (TL) *
          </label>
          <input
            v-model.number="formData.price"
            type="number"
            step="0.01"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            İndirimli Fiyat (TL)
          </label>
          <input
            v-model.number="formData.discount_price"
            type="number"
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Stok Miktarı *
          </label>
          <input
            v-model.number="formData.stock_quantity"
            type="number"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Malzeme
          </label>
          <input
            v-model="formData.material"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Açıklama
        </label>
        <textarea
          v-model="formData.description"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div class="flex items-center">
        <input
          id="is_active"
          v-model="formData.is_active"
          type="checkbox"
          class="mr-2"
        />
        <label for="is_active" class="text-sm text-gray-700">Aktif</label>
      </div>

      <div class="flex justify-end gap-2">
        <Button type="button" variant="outline" @click="isOpen = false">
          İptal
        </Button>
        <Button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Kaydediliyor..." : "Ürün Ekle" }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Category } from "~/types";
import { useProducts } from "~/composables/useProducts";

interface Props {
  categories: Category[];
}

const props = defineProps<Props>();

const { createProduct } = useProducts();

const isOpen = ref(false);
const isSubmitting = ref(false);
const formData = ref({
  name: "",
  slug: "",
  sku: "",
  description: "",
  cost_price: 0,
  price: 0,
  discount_price: null as number | null,
  stock_quantity: 0,
  is_active: true,
  material: "",
  category: "",
});

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const handleSubmit = async () => {
  isSubmitting.value = true;

  try {
    await createProduct({
      ...formData.value,
      category: formData.value.category || null,
    });

    // Reset form
    formData.value = {
      name: "",
      slug: "",
      sku: "",
      description: "",
      cost_price: 0,
      price: 0,
      discount_price: null,
      stock_quantity: 0,
      is_active: true,
      material: "",
      category: "",
    };
    isOpen.value = false;
    await navigateTo("/admin/products", { replace: true });
  } catch (error) {
    console.error("Error creating product:", error);
    alert("Ürün oluşturulurken bir hata oluştu");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
