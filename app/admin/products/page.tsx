import { getProducts, getCategories } from "@/lib/directus";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import ProductForm from "@/components/admin/ProductForm";

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-4xl font-light text-black mb-2">
              Ürün Yönetimi
            </h1>
            <p className="text-gray-600">
              Ürün ekle, düzenle ve stok takibi yap
            </p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-gray-600 hover:text-black"
          >
            ← Dashboard'a Dön
          </Link>
        </div>

        {/* Add Product Form */}
        <div className="mb-8">
          <ProductForm categories={categories} />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="font-medium text-black">Tüm Ürünler</h2>
          </div>
          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                      Ürün Adı
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                      SKU
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                      Kategori
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">
                      Maliyet
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">
                      Satış Fiyatı
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">
                      Stok
                    </th>
                    <th className="text-center py-3 px-6 text-sm font-medium text-gray-600">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const category =
                      typeof product.category === "object"
                        ? product.category
                        : null;
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-black">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {product.description}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {product.sku}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {category ? category.name : "-"}
                        </td>
                        <td className="py-4 px-6 text-sm text-right font-medium text-gray-700">
                          {formatPrice(product.cost_price)}
                        </td>
                        <td className="py-4 px-6 text-sm text-right font-medium text-black">
                          {formatPrice(product.price)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.stock_quantity > 10
                                ? "bg-green-100 text-green-800"
                                : product.stock_quantity > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {product.is_active ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">Henüz ürün eklenmemiş</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
