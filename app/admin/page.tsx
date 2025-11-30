import { getProducts, getSales, getDailyReport } from "@/lib/directus";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

async function getStats() {
  const today = new Date().toISOString().split("T")[0];
  const products = await getProducts();
  const todayReport = await getDailyReport(today);
  const recentSales = await getSales(undefined, { limit: 5 });

  return {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.is_active).length,
    todaySales: todayReport.sales_count,
    todayRevenue: todayReport.total_amount,
    todayProfit: todayReport.total_profit,
    recentSales,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-light text-black mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Stok takip ve satış yönetim sistemi</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Toplam Ürün
            </h3>
            <p className="text-3xl font-light text-black">
              {stats.totalProducts}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {stats.activeProducts} aktif
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Bugünkü Satışlar
            </h3>
            <p className="text-3xl font-light text-black">{stats.todaySales}</p>
            <p className="text-sm text-gray-400 mt-1">adet</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Bugünkü Gelir
            </h3>
            <p className="text-3xl font-light text-black">
              {formatPrice(stats.todayRevenue)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Bugünkü Kar
            </h3>
            <p className="text-3xl font-light text-black">
              {formatPrice(stats.todayProfit)}
            </p>
            <p
              className={`text-sm mt-1 ${
                stats.todayProfit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.todayProfit >= 0 ? "+" : ""}
              {stats.todayRevenue > 0
                ? ((stats.todayProfit / stats.todayRevenue) * 100).toFixed(1)
                : "0.0"}
              %
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/products"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-black mb-2">Ürün Yönetimi</h3>
            <p className="text-sm text-gray-600">
              Ürün ekle, düzenle ve stok takibi yap
            </p>
          </Link>

          <Link
            href="/admin/sales"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-black mb-2">Satış İşaretleme</h3>
            <p className="text-sm text-gray-600">
              Tek tek veya toplu satış işaretle
            </p>
          </Link>

          <Link
            href="/admin/reports"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-black mb-2">Raporlar</h3>
            <p className="text-sm text-gray-600">
              Günlük ve aylık kar-zarar raporları
            </p>
          </Link>
        </div>

        {/* Recent Sales */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="font-medium text-black mb-4">Son Satışlar</h2>
          {stats.recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">
                      Tarih
                    </th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">
                      Tip
                    </th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600">
                      Tutar
                    </th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600">
                      Kar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-700">
                        {new Date(sale.sale_date).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="py-3 text-sm text-gray-700">
                        <span
                          className={`px-2 py-1 rounded ${
                            sale.sale_type === "online"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {sale.sale_type === "online" ? "Online" : "Tezgah"}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-right font-medium text-black">
                        {formatPrice(sale.total_amount)}
                      </td>
                      <td className="py-3 text-sm text-right font-medium text-green-600">
                        {formatPrice(sale.total_profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Henüz satış kaydı yok</p>
          )}
        </div>
      </div>
    </div>
  );
}
