/**
 * An image is only considered valid if it's a fully-qualified https URL
 * (i.e. an actual uploaded Cloudinary secure_url). This guards against
 * legacy/garbage values like "/uploads/...-[object File]" that were never
 * really uploaded and render as broken images.
 */
export function isValidImageUrl(url: unknown): url is string {
  return typeof url === "string" && /^https:\/\/\S+$/.test(url);
}

type ImageLike = { url?: unknown; alt?: unknown };

/**
 * Returns true when an images array contains only entries backed by a valid
 * uploaded URL. Used to validate client-supplied images before persisting.
 */
export function areImagesValid(images: unknown): boolean {
  return (
    Array.isArray(images) &&
    images.every(
      (image) =>
        typeof image === "object" &&
        image !== null &&
        isValidImageUrl((image as ImageLike).url)
    )
  );
}
