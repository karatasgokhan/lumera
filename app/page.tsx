import { Suspense } from "react";
import { readItems } from "@directus/sdk";
import { directus } from "@/lib/directus";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

async function getProducts(): Promise<Product[]> {
  try {
    const products = await directus.request(
      readItems("products", {
        fields: ["*"],
        filter: {
          is_active: {
            _eq: true,
          },
        },
        sort: ["-date_created"],
      })
    );
    return products as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    if (error && typeof error === "object" && "extensions" in error) {
      console.error("Directus error extensions:", error.extensions);
    }
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-white">
      <Suspense
        fallback={
          <header className="border-b border-gray-200 bg-white">
            <nav className="container mx-auto px-4 py-6">
              <div className="flex flex-col items-center space-y-6">
                <h1 className="font-serif text-3xl font-light tracking-wider text-black">
                  LUMERA
                </h1>
              </div>
            </nav>
          </header>
        }
      >
        <Navbar />
      </Suspense>

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
            <p className="font-sans text-gray-500">
              No products available at the moment.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
