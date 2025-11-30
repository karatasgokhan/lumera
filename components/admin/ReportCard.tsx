import { formatPrice } from "@/lib/utils";
import type { Sale } from "@/types";

interface DailyReport {
  date: string;
  total_amount: number;
  total_cost: number;
  total_profit: number;
  sales_count: number;
  items: Sale[];
}

interface MonthlyReport {
  year: number;
  month: number;
  total_amount: number;
  total_cost: number;
  total_profit: number;
  sales_count: number;
  items: Sale[];
  topProducts: Array<{ product: any; quantity: number; revenue: number }>;
}

interface ReportCardProps {
  report: DailyReport | MonthlyReport;
  type: "daily" | "monthly";
}

export default function ReportCard({ report, type }: ReportCardProps) {
  const profitMargin =
    report.total_amount > 0
      ? ((report.total_profit / report.total_amount) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-medium text-black">
          {type === "daily" ? "Günlük" : "Aylık"} Özet
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Toplam Satış</div>
            <div className="text-2xl font-light text-black">
              {formatPrice(report.total_amount)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {report.sales_count} satış
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Toplam Maliyet</div>
            <div className="text-2xl font-light text-gray-700">
              {formatPrice(report.total_cost)}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Toplam Kar</div>
            <div
              className={`text-2xl font-light ${
                report.total_profit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPrice(report.total_profit)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {profitMargin}% kar marjı
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Satış Sayısı</div>
            <div className="text-2xl font-light text-black">
              {report.sales_count}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {type === "daily" ? "bugün" : "bu ay"}
            </div>
          </div>
        </div>

        {report.items.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-black mb-4">Satış Detayları</h4>
            <div className="space-y-2">
              {report.items.slice(0, 10).map((sale) => (
                <div
                  key={sale.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        sale.sale_type === "online"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {sale.sale_type === "online" ? "Online" : "Tezgah"}
                    </span>
                    <span className="text-sm text-gray-700">
                      {new Date(sale.sale_date).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-black">
                      {formatPrice(sale.total_amount)}
                    </div>
                    <div className="text-xs text-green-600">
                      {formatPrice(sale.total_profit)} kar
                    </div>
                  </div>
                </div>
              ))}
              {report.items.length > 10 && (
                <div className="text-sm text-gray-500 text-center pt-2">
                  +{report.items.length - 10} satış daha
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
