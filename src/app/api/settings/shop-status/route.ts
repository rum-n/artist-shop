import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { SHOP_STATUS_KEY } from "@/lib/shopStatus";
import { getShopStatus } from "@/lib/shopStatus.server";

// Public: the shop and artwork pages need to know whether buying is open.
export async function GET() {
  try {
    return NextResponse.json({ shopStatus: await getShopStatus() });
  } catch (error) {
    console.error("Error fetching shop status:", error);
    return NextResponse.json(
      { message: "Failed to fetch shop status" },
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
    const closed = body.closed === true;
    const message =
      typeof body.message === "object" && body.message !== null
        ? body.message
        : {};

    const setting = await db.siteSettings.upsert({
      where: { key: SHOP_STATUS_KEY },
      update: { value: { closed, message }, updatedAt: new Date() },
      create: { key: SHOP_STATUS_KEY, value: { closed, message } },
    });

    return NextResponse.json({ shopStatus: setting.value });
  } catch (error) {
    console.error("Error updating shop status:", error);
    return NextResponse.json(
      { message: "Failed to update shop status" },
      { status: 500 }
    );
  }
}
