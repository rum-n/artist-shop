import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const name = (body.name as string)?.trim();
    const slug = (body.slug as string)?.trim();
    const description = body.description ?? { en: "", bg: "" };
    const order = Number.isFinite(body.order) ? Number(body.order) : 0;

    if (!name || !slug) {
      return NextResponse.json(
        { message: "Name and slug are required" },
        { status: 400 }
      );
    }

    const existing = await db.series.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Series not found" }, { status: 404 });
    }

    // Slug must stay unique across other series.
    if (slug !== existing.slug) {
      const slugTaken = await db.series.findFirst({
        where: { slug, id: { not: id } },
      });
      if (slugTaken) {
        return NextResponse.json(
          { message: "A series with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const series = await db.series.update({
      where: { id },
      data: {
        name,
        slug,
        description: JSON.stringify(description),
        order,
      },
    });

    return NextResponse.json({ series });
  } catch (error) {
    console.error("Error updating series:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the series" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.series.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Series not found" }, { status: 404 });
    }

    // Detach the series from its artworks before removing it so no artwork
    // is left pointing at a series that no longer exists.
    await db.artwork.updateMany({
      where: { seriesId: id },
      data: { seriesId: null },
    });

    await db.series.delete({ where: { id } });

    return NextResponse.json({ message: "Series deleted successfully" });
  } catch (error) {
    console.error("Error deleting series:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the series" },
      { status: 500 }
    );
  }
}
