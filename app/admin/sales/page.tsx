import { getProducts, getSales } from "@/lib/directus";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import SaleForm from "@/components/admin/SaleForm";
import SalesTable from "@/components/admin/SalesTable";

export default async function SalesPage() {
  const products = await getProducts({ is_active: { _eq: true } });
  const sales = await getSales({ limit: 50 });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-4xl font-light text-black mb-2">
              Satış İşaretleme
            </h1>
            <p className="text-gray-600">
              Tek tek veya toplu satış işaretle (Online veya Tezgah)
            </p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-gray-600 hover:text-black"
          >
            ← Dashboard'a Dön
          </Link>
        </div>

        {/* Sale Form */}
        <div className="mb-8">
          <SaleForm products={products} />
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="font-medium text-black">Son Satışlar</h2>
          </div>
          <SalesTable sales={sales} />
        </div>
      </div>
    </div>
  );
}
