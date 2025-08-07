import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

let events: Event[] = [
  {
    id: uuidv4(),
    title: 'Evento di esempio 1',
    description: 'Descrizione evento di esempio 1',
    date: '2025-08-10',
    location: 'Civitanova Marche'
  },
  {
    id: uuidv4(),
    title: 'Evento di esempio 2',
    description: 'Descrizione evento di esempio 2',
    date: '2025-08-15',
    location: 'Porto Recanati'
  }
];

// GET ALL
export async function GET() {
  return NextResponse.json(events);
}

// POST
export async function POST(request: Request) {
  const { title, description, date, location } = await request.json();

  const newEvent: Event = {
    id: uuidv4(),
    title,
    description,
    date,
    location
  };

  events.push(newEvent);
  return NextResponse.json(newEvent, { status: 201 });
}

// PUT
export async function PUT(request: Request) {
  const { id, title, description, date, location } = await request.json();

  const eventIndex = events.findIndex(event => event.id === id);

  if (eventIndex === -1) {
    return new NextResponse(JSON.stringify({ message: "Event not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  events[eventIndex] = { id, title, description, date, location };
  return NextResponse.json({ message: "Event updated successfully" }, { status: 200 });
}


// DELETE
export async function DELETE(request: Request) {
  const { id } = await request.json();

  const eventIndex = events.findIndex(event => event.id === id);

  if (eventIndex === -1) {
    return new NextResponse(JSON.stringify({ message: "Event not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  events = events.filter(event => event.id !== id);
  return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });
}