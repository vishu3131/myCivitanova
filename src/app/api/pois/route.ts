import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// NOTE: This route now supports precise geocoding of demo POIs by address.
// For demo mode, we resolve addresses to exact lat/lng via OpenStreetMap Nominatim
// so pins are placed precisely on the correct street/building.

// Lightweight in-memory cache to avoid repeated geocoding during runtime
const geocodeCache = new Map<string, { lat: number; lon: number }>();

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  if (!address) return null;
  const key = address.trim().toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;

  try {
    // Prefer narrowing to city and country to improve accuracy
    const q = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${q}`;
    const res = await fetch(url, {
      headers: {
        // Identify the application to comply with Nominatim usage policy
        'User-Agent': 'myCivitanova/1.0 (+https://example.com)'
      },
      // Cache for a short while at the edge/runtime to reduce calls if supported
      next: { revalidate: 60 * 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const item = Array.isArray(data) && data[0];
    if (!item?.lat || !item?.lon) return null;

    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    const result = { lat, lon };
    geocodeCache.set(key, result);
    return result;
  } catch (_) {
    return null;
  }
}

// Shape used internally for demo POIs (address-first, coordinates resolved at runtime)
interface DemoPoi {
  id: string;
  name: string;
  category: string;
  description?: string;
  address: string;
  imageUrl?: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
}

// Core demo list: addresses are precise, coordinates will be resolved accurately
const DEMO_POIS: DemoPoi[] = [
  {
    id: 'poi-001',
    name: 'Piazza XX Settembre',
    category: 'Piazza',
    description: 'Cuore pulsante della città, eventi e mercatini all’ombra del Palazzo Sforza.',
    address: 'Piazza XX Settembre, 62012 Civitanova Marche MC, Italy',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80'
  },
  {
    id: 'poi-002',
    name: 'Lungomare Sud',
    category: 'Spiaggia',
    description: 'Lunga passeggiata sul mare con chalet storici, piste ciclabili e tramonti spettacolari.',
    address: 'Lungomare Sud, 62012 Civitanova Marche MC, Italy',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'
  },
  {
    id: 'poi-003',
    name: 'Teatro Annibal Caro',
    category: 'Cultura',
    description: 'Storico teatro “all’italiana” a Civitanova Alta con rassegne e spettacoli.',
    address: 'Corso Annibal Caro 2, 62012 Civitanova Marche Alta MC, Italy',
    phone: '+39 0733 892101',
    website: 'https://tdic.it/teatro-annibal-caro/',
    imageUrl: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&q=80'
  },
  {
    id: 'poi-004',
    name: 'Porto Turistico',
    category: 'Interesse',
    description: 'Area portuale con banchine, ristoranti e vista sul molo e sui pescherecci.',
    address: 'Porto di Civitanova Marche, 62012 Civitanova Marche MC, Italy',
    imageUrl: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80'
  },
  {
    id: 'poi-005',
    name: 'Stazione FS Civitanova Marche–Montegranaro',
    category: 'Trasporti',
    description: 'Snodo ferroviario della città, collegamenti regionali e nazionali.',
    address: 'Stazione Civitanova Marche–Montegranaro, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-006',
    name: 'Palazzo Sforza (Municipio)',
    category: 'Servizi',
    description: 'Sede del Comune di Civitanova Marche, affaccia su Piazza XX Settembre.',
    address: 'Piazza XX Settembre 93, 62012 Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-007',
    name: 'Chiesa di Cristo Re',
    category: 'Cultura',
    description: 'Chiesa moderna con alto campanile-faro, simbolo del città.',
    address: 'Viale G. Matteotti 42, 62012 Civitanova Marche MC, Italy',
    phone: '+39 0733 812842',
    website: 'https://www.sanpietro-cristore.it/'
  },
  {
    id: 'poi-008',
    name: 'Lido Cluana',
    category: 'Interesse',
    description: 'Eleganti edifici liberty affacciati sul mare, luogo ideale per passeggiate.',
    address: 'Lido Cluana, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-009',
    name: 'Santuario di San Marone',
    category: 'Cultura',
    description: 'Antico santuario cittadino dedicato al patrono, con preziose opere d’arte.',
    address: 'Santuario di San Marone, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-010',
    name: 'Lungomare Nord',
    category: 'Spiaggia',
    description: 'Passeggiata a mare lato nord con stabilimenti e spiagge attrezzate.',
    address: 'Lungomare Nord, 62012 Civitanova Marche MC, Italy'
  },
  // Aggiunte per arrivare ad almeno 20 POI
  {
    id: 'poi-011',
    name: 'Biblioteca Comunale Silvio Zavatti',
    category: 'Cultura',
    description: 'Biblioteca civica con sale studio ed eventi culturali per la comunità.',
    address: 'Viale Vittorio Veneto 124, 62012 Civitanova Marche MC, Italy',
    phone: '+39 0733 813837',
    website: 'https://bibliotecazavatti.com'
  },
  {
    id: 'poi-012',
    name: 'Teatro Enrico Cecchetti',
    category: 'Cultura',
    description: 'Teatro e spazio culturale intitolato al celebre maestro di danza.',
    address: 'Teatro Enrico Cecchetti, Viale Vittorio Veneto, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-013',
    name: 'Centro Commerciale Cuore Adriatico',
    category: 'Servizi',
    description: 'Grande centro commerciale con negozi, ristorazione e parcheggi.',
    address: 'Via San Costantino 98, 62012 Civitanova Marche MC, Italy',
    phone: '+39 0733 771387',
    website: 'https://cuoreadriatico.it/'
  },
  {
    id: 'poi-014',
    name: 'Stadio Comunale Polisportivo',
    category: 'Interesse',
    description: 'Impianto sportivo cittadino per calcio ed eventi sportivi.',
    address: 'Stadio Comunale Polisportivo, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-015',
    name: 'Palasport Risorgimento',
    category: 'Interesse',
    description: 'Palazzetto dello sport per pallavolo, basket e manifestazioni.',
    address: 'Palasport Risorgimento, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-016',
    name: 'Terminal Bus Civitanova',
    category: 'Trasporti',
    description: 'Terminal autobus cittadino per collegamenti urbani ed extraurbani.',
    address: 'Terminal Bus, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-017',
    name: 'Mercato Ittico',
    category: 'Servizi',
    description: 'Mercato del pesce legato alla tradizione marinara locale.',
    address: 'Mercato Ittico Civitanova Marche, Italy'
  },
  {
    id: 'poi-018',
    name: 'Corso Umberto I',
    category: 'Interesse',
    description: 'Via dello shopping con negozi, locali e vita cittadina.',
    address: 'Corso Umberto I, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-019',
    name: 'Belvedere Civitanova Alta',
    category: 'Interesse',
    description: 'Punto panoramico sulla città e sulla costa adriatica.',
    address: 'Belvedere, Civitanova Alta, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-020',
    name: 'Piazza della Libertà (Civitanova Alta)',
    category: 'Piazza',
    description: 'Piazza centrale del borgo alto, circondata da palazzi storici.',
    address: 'Piazza della Libertà, Civitanova Alta, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-021',
    name: 'Villa Conti',
    category: 'Interesse',
    description: 'Storica villa con parco, testimonianza di architettura liberty.',
    address: 'Villa Conti, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-022',
    name: 'Villa Eugenia',
    category: 'Cultura',
    description: 'Residenza storica legata alla famiglia imperiale di Napoleone III.',
    address: 'Villa Eugenia, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-023',
    name: 'Palazzo della Delegazione',
    category: 'Cultura',
    description: 'Edificio ottocentesco con loggia e ambienti storici a Civitanova Alta.',
    address: 'Palazzo della Delegazione, Civitanova Alta, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-024',
    name: 'Collegiata San Paolo Apostolo',
    category: 'Cultura',
    description: 'Chiesa storica con opere d’arte e antiche testimonianze.',
    address: 'San Paolo Apostolo, Civitanova Alta, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-025',
    name: 'Chiesa di Sant’Agostino',
    category: 'Cultura',
    description: 'Antica chiesa rimaneggiata nel Settecento, con cupola e cappelle.',
    address: 'Chiesa di Sant’Agostino, Civitanova Alta, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-026',
    name: 'Chiesa di San Francesco',
    category: 'Cultura',
    description: 'Edificio medievale con portale gotico, oggi spazio per eventi culturali.',
    address: 'Chiesa di San Francesco, Civitanova Alta, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-027',
    name: 'Mura del XV secolo',
    category: 'Interesse',
    description: 'Cinta muraria rinascimentale voluta dagli Sforza, perfettamente conservata.',
    address: 'Mura di Civitanova Alta, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-028',
    name: 'Molo Sud (Faro)',
    category: 'Interesse',
    description: 'Passeggiata sul molo con vista sul faro e sul porto.',
    address: 'Molo Sud, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-029',
    name: 'Parco Cecchetti',
    category: 'Interesse',
    description: 'Area verde per famiglie e sport, vicino al centro città.',
    address: 'Parco Cecchetti, Civitanova Marche MC, Italy'
  },
  {
    id: 'poi-030',
    name: 'Varco sul Mare',
    category: 'Interesse',
    description: 'Spazio eventi e accesso al mare, simbolo della città contemporanea.',
    address: 'Varco sul Mare, Civitanova Marche MC, Italy'
  },
  // Added to synchronize with TouristSpotWidget and explore section
  {
    id: 'poi-031',
    name: 'Parco della Resistenza',
    category: 'Interesse',
    description: 'Oasi verde nel cuore di Civitanova, ideale per relax e attività leggere.',
    address: 'Parco della Resistenza, 62012 Civitanova Marche MC, Italy',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop'
  },
  {
    id: 'poi-032',
    name: 'Lungomare Piermanni',
    category: 'Spiaggia',
    description: 'Passeggiata panoramica con vista sul mare Adriatico.',
    address: 'Lungomare Piermanni, 62012 Civitanova Marche MC, Italy',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Panorama_di_Civitanova_Marche.jpg'
  },
  {
    id: 'poi-033',
    name: 'MAGMA - Museo Archivio della Grafica e del Manifesto',
    category: 'Cultura',
    description: 'Museo dedicato alla grafica e al manifesto, con collezioni uniche.',
    address: 'Piazza Garibaldi 533, 62012 Civitanova Marche MC, Italy',
    phone: '+39 0733 1860015',
    website: 'http://www.museomagma.com',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop'
  },
  {
    id: 'poi-034',
    name: 'Chiesa di Santa Maria Apparente',
    category: 'Cultura',
    description: 'Santuario storico immerso nel verde, luogo di pace e tradizioni.',
    address: 'Via del Torrione 127, 62012 Civitanova Marche MC, Italy',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Civitanova_Marche_-_Torrione_di_Santa_Maria_Apparente_-_2023-09-27_16-19-07_001.jpg'
  },
  {
    id: 'poi-035',
    name: 'Vecchia Pescheria',
    category: 'Interesse',
    description: 'Edificio storico del porto, oggi sede di ristoranti e tradizione marinara.',
    address: 'Vecchia Pescheria, Porto di Civitanova Marche, 62012 Civitanova Marche MC, Italy',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Esterno_antica_pescheria.jpg'
  },
  {
    id: 'poi-036',
    name: 'Pista Ciclabile Civitanova Marche',
    category: 'Interesse',
    description: 'Percorso ciclabile continuo che collega il Lungomare Sud e Nord.',
    address: 'Lungomare Sud, 62012 Civitanova Marche MC, Italy',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzzBGaDWwGJhsD5aFWRVJI6aEboVC9rbJIOg&s'
  },
];

async function resolveDemoPois(pois: DemoPoi[]) {
  // Try to resolve precise coordinates by address. If latitude/longitude are provided, use them.
  const results = await Promise.all(
    pois.map(async (poi) => {
      let lat = poi.latitude;
      let lon = poi.longitude;

      if ((lat === undefined || lon === undefined) && poi.address) {
        const geo = await geocodeAddress(poi.address);
        if (geo) {
          lat = geo.lat;
          lon = geo.lon;
        }
      }

      // Fallback: if still missing, skip this POI from demo set
      if (lat === undefined || lon === undefined) return null;

      return {
        ...poi,
        latitude: lat,
        longitude: lon,
        position: [lat, lon] as [number, number],
      };
    })
  );

  return results.filter(Boolean);
}

// GET all POIs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceDemo = searchParams.get('demo') === '1' || searchParams.get('mode') === 'demo';
  const forceLive = searchParams.get('live') === '1' || searchParams.get('mode') === 'live';

  // If demo is explicitly requested, return geocoded demo POIs
  if (forceDemo) {
    const geocoded = await resolveDemoPois(DEMO_POIS);
    return NextResponse.json(geocoded);
  }

  try {
    const pois = await DatabaseService.getPois();
    const formattedPois = pois.map(poi => ({
      ...poi,
      position: [poi.latitude, poi.longitude] as [number, number]
    }));
    return NextResponse.json(formattedPois);
  } catch (error) {
    if (forceLive) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return NextResponse.json({ error: 'Failed to fetch POIs', details: errorMessage }, { status: 500 });
    }
    // Fallback to geocoded demo if live fetch fails
    const geocoded = await resolveDemoPois(DEMO_POIS);
    return NextResponse.json(geocoded);
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
      (updates as any).latitude = position[0];
      (updates as any).longitude = position[1];
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
