import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";

function parseDescription(description: string | null) {
  if (!description) return { en: "", bg: "" };
  try {
    return JSON.parse(description);
  } catch {
    return { en: description, bg: "" };
  }
}

export async function GET() {
  try {
    const series = await db.series.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    const processed = series.map((s) => ({
      ...s,
      description: parseDescription(s.description),
    }));

    return NextResponse.json({ series: processed });
  } catch (error) {
    console.error("Error fetching series:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching series" },
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

    const existing = await db.series.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { message: "A series with this slug already exists" },
        { status: 400 }
      );
    }

    const series = await db.series.create({
      data: {
        name,
        slug,
        description: JSON.stringify(description),
        order,
      },
    });

    return NextResponse.json({ series }, { status: 201 });
  } catch (error) {
    console.error("Error creating series:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the series" },
      { status: 500 }
    );
  }
}
