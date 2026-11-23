"use client";

import { useEffect, useState } from "react";
import { OPEN_SHOP, parseShopStatus, ShopStatus } from "@/lib/shopStatus";

/**
 * Reads whether the shop is open.
 *
 * `loaded` matters: until the request resolves the answer is unknown, and
 * rendering the open state in the meantime would flash buyable content before
 * replacing it with the closed notice. Callers should wait for it.
 *
 * It defaults to open so a failed request never hides the shop — the checkout
 * route enforces the closure regardless of what the page shows.
 */
export function useShopStatus(): { status: ShopStatus; loaded: boolean } {
  const [status, setStatus] = useState<ShopStatus>(OPEN_SHOP);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/settings/shop-status")
      .then((response) => response.json())
      .then((data) => setStatus(parseShopStatus(data.shopStatus)))
      .catch((error) => console.error("Error fetching shop status:", error))
      .finally(() => setLoaded(true));
  }, []);

  return { status, loaded };
}
