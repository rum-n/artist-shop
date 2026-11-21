import { db } from "@/lib/db";
import { normalizeImages } from "@/lib/imageUrl";
import { ArtworkImage } from "@/types/Artwork";

export type HomeArtwork = {
  id: string;
  title: string;
  slug: string;
  price: number;
  medium: string;
  year: number;
  images: ArtworkImage[];
};

export type HomeData = {
  heroImage: string | null;
  homepageContent: string | null;
  featuredArtworks: HomeArtwork[];
};

/** Legacy settings rows stored a bare Cloudinary path rather than a full URL. */
function toAbsoluteUrl(value: unknown): string | null {
  const url =
    typeof value === "string"
      ? value
      : (value as { url?: string } | null)?.url ?? null;

  if (!url) {
    return null;
  }

  return url.startsWith("http")
    ? url
    : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${url}`;
}

/**
 * Read straight from the database so the home page can be server-rendered.
 * Going through our own HTTP endpoints from the client cost two extra round
 * trips before the hero image's URL was even known to the browser.
 */
export async function getHomeData(): Promise<HomeData> {
  const [heroSetting, contentSetting, artworks] = await Promise.all([
    db.siteSettings.findUnique({ where: { key: "heroImage" } }),
    db.siteSettings.findUnique({ where: { key: "homepageContent" } }),
    db.artwork.findMany({
      where: { featured: true, inStock: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const content = contentSetting?.value as { content?: string } | null;

  return {
    heroImage: toAbsoluteUrl(heroSetting?.value),
    homepageContent: content?.content ?? null,
    featuredArtworks: artworks.map((artwork) => ({
      id: artwork.id,
      title: artwork.title,
      slug: artwork.slug,
      price: artwork.price,
      medium: artwork.medium,
      year: artwork.year,
      images: normalizeImages(artwork.images, artwork.title),
    })),
  };
}
