import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate beach conditions data
    // In a real app, this would fetch from a weather API
    const beachConditions = {
      lungomareSud: {
        name: "Lungomare Sud",
        temperature: 28,
        windSpeed: 12,
        waveHeight: "0.5-1m",
        uvIndex: 7,
        condition: "Soleggiato",
        visibility: "Ottima",
        lastUpdated: new Date().toISOString()
      },
      lungomareNord: {
        name: "Lungomare Nord", 
        temperature: 27,
        windSpeed: 8,
        waveHeight: "0.3-0.8m",
        uvIndex: 6,
        condition: "Soleggiato",
        visibility: "Eccellente",
        lastUpdated: new Date().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: beachConditions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching beach conditions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch beach conditions' },
      { status: 500 }
    );
  }
}