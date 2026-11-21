/**
 * Lets Cloudinary pick the format and compression and caps the delivered
 * width. Only the width is constrained, so the image keeps its own aspect
 * ratio — nothing here may crop an artwork.
 *
 * The parameters are chained with slashes rather than joined with commas
 * (`w_640/f_auto/q_auto`, not `f_auto,q_auto,w_640`) because a `srcset`
 * attribute is itself comma-separated: a comma inside one of its URLs makes
 * the browser read a single candidate as several broken ones.
 */
export function optimizedImageUrl(url: string, width = 800): string {
  return url.includes("/upload/")
    ? url.replace("/upload/", `/upload/w_${width}/f_auto/q_auto/`)
    : url;
}

const RESPONSIVE_WIDTHS = [640, 960, 1280, 1920, 2560];

/**
 * A srcset across the usual viewport widths, so a phone fetches a ~24KB file
 * where a desktop fetches ~144KB, instead of everyone getting the original.
 */
export function cloudinarySrcSet(
  url: string,
  widths: number[] = RESPONSIVE_WIDTHS
): string {
  return widths
    .map((width) => `${optimizedImageUrl(url, width)} ${width}w`)
    .join(", ");
}
