import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getImageUrlWithTransformations, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Get first image from images array
  const firstImage =
    product.images && Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : null;

  const imageUrl = getImageUrlWithTransformations(firstImage, {
    width: 600,
    quality: 85,
  });

  const isSoldOut = product.stock_quantity === 0;
  const hasDiscount =
    product.discount_price && product.discount_price < product.price;
  const displayPrice = hasDiscount ? product.discount_price! : product.price;
  const originalPrice = hasDiscount ? product.price : null;

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group h-full overflow-hidden border-0 bg-white shadow-none transition-shadow hover:shadow-lg">
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <span className="text-sm text-gray-400">No Image</span>
            </div>
          )}

          {/* Sold Out Badge */}
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Badge
                variant="destructive"
                className="bg-black/80 text-white backdrop-blur-sm"
              >
                Sold Out
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <h3 className="font-serif text-lg font-light text-black">
            {product.name}
          </h3>
        </CardContent>

        {/* Footer with Price */}
        <CardFooter className="flex flex-col items-start gap-1 p-4 pt-0">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-lg font-medium text-black">
              {formatPrice(displayPrice)}
            </span>
            {originalPrice && (
              <span className="font-sans text-sm text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
