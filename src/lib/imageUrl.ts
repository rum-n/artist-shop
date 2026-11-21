import { ArtworkImage } from "@/types/Artwork";

/**
 * An image is only considered valid if it's a fully-qualified https URL
 * (i.e. an actual uploaded Cloudinary secure_url). This guards against
 * legacy/garbage values like "/uploads/...-[object File]" that were never
 * really uploaded and render as broken images.
 */
export function isValidImageUrl(url: unknown): url is string {
  return typeof url === "string" && /^https:\/\/\S+$/.test(url);
}

type ImageLike = {
  url?: unknown;
  alt?: unknown;
  width?: unknown;
  height?: unknown;
};

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

/**
 * Drops anything that isn't backed by a real uploaded URL and fills in a
 * default alt, keeping Cloudinary's pixel dimensions where they were stored.
 * Used wherever artwork images cross the API boundary, so the shape the client
 * receives is always the same.
 */
export function normalizeImages(
  images: unknown,
  fallbackAlt: string
): ArtworkImage[] {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.flatMap((image) => {
    if (typeof image !== "object" || image === null) {
      return [];
    }

    const { url, alt, width, height } = image as ImageLike;
    if (!isValidImageUrl(url)) {
      return [];
    }

    return [
      {
        url,
        alt: typeof alt === "string" && alt ? alt : fallbackAlt,
        ...(typeof width === "number" ? { width } : {}),
        ...(typeof height === "number" ? { height } : {}),
      },
    ];
  });
}
