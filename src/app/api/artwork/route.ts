import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { areImagesValid, isValidImageUrl } from "@/lib/imageUrl";
import { Artwork } from "@/types/Artwork";

type Dimensions = {
  width: string | number;
  height: string | number;
  unit: string;
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Images arrive as Cloudinary URLs already uploaded via /api/upload, so the
    // body stays small enough to never hit the platform's request size limit.
    const body = await request.json();

    const title = body.title as string;
    const slug = body.slug as string;
    const description = body.description;
    const price = Number(body.price);
    const medium = body.medium as string;
    const year = Number(body.year);
    const width = Number(body.dimensions?.width);
    const height = Number(body.dimensions?.height);
    const unit = body.dimensions?.unit as string;
    const inStock = Boolean(body.inStock);
    const featured = Boolean(body.featured);
    const seriesId = body.seriesId ? (body.seriesId as string) : null;

    // Validate required fields
    if (
      !title ||
      !slug ||
      !description ||
      isNaN(price) ||
      !medium ||
      isNaN(year) ||
      isNaN(width) ||
      isNaN(height) ||
      !unit
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Reject anything that isn't a real uploaded URL so broken image
    // references can never be persisted.
    if (!areImagesValid(body.images)) {
      return NextResponse.json(
        { message: "One or more images have an invalid URL" },
        { status: 400 }
      );
    }

    const imageUrls = (body.images as { url: string; alt?: string }[]).map(
      (image) => ({
        url: image.url,
        alt: image.alt || title, // Default alt text
      })
    );

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { message: "At least one image is required" },
        { status: 400 }
      );
    }

    // Create artwork in database using Prisma
    const artwork = await db.artwork.create({
      data: {
        title,
        slug,
        description: JSON.stringify(description),
        price,
        medium,
        year,
        dimensions: {
          width,
          height,
          unit,
        },
        images: imageUrls,
        inStock,
        featured,
        seriesId,
      },
    });

    return NextResponse.json({ artwork }, { status: 201 });
  } catch (error) {
    console.error("Error creating artwork:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the artwork" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";
    const inStock = searchParams.get("inStock");

    // Build where clause based on query parameters
    const where: { featured?: boolean; inStock?: boolean } = {};
    if (featured) {
      where.featured = true;
    }
    if (inStock === "true") {
      where.inStock = true;
    } else if (inStock === "false") {
      where.inStock = false;
    }

    const artworks = await db.artwork.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: "desc" },
    });

    // Process artworks to ensure image URLs are absolute
    const processedArtworks: Artwork[] = artworks.map((artwork) => {
      let description;
      try {
        description = JSON.parse(artwork.description);
      } catch {
        description = { en: artwork.description, bg: "" };
      }

      return {
        ...artwork,
        description,
        dimensions:
          typeof artwork.dimensions === "object" && artwork.dimensions !== null
            ? {
                width: String((artwork.dimensions as Dimensions).width || ""),
                height: String((artwork.dimensions as Dimensions).height || ""),
                unit: String((artwork.dimensions as Dimensions).unit || ""),
              }
            : { width: "", height: "", unit: "" },
        // Only surface images backed by a real uploaded URL. Anything else
        // (legacy junk paths, missing urls) is dropped so the UI never tries
        // to render a broken image.
        images:
          artwork.images
            ?.map((image) => {
              if (
                typeof image === "object" &&
                image !== null &&
                isValidImageUrl((image as { url?: unknown }).url)
              ) {
                return {
                  url: (image as { url: string }).url,
                  alt: (image as { alt?: string }).alt || artwork.title,
                };
              }
              return null;
            })
            .filter((image): image is { url: string; alt: string } =>
              image !== null
            ) || [],
      };
    });

    return NextResponse.json({ artworks: processedArtworks });
  } catch (error) {
    console.error("Error fetching artworks:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching artworks" },
      { status: 500 }
    );
  }
}
