import { NextResponse } from 'next/server';

// Esempio di dati in memoria. Sostituire con un database reale.
let homeImages = [
  { id: 1, url: 'https://via.placeholder.com/800x400.png?text=Immagine+Home+1', source: 'link', isInCarousel: true, duration: 5 },
  { id: 2, url: 'https://via.placeholder.com/800x400.png?text=Immagine+Home+2', source: 'link', isInCarousel: false, duration: 7 },
];

export async function GET() {
  return NextResponse.json(homeImages);
}

export async function POST(request: Request) {
  const { url, source } = await request.json();
  if (!url || !source) {
    return NextResponse.json({ error: 'URL e source sono obbligatori' }, { status: 400 });
  }

  const newImage = {
    id: Date.now(),
    url,
    source,
    isInCarousel: false,
    duration: 5, // Durata predefinita di 5 secondi
  };

  homeImages.push(newImage);

  return NextResponse.json(newImage, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID immagine non fornito' }, { status: 400 });
  }

  const imageId = parseInt(id, 10);
  const initialLength = homeImages.length;
  homeImages = homeImages.filter((image) => image.id !== imageId);

  if (homeImages.length === initialLength) {
    return NextResponse.json({ error: 'Immagine non trovata' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

export async function PUT(request: Request) {
  const { id, isInCarousel, duration } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'ID immagine non fornito' }, { status: 400 });
  }

  const imageIndex = homeImages.findIndex((image) => image.id === id);

  if (imageIndex === -1) {
    return NextResponse.json({ error: 'Immagine non trovata' }, { status: 404 });
  }

  // Aggiorna solo i campi forniti
  if (typeof isInCarousel === 'boolean') {
    homeImages[imageIndex].isInCarousel = isInCarousel;
  }
  if (typeof duration === 'number') {
    homeImages[imageIndex].duration = duration;
  }

  return NextResponse.json(homeImages[imageIndex]);
}