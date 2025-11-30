"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Ürünler" },
  { href: "/admin/sales", label: "Satışlar" },
  { href: "/admin/reports", label: "Raporlar" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex gap-1">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-b-2 border-black text-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
