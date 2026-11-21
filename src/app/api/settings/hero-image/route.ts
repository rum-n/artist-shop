import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadImage } from "@/lib/uploadImage";
import { requireAdmin } from "@/lib/requireAdmin";

// GET endpoint to retrieve the current hero image
export async function GET() {
  try {
    const heroSetting = await db.siteSettings.findUnique({
      where: { key: "heroImage" },
    });

    const homepageContent = await db.siteSettings.findUnique({
      where: { key: "homepageContent" },
    });

    if (heroSetting && heroSetting.value) {
      // Extract the URL from the JSON value
      const imageUrl =
        typeof heroSetting.value === "string"
          ? heroSetting.value
          : (heroSetting.value as { url: string }).url || null;

      // Ensure the image URL is absolute (not relative to locale)
      const processedImageUrl = imageUrl
        ? imageUrl.startsWith("http")
          ? imageUrl
          : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${imageUrl}`
        : null;

      return NextResponse.json({
        imageUrl: processedImageUrl,
        homepageContent,
      });
    } else {
      return NextResponse.json({ imageUrl: null, homepageContent: null });
    }
  } catch (error) {
    console.error("Error fetching hero image:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the hero image" },
      { status: 500 }
    );
  }
}

// POST endpoint to update the hero image
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const denied = await requireAdmin();
    if (denied) {
      return denied;
    }

    // Parse form data
    const formData = await request.formData();
    const heroImage = formData.get("heroImage");

    if (!heroImage || !(heroImage instanceof Blob)) {
      return NextResponse.json(
        { message: "No image provided" },
        { status: 400 }
      );
    }

    // Upload the image
    const imageUrl = await uploadImage(heroImage);

    // Update or create the hero image setting in the database
    const heroSetting = await db.siteSettings.upsert({
      where: { key: "heroImage" },
      update: {
        value: { url: imageUrl },
        updatedAt: new Date(),
      },
      create: {
        key: "heroImage",
        value: { url: imageUrl },
      },
    });

    // Extract the URL from the JSON value and ensure it's absolute
    const responseUrl =
      typeof heroSetting.value === "string"
        ? heroSetting.value
        : (heroSetting.value as { url: string }).url || null;

    const processedImageUrl = responseUrl
      ? responseUrl.startsWith("http")
        ? responseUrl
        : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${responseUrl}`
      : null;

    return NextResponse.json(
      {
        message: "Hero image updated successfully",
        imageUrl: processedImageUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating hero image:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the hero image" },
      { status: 500 }
    );
  }
}
