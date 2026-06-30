import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadImage } from "@/lib/uploadImage";
import { isValidImageUrl } from "@/lib/imageUrl";
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

    // Parse form data
    const formData = await request.formData();

    // Extract text fields
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = JSON.parse(formData.get("description") as string);
    const price = parseFloat(formData.get("price") as string);
    const medium = formData.get("medium") as string;
    const year = parseInt(formData.get("year") as string);
    const width = parseFloat(formData.get("width") as string);
    const height = parseFloat(formData.get("height") as string);
    const unit = formData.get("unit") as string;
    const inStock = formData.get("inStock") === "true";
    const featured = formData.get("featured") === "true";

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

    // Process images
    const imageUrls = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image-") && value instanceof Blob) {
        const imageUrl = await uploadImage(value);
        // Guard against an upload that didn't return a real URL, so we never
        // persist a broken image reference.
        if (!isValidImageUrl(imageUrl)) {
          return NextResponse.json(
            { message: "Image upload failed" },
            { status: 502 }
          );
        }
        imageUrls.push({
          url: imageUrl,
          alt: title, // Default alt text
        });
      }
    }

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
