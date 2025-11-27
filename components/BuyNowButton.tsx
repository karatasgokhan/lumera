"use client";

import { Button } from "@/components/ui/button";

interface BuyNowButtonProps {
  isSoldOut: boolean;
}

export default function BuyNowButton({ isSoldOut }: BuyNowButtonProps) {
  const handleBuyNow = () => {
    console.log("Redirect to Shopier");
    // TODO: Implement Shopier integration
  };

  return (
    <Button
      onClick={handleBuyNow}
      disabled={isSoldOut}
      className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50"
      size="lg"
    >
      {isSoldOut ? "Sold Out" : "Buy Now"}
    </Button>
  );
}
