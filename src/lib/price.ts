/**
 * Every price on the site is stored, displayed and charged in euro — the
 * Stripe session in /api/checkout uses `currency: 'eur'` — so all display
 * goes through here to keep the symbol and grouping consistent per locale.
 */
export function formatPrice(price: number, locale = "en"): string {
  const fractionDigits = Number.isInteger(price) ? 0 : 2;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(price);
}
