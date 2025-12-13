<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="font-medium text-black">
        {{ editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle" }}
      </h2>
      <div v-if="!editingProduct" class="flex gap-2">
        <Button
          :variant="isOpen ? 'outline' : 'default'"
          @click="isOpen = !isOpen"
        >
          {{ isOpen ? "İptal" : "+ Ürün Ekle" }}
        </Button>
      </div>
      <div v-else class="flex gap-2">
        <Button variant="outline" @click="cancelEdit"> İptal </Button>
      </div>
    </div>

    <form
      v-if="isOpen || editingProduct"
      @submit.prevent="handleSubmit"
      class="space-y-4"
    >
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
          {{
            isSubmitting
              ? "Kaydediliyor..."
              : editingProduct
              ? "Güncelle"
              : "Ürün Ekle"
          }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Category, Product } from "~/types";
import { useProducts } from "~/composables/useProducts";
import { getImageUrl } from "~/utils";
import Button from "~/components/ui/Button.vue";

interface Props {
  categories: Category[];
  product?: Product | string | null;
}

const props = withDefaults(defineProps<Props>(), {
  product: null,
});

const emit = defineEmits<{
  (e: "saved"): void;
  (e: "cancelled"): void;
}>();

const { createProduct, updateProduct, getProduct } = useProducts();
const config = useRuntimeConfig();

const isOpen = ref(false);
const isSubmitting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<Array<{ file: File; preview: string; name: string }>>(
  []
);
const uploadedImages = ref<string[]>([]);

const editingProduct = computed(() => props.product !== null);

const formData = ref({
  name: "",
  slug: "",
  description: "",
  cost_price: 0,
  price: 0,
  discount_price: null as number | null,
  stock_quantity: 0,
  is_active: true,
  material: "",
  category: "",
});

// Define resetForm before watch to avoid "before initialization" error
const resetForm = () => {
  formData.value = {
    name: "",
    slug: "",
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
};

// Watch for product prop changes to populate form
watch(
  () => props.product,
  async (newProduct) => {
    if (newProduct) {
      // Fetch full product data if only ID is provided
      let productData: Product | null = null;

      if (typeof newProduct === "string") {
        productData = await getProduct(newProduct);
      } else if (newProduct && typeof newProduct === "object") {
        productData = newProduct as Product;
      }

      if (productData) {
        formData.value = {
          name: productData.name || "",
          slug: productData.slug || "",
          description: productData.description || "",
          cost_price: Number(productData.cost_price) || 0,
          price: Number(productData.price) || 0,
          discount_price: productData.discount_price
            ? Number(productData.discount_price)
            : null,
          stock_quantity: Number(productData.stock_quantity) || 0,
          is_active: productData.is_active ?? true,
          material: productData.material || "",
          category:
            typeof productData.category === "object" && productData.category
              ? productData.category.id
              : productData.category || "",
        };

        // Set existing images
        if (productData.images && Array.isArray(productData.images)) {
          uploadedImages.value = productData.images.map((img: any) =>
            typeof img === "string" ? img : img.id
          );
        }
      }
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

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
  if (files.length === 0) {
    return [];
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("file", file);
  });

  try {
    const response = await $fetch<{ data: Array<{ id: string }> }>(
      "/api/files",
      {
        method: "POST",
        body: formData,
      }
    );
    return response.data.map((item) => item.id);
  } catch (error) {
    console.error("Dosya yükleme hatası:", error);
    throw error;
  }
};

const cancelEdit = () => {
  resetForm();
  emit("cancelled");
};

const handleSubmit = async () => {
  isSubmitting.value = true;

  try {
    // Upload images first
    // For editing: Only send new images, server will replace all existing ones
    // For creating: Send all images
    let imageIds: string[] = editingProduct.value
      ? []
      : [...uploadedImages.value];

    if (selectedFiles.value.length > 0) {
      const filesToUpload = selectedFiles.value.map((f) => f.file);
      const newImageIds = await uploadFiles(filesToUpload);
      imageIds = [...imageIds, ...newImageIds];
    } else if (editingProduct.value && uploadedImages.value.length > 0) {
      // If editing and no new files selected, keep existing images
      imageIds = [...uploadedImages.value];
    }

    const productData: any = {
      ...formData.value,
      category: formData.value.category || null,
    };

    if (imageIds.length > 0) {
      productData.images = imageIds;
    }

    if (editingProduct.value && props.product) {
      const productId =
        typeof props.product === "string" ? props.product : props.product.id;
      await updateProduct(productId, productData);
    } else {
      await createProduct(productData);
    }

    // Reset form
    resetForm();
    isOpen.value = false;
    emit("saved");

    if (!editingProduct.value) {
      await navigateTo("/admin/products", { replace: true });
    }
  } catch (error) {
    console.error("Error saving product:", error);
    alert(
      editingProduct.value
        ? "Ürün güncellenirken bir hata oluştu"
        : "Ürün oluşturulurken bir hata oluştu"
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>
