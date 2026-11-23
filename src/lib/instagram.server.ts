import { db } from "@/lib/db";
import {
  INSTAGRAM_POSTS_KEY,
  InstagramPost,
  parseInstagramPosts,
} from "@/lib/instagram";

/** Read server-side so the strip is in the HTML rather than fetched later. */
export async function getInstagramPosts(): Promise<InstagramPost[]> {
  const setting = await db.siteSettings.findUnique({
    where: { key: INSTAGRAM_POSTS_KEY },
  });

  return parseInstagramPosts(setting?.value);
}
