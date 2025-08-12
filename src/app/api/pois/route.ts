import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET all POIs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceDemo = searchParams.get('demo') === '1' || searchParams.get('mode') === 'demo';
  const forceLive = searchParams.get('live') === '1' || searchParams.get('mode') === 'live';

  const fallbackPois = [
    {
      id: 'poi-001',
      name: 'Piazza XX Settembre',
      category: 'Piazza',
      latitude: 43.3085,
      longitude: 13.7208,
      description: 'Cuore pulsante della città, eventi e mercatini.',
      address: 'Piazza XX Settembre, Civitanova Marche',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80',
      position: [43.3085, 13.7208] as [number, number],
    },
    {
      id: 'poi-002',
      name: 'Lungomare Sud',
      category: 'Spiaggia',
      latitude: 43.3041,
      longitude: 13.7215,
      description: 'Passeggiata sul mare con locali e stabilimenti.',
      address: 'Lungomare Sud, Civitanova Marche',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      position: [43.3041, 13.7215] as [number, number],
    },
    {
      id: 'poi-003',
      name: 'Teatro Annibal Caro',
      category: 'Cultura',
      latitude: 43.3089,
      longitude: 13.7238,
      description: 'Storico teatro cittadino con stagione culturale.',
      address: 'Via Annibal Caro, Civitanova Marche',
      imageUrl: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&q=80',
      position: [43.3089, 13.7238] as [number, number],
    },
    {
      id: 'poi-004',
      name: 'Porto Turistico',
      category: 'Interesse',
      latitude: 43.3121,
      longitude: 13.7212,
      description: 'Area portuale con vista sul mare e ristoranti.',
      address: 'Molo, Civitanova Marche',
      imageUrl: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80',
      position: [43.3121, 13.7212] as [number, number],
    },
  ];

  if (forceDemo) {
    return NextResponse.json(fallbackPois);
  }

  try {
    const pois = await DatabaseService.getPois();
    const formattedPois = pois.map(poi => ({
      ...poi,
      position: [poi.latitude, poi.longitude]
    }));
    return NextResponse.json(formattedPois);
  } catch (error) {
    if (forceLive) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return NextResponse.json({ error: 'Failed to fetch POIs', details: errorMessage }, { status: 500 });
    }
    return NextResponse.json(fallbackPois);
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
