import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import type { Event as DBEvent } from '@/lib/database';

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
  organizer: string; // Nome organizzatore per la UI
  endDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  maxAttendees?: number;
  price?: number;
}

// Helpers per mapping tra DB e API
function toDatePart(iso?: string): string | undefined {
  if (!iso) return undefined;
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return undefined;
  }
}

function toTimePart(iso?: string): string | undefined {
  if (!iso) return undefined;
  try {
    const d = new Date(iso).toISOString();
    return d.slice(11, 16); // HH:mm
  } catch {
    return undefined;
  }
}

function composeISO(date: string, time?: string): string {
  const t = (time && /^\d{2}:\d{2}$/.test(time)) ? `${time}:00` : '00:00:00';
  // Interpreta come UTC semplice
  return new Date(`${date}T${t}Z`).toISOString();
}

// Mappa status DB -> API (UI storica: published/cancelled; manteniamo compatibilità)
function mapDbStatusToApiStatus(dbStatus?: DBEvent['status']): Event['status'] {
  if (dbStatus === 'cancelled') return 'cancelled';
  // Tutti gli altri stati li rappresentiamo come "published" per compatibilità con la UI esistente
  return 'published';
}

// Mappa status API -> DB (approssimazione: published/draft => upcoming)
function mapApiStatusToDbStatus(apiStatus?: Event['status']): DBEvent['status'] {
  if (apiStatus === 'cancelled') return 'cancelled';
  return 'upcoming';
}

function dbEventToApi(e: DBEvent): Event {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    date: toDatePart(e.start_date) || new Date().toISOString().slice(0, 10),
    endDate: toDatePart(e.end_date),
    startTime: toTimePart(e.start_date),
    endTime: toTimePart(e.end_date),
    location: e.location,
    imageUrl: e.featured_image,
    category: e.category,
    status: mapDbStatusToApiStatus(e.status),
    isFeatured: e.is_featured,
    organizer: e.organizer?.full_name || '',
    maxAttendees: e.max_participants,
    price: e.price,
  };
}

function apiPayloadToDb(body: Partial<Event>): Partial<DBEvent> {
  const start_date = body.date ? composeISO(body.date, body.startTime) : undefined;
  const end_date = body.endDate ? composeISO(body.endDate, body.endTime) : undefined;

  return {
    title: body.title?.trim(),
    description: body.description?.trim() || '',
    featured_image: body.imageUrl?.trim(),
    category: body.category as DBEvent['category'],
    location: body.location?.trim() || '',
    start_date,
    end_date,
    is_all_day: !body.startTime && !body.endTime,
    max_participants: body.maxAttendees,
    price: body.price ?? 0,
    is_free: body.price === 0 || body.price === undefined,
    status: mapApiStatusToDbStatus(body.status),
    // organizer_id: omesso perché la UI fornisce solo un nome
    is_featured: Boolean(body.isFeatured),
  };
}

// GET con supporto filtri: /api/events?category=...&status=...&featured=true&upcoming=true&limit=10&offset=0
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const featuredParam = searchParams.get('featured');
    const upcomingParam = searchParams.get('upcoming');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    const featured = featuredParam !== null ? featuredParam === 'true' : undefined;
    const upcoming = upcomingParam !== null ? upcomingParam === 'true' : undefined;
    const limit = limitParam ? parseInt(limitParam) : undefined;
    const offset = offsetParam ? parseInt(offsetParam) : undefined;

    const dbEvents = await DatabaseService.getEvents({
      category: category || undefined,
      status: status || undefined, // accetta direttamente lo stato del DB se passato
      featured,
      upcoming,
      limit,
      offset,
    });

    const apiEvents = dbEvents.map(dbEventToApi);
    return NextResponse.json(apiEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal server error', 
        error: 'Failed to fetch events' 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST -> crea evento su Supabase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, date, location, category } = body as Partial<Event>;

    // Validazione minima compatibile con la UI
    if (!title || !description || !date || !location || !category) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Validation error', 
          error: 'title, description, date, location e category sono obbligatori' 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validazione formato data base
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Validation error', 
          error: 'Date deve essere in formato YYYY-MM-DD' 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload = apiPayloadToDb(body);
    const created = await DatabaseService.createEvent(payload);
    return NextResponse.json(dbEventToApi(created), { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal server error', 
        error: 'Failed to create event' 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PUT -> aggiorna evento su Supabase
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body as Partial<Event>;

    if (!id) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Validation error', 
          error: 'Event ID is required' 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updates = apiPayloadToDb(body);
    const updated = await DatabaseService.updateEvent(id, updates);

    return NextResponse.json({ 
      message: 'Event updated successfully',
      event: dbEventToApi(updated)
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating event:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal server error', 
        error: 'Failed to update event' 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE -> elimina evento su Supabase
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Validation error', 
          error: 'Event ID is required' 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await DatabaseService.deleteEvent(id);
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
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
