import { useState } from "react";
import { initializePaddle, getPaddlePriceId } from "@/lib/paddle";

export function usePaddleCheckout() {
  const [loading, setLoading] = useState(false);

  const openCheckout = async (options: {
    priceId: string;
    quantity: number;
    customerEmail?: string;
    customData?: Record<string, string>;
    successUrl?: string;
  }) => {
    setLoading(true);
    try {
      await initializePaddle();
      const paddlePriceId = await getPaddlePriceId(options.priceId);
      const paddle = window.Paddle;
      if (!paddle) throw new Error("Paddle SDK not available");

      const checkoutOptions: Parameters<typeof paddle.Checkout.open>[0] = {
        items: [{ priceId: paddlePriceId, quantity: options.quantity }],
        settings: {
          displayMode: "overlay",
          successUrl: options.successUrl || `${window.location.origin}/checkout/success`,
          allowLogout: false,
          variant: "one-page",
        },
      };
      if (options.customerEmail) checkoutOptions.customer = { email: options.customerEmail };
      if (options.customData) checkoutOptions.customData = options.customData;
      paddle.Checkout.open(checkoutOptions);
    } finally {
      setLoading(false);
    }
  };

  return { openCheckout, loading };
}
