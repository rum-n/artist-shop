/*
 * Shared between server and client, so nothing here may import the database.
 */
export const INSTAGRAM_POSTS_KEY = "instagramPosts";

export type InstagramPost = {
  /** An image the artist controls — uploaded here, not an Instagram CDN URL,
   *  which is signed and expires within days. */
  image: string;
  /** The post this thumbnail links to. */
  url: string;
};

export const MAX_INSTAGRAM_POSTS = 8;

export function parseInstagramPosts(value: unknown): InstagramPost[] {
  const list =
    Array.isArray(value)
      ? value
      : typeof value === "object" && value !== null
        ? (value as { posts?: unknown }).posts
        : null;

  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .flatMap((entry) => {
      if (typeof entry !== "object" || entry === null) return [];
      const { image, url } = entry as { image?: unknown; url?: unknown };
      if (typeof image !== "string" || !image.startsWith("http")) return [];
      if (typeof url !== "string" || !url.startsWith("http")) return [];
      return [{ image, url }];
    })
    .slice(0, MAX_INSTAGRAM_POSTS);
}
