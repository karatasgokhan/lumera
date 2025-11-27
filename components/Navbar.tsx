import Link from "next/link";
import { readItems } from "@directus/sdk";
import { directus } from "@/lib/directus";
import type { Category } from "@/types";

async function getCategories(): Promise<Category[]> {
  try {
    const categories = await directus.request(
      readItems("categories", {
        fields: ["id", "name", "slug"],
        sort: ["name"],
      })
    );
    return categories as Category[];
  } catch (error) {
    console.error("Error fetching categories:", error);
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

export default async function Navbar() {
  const categories = await getCategories();

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <Link href="/" className="group">
            <h1 className="font-serif text-3xl font-light tracking-wider text-black transition-opacity group-hover:opacity-70">
              LUMERA
            </h1>
          </Link>

          {/* Category Links */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="font-sans text-sm font-light uppercase tracking-wider text-gray-700 transition-colors hover:text-black"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
