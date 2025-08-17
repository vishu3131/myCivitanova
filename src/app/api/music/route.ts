import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const musicDirectory = path.join(process.cwd(), 'public', 'music');

  try {
    const filenames = fs.readdirSync(musicDirectory);
    const tracks = filenames
      .filter(file => /\.(mp3|wav|ogg)$/i.test(file))
      .map(file => `/music/${file}`);
    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error reading music directory:', error);
    return NextResponse.json([], { status: 500 });
  }
}
