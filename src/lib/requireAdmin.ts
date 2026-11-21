import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Guards an admin-only endpoint.
 *
 * Checking only that a session exists is not enough: a `customer` session is
 * a perfectly valid session, so a signed-in buyer would otherwise be able to
 * edit artworks and site settings.
 *
 * Returns the response to send back when the caller isn't an admin, or null
 * when the request may proceed.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user?.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return null;
}
