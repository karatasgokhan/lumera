import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumera - Takı E-Ticaret",
  description: "Lumera takı koleksiyonu - Özel tasarım takılar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
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
        {children}
      </body>
    </html>
  );
}
