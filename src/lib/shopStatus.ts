/*
 * Shared between server and client, so nothing here may import the database —
 * that would pull Prisma into the browser bundle. The server-side read lives
 * in shopStatus.server.ts.
 */
export const SHOP_STATUS_KEY = "shopStatus";

export type ShopStatus = {
  /** When true the shop is closed: nothing can be bought, site-wide. */
  closed: boolean;
  /** Per-locale note saying when it reopens. Falls back to a translation. */
  message: { [locale: string]: string };
};

export const OPEN_SHOP: ShopStatus = { closed: false, message: {} };

export function parseShopStatus(value: unknown): ShopStatus {
  if (typeof value !== "object" || value === null) {
    return OPEN_SHOP;
  }

  const raw = value as { closed?: unknown; message?: unknown };
  const message =
    typeof raw.message === "object" && raw.message !== null
      ? (raw.message as { [locale: string]: string })
      : {};

  return { closed: raw.closed === true, message };
}
