import { getDailyReport, getMonthlyReport } from "@/lib/directus";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import ReportCard from "@/components/admin/ReportCard";

export default async function ReportsPage() {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const dailyReport = await getDailyReport(today);
  const monthlyReport = await getMonthlyReport(currentYear, currentMonth);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-4xl font-light text-black mb-2">
              Raporlar
            </h1>
            <p className="text-gray-600">Günlük ve aylık kar-zarar analizi</p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-gray-600 hover:text-black"
          >
            ← Dashboard'a Dön
          </Link>
        </div>

        {/* Daily Report */}
        <div className="mb-8">
          <h2 className="font-medium text-black mb-4 text-xl">
            Günlük Rapor - {new Date(today).toLocaleDateString("tr-TR")}
          </h2>
          <ReportCard report={dailyReport} type="daily" />
        </div>

        {/* Monthly Report */}
        <div className="mb-8">
          <h2 className="font-medium text-black mb-4 text-xl">
            Aylık Rapor -{" "}
            {new Date(currentYear, currentMonth - 1).toLocaleDateString(
              "tr-TR",
              {
                year: "numeric",
                month: "long",
              }
            )}
          </h2>
          <ReportCard report={monthlyReport} type="monthly" />
        </div>

        {/* Top Products */}
        {monthlyReport.topProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-medium text-black">En Çok Satan Ürünler</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                      Ürün
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">
                      Satılan Miktar
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">
                      Toplam Gelir
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyReport.topProducts.map((item, index) => (
                    <tr
                      key={item.product.id}
                      className="border-b border-gray-100"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm">
                            #{index + 1}
                          </span>
                          <div>
                            <div className="font-medium text-black">
                              {item.product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.product.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-black">
                        {item.quantity} adet
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-black">
                        {formatPrice(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
