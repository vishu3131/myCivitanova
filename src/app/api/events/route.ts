import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format YYYY-MM-DD
  location: string;
  imageUrl?: string;
  category: string;
  status: 'draft' | 'published' | 'cancelled';
  isFeatured: boolean;
  organizer: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  maxAttendees?: number;
  price?: number;
}

let events: Event[] = [
  // Settembre 2025
  {
    id: uuidv4(),
    title: 'Bim Bum Bam Festival - Giorno 1',
    description: 'Weekend per bambini e famiglie con spettacoli, laboratori creativi e animazione.',
    date: '2025-09-06',
    location: 'Varie location in città'
  },
  {
    id: uuidv4(),
    title: 'Bim Bum Bam Festival - Giorno 2',
    description: 'Seconda giornata del festival con attività e spettacoli per i più piccoli.',
    date: '2025-09-07',
    location: 'Varie location in città'
  },
  {
    id: uuidv4(),
    title: 'Civitanova Vintage Market - Giorno 1',
    description: 'Mercato dedicato al vintage, collezionismo e modernariato.',
    date: '2025-09-06',
    location: 'Lungomare Piermanni'
  },
  {
    id: uuidv4(),
    title: 'Civitanova Vintage Market - Giorno 2',
    description: 'Seconda giornata del mercato con stand di abbigliamento, accessori e oggettistica d’epoca.',
    date: '2025-09-07',
    location: 'Lungomare Piermanni'
  },
  {
    id: uuidv4(),
    title: 'Civitate Nova - Rievocazione Storica',
    description: 'Cortei in costume, figuranti, spettacoli e antichi mestieri per riscoprire storia e tradizioni.',
    date: '2025-09-06',
    location: 'Centro cittadino e Civitanova Alta'
  },
  {
    id: uuidv4(),
    title: 'Sport Live - Festival dello Sport Marchigiano',
    description: 'Giornata dedicata alla promozione dello sport con dimostrazioni ed esibizioni.',
    date: '2025-09-14',
    location: 'Varie location in città'
  },
  {
    id: uuidv4(),
    title: 'Dramma Teatrale "Carbonari!"',
    description: 'Dramma di Stefano Cosimi con Quintetto Gigli e il M° Alfredo Sorichetti al pianoforte (ore 21:00).',
    date: '2025-09-20',
    location: 'Teatro Annibal Caro, Civitanova Alta'
  },
  {
    id: uuidv4(),
    title: 'Civitanova Piano Festival - Giorno 1',
    description: 'Rassegna di musica classica con concerti pianistici. Programma sui canali dei Teatri di Civitanova.',
    date: '2025-09-24',
    location: 'Teatri di Civitanova'
  },
  {
    id: uuidv4(),
    title: 'Civitanova Piano Festival - Giorno 2',
    description: 'Seconda serata della rassegna pianistico-classica.',
    date: '2025-09-25',
    location: 'Teatri di Civitanova'
  },

  // Ottobre 2025
  {
    id: uuidv4(),
    title: 'NID Platform – FORMA MENTIS / WOLF SPIDER',
    description: 'La Nuova Piattaforma della Danza Italiana: Jacopo Godani – FORMA MENTIS / KOR’SIA – WOLF SPIDER.',
    date: '2025-10-01',
    location: 'Teatro Rossini'
  },
  {
    id: uuidv4(),
    title: 'NID Platform – SUSPENDED CHORUS',
    description: 'NID Platform: Silvia Gribaudi – Suspended Chorus.',
    date: '2025-10-02',
    location: 'Teatro Rossini'
  },
  {
    id: uuidv4(),
    title: 'NID Platform – RAVE.L',
    description: 'NID Platform: Virginia Spallarossa – RAVE.L.',
    date: '2025-10-03',
    location: 'Teatro Rossini'
  },
  {
    id: uuidv4(),
    title: 'NID Platform – SISTA / LA DUSE. Nessuna Opera',
    description: 'NID Platform: Simona Bertozzi – SISTA / Adriano Bolognino – LA DUSE. Nessuna Opera.',
    date: '2025-10-04',
    location: 'Teatro Rossini'
  },
  {
    id: uuidv4(),
    title: "Fiera d'Autunno e Mercatini",
    description: 'Mercatino autunnale con sapori e colori di stagione.',
    date: '2025-10-19',
    location: 'Piazza XX Settembre'
  },

  // Novembre 2025
  {
    id: uuidv4(),
    title: 'Sapore di Mare – Il Musical',
    description: 'Inaugurazione stagione teatrale 2025/26. Musical dal film cult dei Vanzina, regia di Maurizio Colombi.',
    date: '2025-11-11',
    location: 'Teatro Rossini'
  },

  // Evento ricorrente (esempi)
  {
    id: uuidv4(),
    title: "I Martedì dell'Arte – Apertura rassegna",
    description: "Conferenze di storia dell'arte, archeologia e cultura. Ingresso gratuito.",
    date: '2025-09-10',
    location: 'Cine-Teatro Enrico Cecchetti'
  },
  {
    id: uuidv4(),
    title: "I Martedì dell'Arte – Ciclo autunnale",
    description: 'Approfondimenti su Piero della Francesca, desiderio e archeologia di Ancona e Numana.',
    date: '2025-10-14',
    location: 'Cine-Teatro Enrico Cecchetti'
  },
  {
    id: uuidv4(),
    title: "I Martedì dell'Arte – Ciclo invernale",
    description: 'Focus su Monte Rinaldo, Barocco ascolano e arte salvata dal terremoto.',
    date: '2025-11-18',
    location: 'Cine-Teatro Enrico Cecchetti'
  }
];

// GET ALL
export async function GET() {
  try {
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal server error', 
        error: 'Failed to fetch events' 
      }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST
export async function POST(request: Request) {
  try {
    const { 
      title, 
      description, 
      date, 
      location, 
      imageUrl, 
      category, 
      status, 
      isFeatured, 
      organizer, 
      endDate, 
      startTime, 
      endTime, 
      maxAttendees, 
      price 
    } = await request.json();

    // Validazione dei campi obbligatori
    if (!title || !description || !date || !location || !category || !organizer) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Validation error', 
          error: 'All fields are required' 
        }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validazione formato data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Validation error', 
          error: 'Date must be in YYYY-MM-DD format' 
        }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const newEvent: Event = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      date,
      location: location.trim(),
      imageUrl: imageUrl?.trim(),
      category: category.trim(),
      status: status || 'draft',
      isFeatured: Boolean(isFeatured),
      organizer: organizer.trim(),
      endDate: endDate?.trim(),
      startTime: startTime?.trim(),
      endTime: endTime?.trim(),
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
      price: price ? parseFloat(price) : undefined
    };

    events.push(newEvent);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal server error', 
        error: 'Failed to create event' 
      }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PUT
export async function PUT(request: Request) {
  try {
    const { 
      id, 
      title, 
      description, 
      date, 
      location, 
      imageUrl, 
      category, 
      status, 
      isFeatured, 
      organizer, 
      endDate, 
      startTime, 
      endTime, 
      maxAttendees, 
      price 
    } = await request.json();

    // Validazione dei campi obbligatori
    if (!id || !title || !description || !date || !location || !category || !organizer) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Validation error', 
          error: 'All fields including ID are required' 
        }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validazione formato data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Validation error', 
          error: 'Date must be in YYYY-MM-DD format' 
        }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const eventIndex = events.findIndex(event => event.id === id);

    if (eventIndex === -1) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Not found', 
          error: 'Event not found' 
        }), 
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    events[eventIndex] = { 
      id, 
      title: title.trim(), 
      description: description.trim(), 
      date, 
      location: location.trim(),
      imageUrl: imageUrl?.trim(),
      category: category.trim(),
      status: status || 'draft',
      isFeatured: Boolean(isFeatured),
      organizer: organizer.trim(),
      endDate: endDate?.trim(),
      startTime: startTime?.trim(),
      endTime: endTime?.trim(),
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
      price: price ? parseFloat(price) : undefined
    };
    
    return NextResponse.json({ 
      message: 'Event updated successfully',
      event: events[eventIndex] 
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating event:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal server error', 
        error: 'Failed to update event' 
      }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Validation error', 
          error: 'Event ID is required' 
        }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const eventIndex = events.findIndex(event => event.id === id);

    if (eventIndex === -1) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Not found', 
          error: 'Event not found' 
        }), 
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    events = events.filter(event => event.id !== id);
    return NextResponse.json({ 
      message: 'Event deleted successfully',
      deletedId: id 
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal server error', 
        error: 'Failed to delete event' 
      }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
