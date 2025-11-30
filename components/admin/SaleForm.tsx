"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface SaleFormProps {
  products: Product[];
}

interface SaleItem {
  product: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
}

export default function SaleForm({ products }: SaleFormProps) {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [saleType, setSaleType] = useState<"online" | "counter">("counter");
  const [notes, setNotes] = useState("");

  // Single sale mode
  const [singleProduct, setSingleProduct] = useState("");
  const [singleQuantity, setSingleQuantity] = useState("1");

  // Batch sale mode
  const [batchItems, setBatchItems] = useState<SaleItem[]>([]);

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
    setBatchItems([
      ...batchItems,
      {
        product: "",
        quantity: 1,
        unit_price: 0,
        unit_cost: 0,
      },
    ]);
  };

  const handleUpdateBatchItem = (
    index: number,
    field: keyof SaleItem,
    value: any
  ) => {
    const updated = [...batchItems];
    updated[index] = { ...updated[index], [field]: value };
    setBatchItems(updated);
  };

  const handleProductSelect = async (productId: string, index?: number) => {
    if (!productId) return;

    try {
      const response = await fetch(`/api/products/${productId}`);

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Ürün bulunamadı. Lütfen tekrar deneyin.");
        return;
      }

      const product: Product = await response.json();

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
        setSingleProduct(productId);
      }
    } catch (error: any) {
      console.error("Ürün bilgisi alınırken hata:", error);
      alert(
        "Ürün bilgisi alınırken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let items: SaleItem[] = [];

      if (mode === "single") {
        if (!singleProduct) {
          alert("Lütfen bir ürün seçin");
          setIsSubmitting(false);
          return;
        }

        const response = await fetch(`/api/products/${singleProduct}`);
        if (!response.ok) {
          const error = await response.json();
          alert(error.error || "Ürün bulunamadı. Lütfen tekrar deneyin.");
          setIsSubmitting(false);
          return;
        }

        const product: Product = await response.json();
        if (!product) {
          alert("Ürün bulunamadı. Lütfen tekrar deneyin.");
          setIsSubmitting(false);
          return;
        }

        items = [
          {
            product: singleProduct,
            quantity: parseInt(singleQuantity) || 1,
            unit_price: product.discount_price ?? product.price ?? 0,
            unit_cost: product.cost_price ?? 0,
          },
        ];
      } else {
        items = batchItems.filter((item) => item.product);
        if (items.length === 0) {
          alert("Lütfen en az bir ürün ekleyin");
          setIsSubmitting(false);
          return;
        }
      }

      const saleResponse = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sale_date: saleDate,
          sale_type: saleType,
          notes: notes || undefined,
          items: items.map((item) => ({
            product: item.product,
            quantity: item.quantity,
            unit_price: item.unit_price,
            unit_cost: item.unit_cost,
          })),
        }),
      });

      if (!saleResponse.ok) {
        const error = await saleResponse.json();
        throw new Error(error.error || "Satış oluşturulamadı");
      }

      // Reset form
      setSingleProduct("");
      setSingleQuantity("1");
      setBatchItems([]);
      setNotes("");
      window.location.reload();
    } catch (error) {
      console.error("Error creating sale:", error);
      alert("Satış oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const singleTotals =
    mode === "single" && singleProduct
      ? (() => {
          const product = products.find((p) => p.id === singleProduct);
          if (!product) return { totalAmount: 0, totalCost: 0, totalProfit: 0 };
          const qty = parseInt(singleQuantity) || 0;
          const price = product.discount_price ?? product.price ?? 0;
          const costPrice = product.cost_price ?? 0;
          return {
            totalAmount: qty * price,
            totalCost: qty * costPrice,
            totalProfit: qty * price - qty * costPrice,
          };
        })()
      : { totalAmount: 0, totalCost: 0, totalProfit: 0 };

  const batchTotals = calculateTotals(batchItems);
  const totals = mode === "single" ? singleTotals : batchTotals;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={mode === "single" ? "default" : "outline"}
            onClick={() => setMode("single")}
          >
            Tek Tek
          </Button>
          <Button
            type="button"
            variant={mode === "batch" ? "default" : "outline"}
            onClick={() => setMode("batch")}
          >
            Toplu
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Satış Tarihi *
            </label>
            <input
              type="date"
              required
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Satış Tipi *
            </label>
            <select
              required
              value={saleType}
              onChange={(e) =>
                setSaleType(e.target.value as "online" | "counter")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="counter">Tezgah</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {mode === "single" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ürün *
              </label>
              <select
                required
                value={singleProduct}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Ürün Seçin</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.stock_quantity} stok)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Miktar *
              </label>
              <input
                type="number"
                required
                min="1"
                value={singleQuantity}
                onChange={(e) => setSingleQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-black">Ürünler</h3>
              <Button
                type="button"
                onClick={handleAddBatchItem}
                variant="outline"
              >
                + Ürün Ekle
              </Button>
            </div>

            {batchItems.map((item, index) => {
              const product = products.find((p) => p.id === item.product);
              return (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ürün
                    </label>
                    <select
                      value={item.product}
                      onChange={(e) =>
                        handleProductSelect(e.target.value, index)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Seçin</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.stock_quantity} stok)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Miktar
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateBatchItem(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {product && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Birim Fiyat
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleUpdateBatchItem(
                              index,
                              "unit_price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Toplam
                        </label>
                        <div className="px-3 py-2 bg-white border border-gray-300 rounded-md">
                          {formatPrice(item.quantity * item.unit_price)}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="md:col-span-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setBatchItems(batchItems.filter((_, i) => i !== index))
                      }
                    >
                      Kaldır
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Totals */}
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600">Toplam Tutar</div>
              <div className="text-lg font-medium text-black">
                {formatPrice(totals.totalAmount)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Toplam Maliyet</div>
              <div className="text-lg font-medium text-gray-700">
                {formatPrice(totals.totalCost)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Toplam Kar</div>
              <div
                className={`text-lg font-medium ${
                  totals.totalProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatPrice(totals.totalProfit)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : "Satışı Kaydet"}
          </Button>
        </div>
      </form>
    </div>
  );
}
