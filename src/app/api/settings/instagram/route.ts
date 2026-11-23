import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { INSTAGRAM_POSTS_KEY, parseInstagramPosts } from "@/lib/instagram";
import { getInstagramPosts } from "@/lib/instagram.server";

export async function GET() {
  try {
    return NextResponse.json({ posts: await getInstagramPosts() });
  } catch (error) {
    console.error("Error fetching instagram posts:", error);
    return NextResponse.json(
      { message: "Failed to fetch the photo strip" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) {
      return denied;
    }

    const body = await request.json();
    // Anything without a real image and a real link is dropped, so a
    // half-filled row can never render as a broken thumbnail.
    const posts = parseInstagramPosts(body.posts);

    const setting = await db.siteSettings.upsert({
      where: { key: INSTAGRAM_POSTS_KEY },
      update: { value: { posts }, updatedAt: new Date() },
      create: { key: INSTAGRAM_POSTS_KEY, value: { posts } },
    });

    return NextResponse.json({ posts: parseInstagramPosts(setting.value) });
  } catch (error) {
    console.error("Error updating instagram posts:", error);
    return NextResponse.json(
      { message: "Failed to update the photo strip" },
      { status: 500 }
    );
  }
}
