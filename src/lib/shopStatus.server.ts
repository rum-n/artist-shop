import { db } from "@/lib/db";
import { parseShopStatus, SHOP_STATUS_KEY, ShopStatus } from "@/lib/shopStatus";

/** Server-side read, for pages and for the checkout guard. */
export async function getShopStatus(): Promise<ShopStatus> {
  const setting = await db.siteSettings.findUnique({
    where: { key: SHOP_STATUS_KEY },
  });

  return parseShopStatus(setting?.value);
}
