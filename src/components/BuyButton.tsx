"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslations, useLocale } from "next-intl";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function BuyButton({
  artworkId,
  inStock,
}: {
  artworkId: string;
  inStock: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("BuyButton");
  const locale = useLocale();

  const handlePurchase = async () => {
    setIsLoading(true);

    try {
      // 1. Create checkout session on server
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkId, locale }),
      });

      const { sessionId } = await response.json();

      // 2. Use Stripe to redirect to checkout
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Failed to load Stripe");

      // Redirect to Stripe checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error("Stripe redirect error:", error);
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error initiating checkout:", error);
      alert("Unable to process purchase. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={!inStock || isLoading}
      className={`w-full py-3 px-6 cursor-pointer ${
        !inStock
          ? "bg-primary-300 cursor-not-allowed"
          : "bg-ink hover:opacity-80 transition-opacity"
      } text-white`}
    >
      {isLoading ? t("processing") : inStock ? t("text") : t("soldOut")}
    </button>
  );
}
