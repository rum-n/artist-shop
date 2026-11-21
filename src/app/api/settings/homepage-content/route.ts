import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) {
      return denied;
    }

    let content;
    try {
      const body = await request.json();
      content = body.content;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return NextResponse.json({
        message: 'Invalid JSON in request body',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }

    if (content === undefined) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    const homepageContentSetting = await db.siteSettings.upsert({
      where: { key: 'homepageContent' },
      update: {
        value: { content },
        updatedAt: new Date(),
      },
      create: {
        key: 'homepageContent',
        value: { content },
      },
    });

    return NextResponse.json({
      message: 'Homepage content updated successfully',
      content: typeof homepageContentSetting.value === 'string'
        ? homepageContentSetting.value
        : (homepageContentSetting.value as { content: string }).content || ''
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating homepage content:', error);
    return NextResponse.json({
      message: 'Failed to update homepage content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}