import type { Sale } from "@/types";
import { formatPrice } from "@/lib/utils";

interface SalesTableProps {
  sales: Sale[];
}

export default function SalesTable({ sales }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500">Henüz satış kaydı yok</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
              Tarih
            </th>
            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
              Tip
            </th>
            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
              Ürünler
            </th>
            <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">
              Tutar
            </th>
            <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">
              Maliyet
            </th>
            <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">
              Kar
            </th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr
              key={sale.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-4 px-6 text-sm text-gray-700">
                {new Date(sale.sale_date).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </td>
              <td className="py-4 px-6">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    sale.sale_type === "online"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {sale.sale_type === "online" ? "Online" : "Tezgah"}
                </span>
              </td>
              <td className="py-4 px-6 text-sm text-gray-700">
                {sale.sale_items && sale.sale_items.length > 0 ? (
                  <div className="space-y-1">
                    {sale.sale_items.map((item) => {
                      const product =
                        typeof item.product === "object" ? item.product : null;
                      return (
                        <div key={item.id}>
                          {product?.name || "Bilinmeyen"} x {item.quantity}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td className="py-4 px-6 text-sm text-right font-medium text-black">
                {formatPrice(sale.total_amount)}
              </td>
              <td className="py-4 px-6 text-sm text-right text-gray-700">
                {formatPrice(sale.total_cost)}
              </td>
              <td className="py-4 px-6 text-sm text-right font-medium text-green-600">
                {formatPrice(sale.total_profit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
