import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

async function getProducts(): Promise<Product[]> {
  // Directus collections are not set up yet
  return [];
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-4xl font-light tracking-wide text-black">
            Lumera Collection
          </h2>
          <p className="mx-auto max-w-2xl font-sans text-sm font-light text-gray-600">
            Handcrafted jewelry pieces that celebrate elegance and timeless
            beauty
          </p>
        </section>

        {/* Products Grid */}
        {products.length > 0 ? (
          <section>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : (
          <div className="py-20 text-center">
            <p className="font-serif text-2xl font-light text-gray-700">
              Yakında Gelecek
            </p>
            <p className="mt-2 font-sans text-sm text-gray-500">Coming Soon</p>
          </div>
        )}
      </main>
    </div>
  );
}
