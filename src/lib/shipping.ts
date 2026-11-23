import type Stripe from "stripe";

/**
 * Countries Stripe Checkout will accept a shipping address for. Stripe has no
 * "everywhere" option, so the list is explicit — extend it if the artist
 * starts shipping somewhere not named here.
 */
export const SHIPPING_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] =
  [
    // Bulgaria first — the artist's own market.
    "BG",
    // EU / EEA
    "AT", "BE", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
    "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI",
    "ES", "SE", "IS", "LI", "NO",
    // Rest of Europe
    "AL", "BA", "CH", "GB", "MD", "ME", "MK", "RS", "TR", "UA",
    // Elsewhere
    "AU", "BR", "CA", "IL", "JP", "KR", "MX", "NZ", "SG", "US", "ZA",
  ];
