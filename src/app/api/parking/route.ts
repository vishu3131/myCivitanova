import { NextRequest, NextResponse } from 'next/server';

// Civitanova Marche approx bounding box: [south, west, north, east]
const BBOX: [number, number, number, number] = [43.26, 13.66, 43.35, 13.78];

function buildOverpassQuery(fee: 'all' | 'free' | 'paid') {
  const bbox = `${BBOX[0]},${BBOX[1]},${BBOX[2]},${BBOX[3]}`;
  const feeFilter = fee === 'free' ? "['fee'='no']" : fee === 'paid' ? "['fee'='yes']" : '';
  // We request nodes/ways/relations with out center to get a coordinate for non-node elements
  return `
    [out:json][timeout:25];
    (
      node['amenity'='parking']${feeFilter}(${bbox});
      way['amenity'='parking']${feeFilter}(${bbox});
      relation['amenity'='parking']${feeFilter}(${bbox});
    );
    out center tags;
  `;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const feeParam = (searchParams.get('fee') || 'all').toLowerCase();
    const fee: 'all' | 'free' | 'paid' = feeParam === 'free' ? 'free' : feeParam === 'paid' ? 'paid' : 'all';

    const query = buildOverpassQuery(fee);

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
      body: query,
      // Overpass sometimes throttles; we can add a small timeout via AbortController if needed
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json({ error: 'Overpass error', status: res.status, details: text }, { status: 502 });
    }

    const data = await res.json();
    const elements = Array.isArray(data?.elements) ? data.elements : [];

    const items = elements
      .map((el: any) => {
        const type = el.type as 'node' | 'way' | 'relation';
        const id = `${type}/${el.id}`;
        const tags = el.tags || {};
        const name = tags.name || 'Parcheggio';
        const lat = type === 'node' ? el.lat : el.center?.lat;
        const lon = type === 'node' ? el.lon : el.center?.lon;
        if (typeof lat !== 'number' || typeof lon !== 'number') return null;
        const feeTag = typeof tags.fee === 'string' ? tags.fee.toLowerCase() : undefined;
        const fee_bool = feeTag === 'yes' ? true : feeTag === 'no' ? false : null;
        const capacity = tags.capacity ? Number(tags.capacity) : null;
        const operator = tags.operator || null;

        return {
          id,
          type,
          name,
          lat,
          lon,
          fee: feeTag || 'unknown',
          fee_bool,
          capacity,
          operator,
          tags,
        };
      })
      .filter(Boolean);

    return new NextResponse(JSON.stringify(items), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // Cache at the edge (vercel) for 1h and allow SWR for 10m
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Unexpected server error', message: err?.message || String(err) }, { status: 500 });
  }
}
