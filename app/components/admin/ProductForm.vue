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

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Ürün Görselleri
        </label>
        <div class="mt-2">
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            @change="handleFileSelect"
            class="hidden"
          />
          <Button
            type="button"
            variant="outline"
            @click="() => fileInput?.click()"
          >
            + Görsel Ekle
          </Button>
          <div
            v-if="selectedFiles.length > 0"
            class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="relative group"
            >
              <img
                :src="file.preview"
                :alt="file.name"
                class="w-full h-32 object-cover rounded-md border border-gray-300"
              />
              <button
                type="button"
                @click="removeFile(index)"
                class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          </div>
          <div v-if="uploadedImages.length > 0" class="mt-4">
            <p class="text-sm text-gray-600 mb-2">Yüklenen Görseller:</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="imageId in uploadedImages"
                :key="imageId"
                class="relative group"
              >
                <img
                  :src="getImageUrl(imageId) ?? ''"
                  alt="Product image"
                  class="w-full h-32 object-cover rounded-md border border-gray-300"
                />
                <button
                  type="button"
                  @click="removeUploadedImage(imageId)"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
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
import { getImageUrl } from "~/utils";

interface Props {
  categories: Category[];
}

const props = defineProps<Props>();

const { createProduct } = useProducts();
const config = useRuntimeConfig();

const isOpen = ref(false);
const isSubmitting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<Array<{ file: File; preview: string; name: string }>>(
  []
);
const uploadedImages = ref<string[]>([]);

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

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  Array.from(target.files).forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedFiles.value.push({
          file,
          preview: e.target?.result as string,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  });
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

const removeUploadedImage = (imageId: string) => {
  uploadedImages.value = uploadedImages.value.filter((id) => id !== imageId);
};

const uploadFiles = async (files: File[]): Promise<string[]> => {
  const directusUrl = config.public.directusUrl;
  if (!directusUrl) {
    throw new Error("Directus URL yapılandırılmamış");
  }

  const uploadedIds: string[] = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await $fetch<{ data: { id: string } }>(
        `${directusUrl}/files`,
        {
          method: "POST",
          body: formData,
        }
      );
      uploadedIds.push(response.data.id);
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
      throw error;
    }
  }

  return uploadedIds;
};

const handleSubmit = async () => {
  isSubmitting.value = true;

  try {
    // Upload images first
    let imageIds: string[] = [...uploadedImages.value];

    if (selectedFiles.value.length > 0) {
      const filesToUpload = selectedFiles.value.map((f) => f.file);
      const newImageIds = await uploadFiles(filesToUpload);
      imageIds = [...imageIds, ...newImageIds];
    }

    const productData: any = {
      ...formData.value,
      category: formData.value.category || null,
    };

    if (imageIds.length > 0) {
      productData.images = imageIds;
    }

    await createProduct(productData);

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
    selectedFiles.value = [];
    uploadedImages.value = [];
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
