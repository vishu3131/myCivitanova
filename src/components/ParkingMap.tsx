"use client";

import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css'; // Ensure CSS is loaded
import { MapPin } from "lucide-react";
import Switch from "@/components/Switch";

// Import Leaflet and react-leaflet components only on client side, senza usare dynamic()
async function loadLeaflet() {
  const LMod = await import('leaflet');
  const L: any = (LMod as any).default ?? LMod;
  const rl = await import('react-leaflet');
  const { MapContainer, TileLayer, Marker, Polygon, Polyline, Tooltip, GeoJSON } = rl as any;

  // Parking marker icons
  const markerShadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';
  const paidIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  const freeIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  const unknownIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  function getParkingIcon(item: any): any {
    if (item?.fee_bool === true) return paidIcon; // a pagamento → blu acceso
    if (item?.fee_bool === false) return freeIcon; // gratuito → verde
    return unknownIcon; // sconosciuto → grigio
  }

  return { MapContainer, TileLayer, Marker, Polygon, Polyline, Tooltip, GeoJSON, getParkingIcon, L };
}

// Parking areas (approximate polygons/polylines) for clarity over clusters
const PARKING_AREAS: Array<
  | { id: string; name: string; type: 'free' | 'paid'; shape: 'polygon'; coords: [number, number][] }
  | { id: string; name: string; type: 'free' | 'paid'; shape: 'polyline'; coords: [number, number][] }
> = [
  // Zona Stadio (gratuita) - area ampia attorno allo stadio
  {
    id: 'stadio-area',
    name: 'Area Parcheggio Stadio',
    type: 'free',
    shape: 'polygon',
    coords: [
      [43.3095, 13.7145],
      [43.3095, 13.7172],
      [43.3078, 13.7172],
      [43.3078, 13.7145],
    ],
  },
  // Biblioteca Zavatti (gratuita) - piccola area a lato
  {
    id: 'zavatti-area',
    name: 'Area Parcheggio Biblioteca Zavatti',
    type: 'free',
    shape: 'polygon',
    coords: [
      [43.3079, 13.7247],
      [43.3079, 13.7252],
      [43.3076, 13.7252],
      [43.3076, 13.7247],
    ],
  },
  // Piazza XX Settembre (pagamento) - area frontale al Comune
  {
    id: 'piazza-xx-settembre',
    name: 'Piazza XX Settembre (A Pagamento)',
    type: 'paid',
    shape: 'polygon',
    coords: [
      [43.3076, 13.7224],
      [43.3076, 13.7234],
      [43.3069, 13.7234],
      [43.3069, 13.7224],
    ],
  },
  // Corso Umberto I (pagamento) - corridoio lungo il corso (polilinea spessa)
  {
    id: 'corso-umberto',
    name: 'Corso Umberto I (A Pagamento)',
    type: 'paid',
    shape: 'polyline',
    coords: [
      [43.3074, 13.7237],
      [43.3078, 13.7225],
      [43.3082, 13.7215],
      [43.3086, 13.7205],
      [43.3090, 13.7196],
    ],
  },
];

function getAreaStyle(type: 'free' | 'paid') {
  return type === 'paid'
    ? { color: '#3b82f6', weight: 3, fillColor: '#3b82f6', fillOpacity: 0.2 }
    : { color: '#22c55e', weight: 3, fillColor: '#22c55e', fillOpacity: 0.2 };
}

function AreasOverlay({ areas, getAreaStyle, L, MapContainer, TileLayer, Marker, Polygon, Polyline, Tooltip, GeoJSON }: any) {
  if (!L || !MapContainer) return null; // Ensure Leaflet is loaded

  return (
    <>
      {areas.map((area) => {
        const style = getAreaStyle(area.type);
        if (area.shape === 'polygon') {
          return (
            <Polygon key={area.id} positions={area.coords as any} pathOptions={style}>
              <Tooltip permanent direction="center" className="!bg-transparent !border-none !text-white text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {area.name}
              </Tooltip>
            </Polygon>
          );
        }
        // polyline spesso come corridoio lungo il corso
        return (
          <Polyline key={area.id} positions={area.coords as any} pathOptions={{ ...style, weight: 12, opacity: 0.6 }}>
            <Tooltip permanent sticky className="!bg-transparent !border-none !text-white text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {area.name}
            </Tooltip>
          </Polyline>
        );
      })}
    </>
  );
}

type ParkingMapProps = {
  activeTab?: 'all' | 'free' | 'paid';
  onToggleAlt?: () => void;
  isAlt?: boolean;
  center?: [number, number];
  zoom?: number;
  style?: React.CSSProperties;
  zoomControl?: boolean;
  filteredFC?: any;
  filteredFeatures?: any[];
  parkingAreas?: typeof PARKING_AREAS;
  getAreaStyle?: (type: 'free' | 'paid') => any;
};

export default function ParkingMap(props: ParkingMapProps) {
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leafletComponents, setLeafletComponents] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    loadLeaflet()
      .then((comps) => { if (mounted) setLeafletComponents(comps); })
      .catch((err) => { console.error('Leaflet load failed', err); });
    return () => { mounted = false; };
  }, []);

  
  const activeTab = props.activeTab ?? 'all';
  const isAlt = props.isAlt ?? false;
  const onToggleAlt = props.onToggleAlt ?? (() => {});
  const mapCenter: [number, number] = props.center ?? [43.307, 13.73];
  const mapZoom: number = props.zoom ?? 14;
  const mapStyle: React.CSSProperties = props.style ?? { height: '100%', width: '100%' };
  const mapZoomControl: boolean = props.zoomControl ?? false;
  const areas = props.parkingAreas ?? PARKING_AREAS;
  const areaStyleFn = props.getAreaStyle ?? getAreaStyle;
  const filteredFC = props.filteredFC;

  if (!leafletComponents) {
    return (
      <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Mappa Parcheggi <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Modalità: Standard</span></div>
              <div className="text-white/60 text-xs">Fonte: OSM/Overpass • {activeTab === 'all' ? 'Tutti' : activeTab === 'free' ? 'Gratuiti' : 'A pagamento'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-xs hidden sm:inline">Open Data</span>
            <Switch isOn={isAlt} onToggle={onToggleAlt} />
            {loading && <span className="text-[10px] text-white/50">Caricamento…</span>}
          </div>
        </div>
        <div className="h-64 w-full flex items-center justify-center text-white/50">Caricamento mappa...</div>
        {error && (
          <div className="p-3 text-xs text-red-300">{error}</div>
        )}
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Polygon, Polyline, Tooltip, GeoJSON, getParkingIcon, L } = leafletComponents;

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Mappa Parcheggi <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Modalità: Standard</span></div>
            <div className="text-white/60 text-xs">Fonte: OSM/Overpass • {activeTab === 'all' ? 'Tutti' : activeTab === 'free' ? 'Gratuiti' : 'A pagamento'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-xs hidden sm:inline">Open Data</span>
          <Switch isOn={isAlt} onToggle={onToggleAlt} />
          {loading && <span className="text-[10px] text-white/50">Caricamento…</span>}
        </div>
      </div>
      <div className="h-64 w-full">
        <MapContainer center={mapCenter} zoom={mapZoom} style={mapStyle} zoomControl={mapZoomControl}>
          <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' attribution='&copy; OpenStreetMap contributors' />
          {/* Evidenzia Aree Parcheggio */}
          <AreasOverlay areas={areas} getAreaStyle={areaStyleFn} L={L} MapContainer={MapContainer} TileLayer={TileLayer} Marker={Marker} Polygon={Polygon} Polyline={Polyline} Tooltip={Tooltip} GeoJSON={GeoJSON} />
          {/* Overlay GeoJSON se fornito (Open Data) */}
          {filteredFC ? (
            <GeoJSON
              data={filteredFC as any}
              pointToLayer={(feature: any = {}, latlng: any) => L.marker(latlng, { icon: getParkingIcon(feature?.properties) })}
              onEachFeature={(feature: any = {}, layer: any) => {
                const name = feature?.properties?.name || 'Parcheggio';
                layer.bindTooltip(name);
              }}
            />
          ) : null}
          {/* Marker singoli nascosti per ridurre il clutter */}
        </MapContainer>
      </div>
      {error && (
        <div className="p-3 text-xs text-red-300">{error}</div>
      )}
    </div>
  );
}
