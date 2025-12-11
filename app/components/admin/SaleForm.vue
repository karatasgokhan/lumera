<template>
  <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
    <div class="mb-6">
      <div class="flex gap-2 mb-4">
        <Button
          :variant="mode === 'single' ? 'default' : 'outline'"
          @click="mode = 'single'"
        >
          Tek Tek
        </Button>
        <Button
          :variant="mode === 'batch' ? 'default' : 'outline'"
          @click="mode = 'batch'"
        >
          Toplu
        </Button>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Satış Tarihi *
          </label>
          <input
            v-model="saleDate"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Satış Tipi *
          </label>
          <select
            v-model="saleType"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="counter">Tezgah</option>
            <option value="online">Online</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Notlar
          </label>
          <input
            v-model="notes"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div
        v-if="mode === 'single'"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Ürün *
          </label>
          <select
            v-model="singleProduct"
            required
            @change="() => handleProductSelect(singleProduct)"
            :class="`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
              getStockWarning(singleProduct)
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`"
          >
            <option value="">Ürün Seçin</option>
            <option
              v-for="product in products"
              :key="product.id"
              :value="product.id"
              :disabled="product.stock_quantity === 0"
            >
              {{ product.name }}
              ({{ product.stock_quantity }} stok)
              <span v-if="product.stock_quantity === 0"> - STOKTA YOK</span>
            </option>
          </select>
          <p
            v-if="getStockWarning(singleProduct)"
            class="mt-1 text-sm text-red-600"
          >
            ⚠️ Yetersiz stok! Mevcut: {{ getProductStock(singleProduct) }} adet
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Miktar *
          </label>
          <input
            v-model.number="singleQuantity"
            type="number"
            required
            min="1"
            @input="updateSingleTotals"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Birim Fiyat (₺)
          </label>
          <input
            v-model.number="singleUnitPrice"
            type="number"
            step="0.01"
            min="0"
            @input="updateSingleTotals"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
          <p class="mt-1 text-xs text-gray-500">
            Ürün seçildiğinde otomatik doldurulur, değiştirilebilir
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Toplam Tutar (₺)
          </label>
          <input
            v-model.number="singleTotalAmount"
            type="number"
            step="0.01"
            min="0"
            @input="updateSingleTotalsFromTotal"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
          <p class="mt-1 text-xs text-gray-500">
            Hesaplanan:
            {{ formatPrice(singleTotals.totalAmount) }} (değiştirilebilir)
          </p>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="font-medium text-black">Ürünler</h3>
          <Button type="button" variant="outline" @click="handleAddBatchItem">
            + Ürün Ekle
          </Button>
        </div>

        <div
          v-for="(item, index) in batchItems"
          :key="index"
          class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md"
        >
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Ürün
            </label>
            <select
              :value="item.product"
              @change="(e: Event) => handleProductSelect((e.target as HTMLSelectElement).value, index)"
              :class="`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                getStockWarning(item.product, item.quantity)
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`"
            >
              <option value="">Seçin</option>
              <option
                v-for="p in products"
                :key="p.id"
                :value="p.id"
                :disabled="p.stock_quantity === 0"
              >
                {{ p.name }}
                ({{ p.stock_quantity }} stok)
                <span v-if="p.stock_quantity === 0"> - STOKTA YOK</span>
              </option>
            </select>
            <p
              v-if="getStockWarning(item.product, item.quantity)"
              class="mt-1 text-xs text-red-600"
            >
              ⚠️ Yetersiz stok! Mevcut: {{ getProductStock(item.product) }} adet
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Miktar
            </label>
            <input
              :value="item.quantity"
              type="number"
              min="1"
              @input="
                (e: Event) => {
                  const target = e.target as HTMLInputElement;
                  if (target) {
                    handleUpdateBatchItem(index, 'quantity', parseInt(target.value) || 0);
                  }
                }
              "
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <template v-if="getProductById(item.product)">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Birim Fiyat (₺)
              </label>
              <input
                :value="item.unit_price"
                type="number"
                step="0.01"
                min="0"
                @input="
                (e: Event) => {
                  const target = e.target as HTMLInputElement;
                  if (target) {
                    handleUpdateBatchItem(index, 'unit_price', parseFloat(target.value) || 0);
                  }
                }
              "
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Toplam Tutar (₺)
              </label>
              <input
                :value="item.quantity * item.unit_price"
                type="number"
                step="0.01"
                min="0"
                @input="
                (e: Event) => {
                  const target = e.target as HTMLInputElement;
                  if (target && item.quantity > 0) {
                    const totalAmount = parseFloat(target.value) || 0;
                    const newUnitPrice = totalAmount / item.quantity;
                    handleUpdateBatchItem(index, 'unit_price', newUnitPrice);
                  }
                }
              "
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
              <p class="mt-1 text-xs text-gray-500">
                Hesaplanan: {{ formatPrice(item.quantity * item.unit_price) }}
              </p>
            </div>
          </template>

          <div class="md:col-span-4">
            <Button
              type="button"
              variant="outline"
              @click="() => { batchItems = batchItems.filter((item: SaleItem, i: number) => i !== index); }"
            >
              Kaldır
            </Button>
          </div>
        </div>
      </div>

      <!-- Totals -->
      <div class="bg-gray-50 p-4 rounded-md">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-sm text-gray-600">Toplam Tutar</div>
            <div class="text-lg font-medium text-black">
              {{ formatPrice(totals.totalAmount) }}
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Toplam Maliyet</div>
            <div class="text-lg font-medium text-gray-700">
              {{ formatPrice(totals.totalCost) }}
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Toplam Kar</div>
            <div
              :class="`text-lg font-medium ${
                totals.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`"
            >
              {{ formatPrice(totals.totalProfit) }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <Button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Kaydediliyor..." : "Satışı Kaydet" }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/types";
import { formatPrice } from "~/utils";
import { useProducts } from "~/composables/useProducts";
import Button from "~/components/ui/Button.vue";

interface Props {
  products: Product[];
}

const props = defineProps<Props>();

interface SaleItem {
  product: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
}

const { getProduct } = useProducts();

const mode = ref<"single" | "batch">("single");
const isSubmitting = ref(false);
const saleDate = ref(new Date().toISOString().split("T")[0]);
const saleType = ref<"online" | "counter">("counter");
const notes = ref("");

const singleProduct = ref("");
const singleQuantity = ref(1);
const singleUnitPrice = ref<number | null>(null);
const singleTotalAmount = ref<number | null>(null);
const batchItems = ref<SaleItem[]>([]);

const emit = defineEmits<{
  saleCreated: [];
}>();

const getProductById = (id: string) => {
  return props.products.find((p) => p.id === id);
};

const getProductStock = (productId: string): number => {
  const product = getProductById(productId);
  return product?.stock_quantity ?? 0;
};

const getStockWarning = (productId: string, quantity?: number): boolean => {
  if (!productId) return false;
  const product = getProductById(productId);
  if (!product) return false;

  const requestedQty = quantity ?? singleQuantity.value ?? 1;
  return product.stock_quantity < requestedQty;
};

const calculateTotals = (items: SaleItem[]) => {
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const totalCost = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0
  );
  const totalProfit = totalAmount - totalCost;
  return { totalAmount, totalCost, totalProfit };
};

const handleAddBatchItem = () => {
  batchItems.value.push({
    product: "",
    quantity: 1,
    unit_price: 0,
    unit_cost: 0,
  });
};

const handleUpdateBatchItem = (
  index: number,
  field: keyof SaleItem,
  value: any
) => {
  const updated = [...batchItems.value];
  const currentItem = updated[index];
  if (!currentItem) return;
  updated[index] = {
    product: currentItem.product,
    quantity: currentItem.quantity,
    unit_price: currentItem.unit_price,
    unit_cost: currentItem.unit_cost,
    [field]: value,
  };
  batchItems.value = updated;
};

const handleProductSelect = async (productId: string, index?: number) => {
  if (!productId) return;

  try {
    const product = await getProduct(productId);

    if (!product) {
      alert("Ürün bulunamadı. Lütfen tekrar deneyin.");
      return;
    }

    const unitPrice = product.discount_price ?? product.price ?? 0;
    const unitCost = product.cost_price ?? 0;

    if (index !== undefined) {
      handleUpdateBatchItem(index, "product", productId);
      handleUpdateBatchItem(index, "unit_price", unitPrice);
      handleUpdateBatchItem(index, "unit_cost", unitCost);
    } else {
      singleProduct.value = productId;
      singleUnitPrice.value = unitPrice;
      // Toplam tutarı hesapla
      const qty = singleQuantity.value || 1;
      singleTotalAmount.value = qty * unitPrice;
    }
  } catch (error: any) {
    console.error("Ürün bilgisi alınırken hata:", error);
    alert(
      "Ürün bilgisi alınırken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin."
    );
  }
};

const updateSingleTotals = () => {
  if (singleUnitPrice.value !== null && singleQuantity.value) {
    singleTotalAmount.value = singleQuantity.value * singleUnitPrice.value;
  }
};

const updateSingleTotalsFromTotal = () => {
  if (
    singleTotalAmount.value !== null &&
    singleQuantity.value &&
    singleQuantity.value > 0
  ) {
    singleUnitPrice.value = singleTotalAmount.value / singleQuantity.value;
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;

  try {
    let items: SaleItem[] = [];

    if (mode.value === "single") {
      if (!singleProduct.value) {
        alert("Lütfen bir ürün seçin");
        isSubmitting.value = false;
        return;
      }

      const product = await getProduct(singleProduct.value);
      if (!product) {
        alert("Ürün bulunamadı. Lütfen tekrar deneyin.");
        isSubmitting.value = false;
        return;
      }

      const qty = singleQuantity.value || 1;
      if (product.stock_quantity < qty) {
        alert(
          `Yetersiz stok! ${product.name} için mevcut stok: ${product.stock_quantity} adet`
        );
        isSubmitting.value = false;
        return;
      }

      // Kullanıcının girdiği birim fiyatı kullan, yoksa ürün fiyatını kullan
      const unitPrice =
        singleUnitPrice.value !== null && singleUnitPrice.value > 0
          ? singleUnitPrice.value
          : product.discount_price ?? product.price ?? 0;

      items = [
        {
          product: singleProduct.value,
          quantity: qty,
          unit_price: unitPrice,
          unit_cost: product.cost_price ?? 0,
        },
      ];
    } else {
      items = batchItems.value.filter((item) => item.product);
      if (items.length === 0) {
        alert("Lütfen en az bir ürün ekleyin");
        isSubmitting.value = false;
        return;
      }

      // Validate stock for batch items
      for (const item of items) {
        const product = getProductById(item.product);
        if (!product) {
          alert(`Ürün bulunamadı: ${item.product}`);
          isSubmitting.value = false;
          return;
        }
        if (product.stock_quantity < item.quantity) {
          alert(
            `Yetersiz stok! ${product.name} için mevcut stok: ${product.stock_quantity} adet, istenen: ${item.quantity} adet`
          );
          isSubmitting.value = false;
          return;
        }
      }
    }

    const response = await $fetch("/api/sales", {
      method: "POST",
      body: {
        sale_date: saleDate.value,
        sale_type: saleType.value,
        notes: notes.value || undefined,
        items: items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit_cost: item.unit_cost,
        })),
      },
    });

    // Reset form
    singleProduct.value = "";
    singleQuantity.value = 1;
    singleUnitPrice.value = null;
    singleTotalAmount.value = null;
    batchItems.value = [];
    notes.value = "";

    // Show success message
    alert("Satış başarıyla oluşturuldu!");

    // Emit event to parent to refresh sales list
    emit("saleCreated");

    // Don't navigate away - stay on the same page
  } catch (error) {
    console.error("Error creating sale:", error);
    alert("Satış oluşturulurken bir hata oluştu");
  } finally {
    isSubmitting.value = false;
  }
};

const singleTotals = computed(() => {
  if (mode.value === "single" && singleProduct.value) {
    const product = getProductById(singleProduct.value);
    if (!product) return { totalAmount: 0, totalCost: 0, totalProfit: 0 };
    const qty = singleQuantity.value || 0;
    // Kullanıcının girdiği birim fiyatı kullan, yoksa ürün fiyatını kullan
    const price =
      singleUnitPrice.value !== null && singleUnitPrice.value > 0
        ? singleUnitPrice.value
        : product.discount_price ?? product.price ?? 0;
    const costPrice = product.cost_price ?? 0;
    // Eğer kullanıcı toplam tutar girmişse onu kullan
    const totalAmount =
      singleTotalAmount.value !== null && singleTotalAmount.value > 0
        ? singleTotalAmount.value
        : qty * price;
    return {
      totalAmount,
      totalCost: qty * costPrice,
      totalProfit: totalAmount - qty * costPrice,
    };
  }
  return { totalAmount: 0, totalCost: 0, totalProfit: 0 };
});

const batchTotals = computed(() => calculateTotals(batchItems.value));
const totals = computed(() =>
  mode.value === "single" ? singleTotals.value : batchTotals.value
);
</script>
