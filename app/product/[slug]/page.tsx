import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { readItems } from "@directus/sdk";
import { directus } from "@/lib/directus";
import Navbar from "@/components/Navbar";
import BuyNowButton from "@/components/BuyNowButton";
import { Badge } from "@/components/ui/badge";
import { getImageUrlWithTransformations, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const products = await directus.request(
      readItems("products", {
        fields: ["*"],
        filter: {
          slug: {
            _eq: slug,
          },
          is_active: {
            _eq: true,
          },
        },
        limit: 1,
      })
    );

    if (products.length === 0) {
      return null;
    }

    return products[0] as Product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  // Get images array
  const images =
    product.images && Array.isArray(product.images) ? product.images : [];
  const mainImage = images.length > 0 ? images[0] : null;
  const thumbnailImages = images.slice(1);

  const hasDiscount =
    product.discount_price && product.discount_price < product.price;
  const displayPrice = hasDiscount ? product.discount_price! : product.price;
  const originalPrice = hasDiscount ? product.price : null;
  const isSoldOut = product.stock_quantity === 0;

  const mainImageUrl = getImageUrlWithTransformations(mainImage, {
    width: 1200,
    quality: 90,
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
              {mainImageUrl ? (
                <Image
                  src={mainImageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100">
                  <span className="text-sm text-gray-400">No Image</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {thumbnailImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {thumbnailImages.map((image, index) => {
                  const thumbUrl = getImageUrlWithTransformations(image, {
                    width: 300,
                    quality: 80,
                  });
                  return (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden bg-gray-50"
                    >
                      {thumbUrl ? (
                        <Image
                          src={thumbUrl}
                          alt={`${product.name} - View ${index + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 25vw, 12.5vw"
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col space-y-6">
            {/* Category Breadcrumb */}
            {product.category &&
              typeof product.category === "object" &&
              "slug" in product.category && (
                <div className="text-sm">
                  <Link
                    href={`/category/${product.category.slug}`}
                    className="font-sans font-light uppercase tracking-wider text-gray-500 hover:text-black"
                  >
                    {product.category.name}
                  </Link>
                </div>
              )}

            {/* Product Name */}
            <h1 className="font-serif text-4xl font-light tracking-wide text-black">
              {product.name}
            </h1>

            {/* SKU */}
            {product.sku && (
              <p className="font-sans text-sm text-gray-500">
                SKU: {product.sku}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-sans text-3xl font-medium text-black">
                {formatPrice(displayPrice)}
              </span>
              {originalPrice && (
                <span className="font-sans text-lg text-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            {/* Material */}
            {product.material && (
              <div>
                <p className="mb-1 font-sans text-sm font-medium uppercase tracking-wider text-gray-700">
                  Material
                </p>
                <p className="font-sans text-sm text-gray-600">
                  {product.material}
                </p>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <p className="mb-2 font-sans text-sm font-medium uppercase tracking-wider text-gray-700">
                  Description
                </p>
                <div
                  className="prose prose-sm max-w-none font-sans text-sm text-gray-600"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Stock Status */}
            <div>
              {isSoldOut ? (
                <Badge variant="destructive" className="mb-4">
                  Sold Out
                </Badge>
              ) : (
                <p className="mb-4 font-sans text-sm text-gray-600">
                  In Stock ({product.stock_quantity} available)
                </p>
              )}
            </div>

            {/* Buy Now Button */}
            <BuyNowButton isSoldOut={isSoldOut} />
          </div>
        </div>
      </main>
    </div>
  );
}
