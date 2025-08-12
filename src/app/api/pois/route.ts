import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET all POIs
export async function GET() {
  try {
    const pois = await DatabaseService.getPois();
    // The 'position' field is not in the database, so we construct it from latitude and longitude
    const formattedPois = pois.map(poi => ({
      ...poi,
      position: [poi.latitude, poi.longitude]
    }));
    return NextResponse.json(formattedPois);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch POIs', details: errorMessage }, { status: 500 });
  }
}

// POST a new POI
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, position, description, address, phone, website, imageUrl } = body;

    if (!name || !category || !position) {
      return NextResponse.json({ error: 'Missing required fields: name, category, and position' }, { status: 400 });
    }

    const newPoi = await DatabaseService.createPoi({
      name,
      category,
      latitude: position[0],
      longitude: position[1],
      description,
      address,
      phone,
      website,
      imageUrl,
    });

    return NextResponse.json(newPoi, { status: 201 });
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create POI', details: errorMessage }, { status: 500 });
  }
}

// PUT (update) an existing POI
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, position, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }
    
    if (position) {
      updates.latitude = position[0];
      updates.longitude = position[1];
    }

    const updatedPoi = await DatabaseService.updatePoi(id, updates);
    return NextResponse.json(updatedPoi);
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update POI', details: errorMessage }, { status: 500 });
  }
}

// DELETE a POI
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    await DatabaseService.deletePoi(id);
    return NextResponse.json({ message: 'POI deleted successfully' });
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete POI', details: errorMessage }, { status: 500 });
  }
}
