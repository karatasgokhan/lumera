import Link from "next/link";
import { getCategories } from "@/lib/directus";
import type { Category } from "@/types";

export default async function Navbar() {
  // Silently handle errors - if categories fail to load, just show empty array
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch (error) {
    // Silently fail - Navbar should still render even if categories fail
    categories = [];
  }

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
              <Link
                href="/"
                className="font-sans text-sm font-light uppercase tracking-wider text-gray-700 transition-colors hover:text-black"
              >
                Ana Sayfa
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="font-sans text-sm font-light uppercase tracking-wider text-gray-700 transition-colors hover:text-black"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/admin"
                className="font-sans text-sm font-light uppercase tracking-wider text-gray-700 transition-colors hover:text-black border-l border-gray-300 pl-6"
              >
                Admin
              </Link>
            </div>
          )}
          {categories.length === 0 && (
            <div className="flex items-center justify-center gap-6">
              <Link
                href="/"
                className="font-sans text-sm font-light uppercase tracking-wider text-gray-700 transition-colors hover:text-black"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/admin"
                className="font-sans text-sm font-light uppercase tracking-wider text-gray-700 transition-colors hover:text-black border-l border-gray-300 pl-6"
              >
                Admin
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
