import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/requireAdmin';

// GET endpoint to retrieve the current about me content
export async function GET() {
  try {
    const aboutMeSetting = await db.siteSettings.findUnique({
      where: { key: 'aboutMe' },
    });

    if (aboutMeSetting && aboutMeSetting.value) {
      // Extract the content from the JSON value
      const content = typeof aboutMeSetting.value === 'string'
        ? aboutMeSetting.value
        : (aboutMeSetting.value as { content: string }).content || '';

      return NextResponse.json({ content });
    } else {
      return NextResponse.json({ content: '' });
    }
  } catch (error) {
    console.error('Error fetching about me content:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the about me content' },
      { status: 500 }
    );
  }
}

// POST endpoint to update the about me content
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const denied = await requireAdmin();
    if (denied) {
      return denied;
    }

    // Parse request body
    const { content } = await request.json();

    if (content === undefined) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    // Update or create the about me setting in the database
    const aboutMeSetting = await db.siteSettings.upsert({
      where: { key: 'aboutMe' },
      update: {
        value: { content },
        updatedAt: new Date(),
      },
      create: {
        key: 'aboutMe',
        value: { content },
      },
    });

    return NextResponse.json({
      message: 'About me content updated successfully',
      content: typeof aboutMeSetting.value === 'string'
        ? aboutMeSetting.value
        : (aboutMeSetting.value as { content: string }).content || ''
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating about me content:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the about me content' },
      { status: 500 }
    );
  }
}