import { NextRequest, NextResponse } from "next/server";
import { createSale, createSaleItems } from "@/lib/directus";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sale_date, sale_type, notes, items } = body;

    // Validate required fields
    if (!sale_date || !sale_type) {
      return NextResponse.json(
        { error: "Satış tarihi ve satış tipi gereklidir" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "En az bir ürün seçilmelidir" },
        { status: 400 }
      );
    }

    // Create sale
    const sale = await createSale({
      sale_date,
      sale_type,
      notes,
    });

    // Create sale items
    await createSaleItems(sale.id, items);

    return NextResponse.json({ success: true, sale });
  } catch (error: any) {
    console.error("API Error:", error);
    console.error("Error details:", {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
    });

    // Provide more detailed error messages
    const errorMessage = error?.message || "Bilinmeyen hata";
    const statusCode = error?.response?.status || 500;
    const errorData = error?.response?.data;

    // Check for common Directus errors
    if (errorMessage.includes("permission") || statusCode === 403) {
      return NextResponse.json(
        {
          error:
            "İzin hatası: Directus'ta 'sales' ve 'sale_items' koleksiyonları için create izni kontrol edin",
          details: errorData,
        },
        { status: 403 }
      );
    }

    if (errorMessage.includes("Collection") || statusCode === 500) {
      return NextResponse.json(
        {
          error:
            "Veritabanı hatası: Collection bulunamadı veya izin sorunu var",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Satış oluşturulurken hata oluştu: ${errorMessage}` },
      { status: statusCode }
    );
  }
}
