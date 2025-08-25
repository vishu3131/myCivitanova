import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database.ts';

// GET all image sections and their images
export async function GET() {
  try {
    const sections = await DatabaseService.getSiteImageSections();
    const sectionsWithImages = await Promise.all(
      sections.map(async (section) => {
        const images = await DatabaseService.getImagesBySection(section.id);
        return { ...section, images };
      })
    );
    return NextResponse.json(sectionsWithImages);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch site images', details: errorMessage }, { status: 500 });
  }
}

// POST a new image to a section
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { section_id, image_url, alt_text, display_order } = body;

    if (!section_id || !image_url) {
      return NextResponse.json({ error: 'Missing required fields: section_id and image_url' }, { status: 400 });
    }

    const newImage = await DatabaseService.createSiteImage({
      section_id,
      image_url,
      alt_text,
      display_order: display_order || 0,
      is_active: true,
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create site image', details: errorMessage }, { status: 500 });
  }
}

// PUT (update) an existing image
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    const updatedImage = await DatabaseService.updateSiteImage(id, updates);
    return NextResponse.json(updatedImage);
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update site image', details: errorMessage }, { status: 500 });
  }
}

// DELETE an image
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing required query parameter: id' }, { status: 400 });
    }

    await DatabaseService.deleteSiteImage(id);
    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete site image', details: errorMessage }, { status: 500 });
  }
}