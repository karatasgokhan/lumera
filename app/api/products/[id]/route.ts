import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/directus";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both sync and async params (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams.id;

    if (!productId) {
      return NextResponse.json(
        { error: "Ürün ID'si gerekli" },
        { status: 400 }
      );
    }

    console.log(`[API] Fetching product: ${productId}`);
    const product = await getProduct(productId);

    if (!product) {
      console.log(`[API] Product not found: ${productId}`);
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    console.log(`[API] Product found: ${product.name}`);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("[API] Error fetching product:", error);
    return NextResponse.json(
      {
        error: "Ürün bilgisi alınırken hata oluştu",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
