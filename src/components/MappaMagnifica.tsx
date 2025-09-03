'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import dynamic from 'next/dynamic';
import { SlidersHorizontal, RefreshCw, Navigation, Compass, Moon, SunMedium, Beaker } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapControlWidget from './MapControlWidget';
import { ACTIVITY_CATEGORIES } from '@/data/poiCategories';
import PoiDetailCard from './PoiDetailCard';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const MarkerClusterGroup: React.ComponentType<any> = dynamic(
  () => import('react-leaflet-markercluster'),
  {
    ssr: false,
  }
);

// Fix for default icon issue with Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

const defaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

const activityIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const activityCategories = ACTIVITY_CATEGORIES;

const getIconForPoi = (category: string) => {
  return activityCategories.includes(category) ? activityIcon : defaultIcon;
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

const MappaMagnifica = () => {
  const { triggerHaptic } = useHapticFeedback();

  const [isMounted, setIsMounted] = useState(false);
  const [pois, setPois] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tutti');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPoi, setSelectedPoi] = useState<any>(null);
  const [demoMode, setDemoMode] = useState<boolean>(true);

  const [mapKey, setMapKey] = useState(Date.now()); // forza re-render
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // User location and heading
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [followUser, setFollowUser] = useState<boolean>(false);
  const [compassEnabled, setCompassEnabled] = useState<boolean>(false);

  // Theme
  const [mapTheme, setMapTheme] = useState<'day' | 'night'>('day');

  // Routing
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [isRouting, setIsRouting] = useState<boolean>(false);

  const civitanovaPosition: [number, number] = [43.307, 13.73];

  // Handle URL query params to focus a POI or draw a route (from Admin links)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const focusStr = url.searchParams.get('focus');
    const routeStr = url.searchParams.get('route');
    const name = url.searchParams.get('name');

    if (focusStr) {
      const [latStr, lngStr] = focusStr.split(',');
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        const tempPoi = { id: 'focus-poi', name: name || 'Luogo', category: 'Interesse', position: [lat, lng] as [number, number] };
        setSelectedPoi(tempPoi);
        if (mapInstance) {
          mapInstance.setView([lat, lng], 17);
        }
      }
    }

    if (routeStr) {
      const [latStr, lngStr] = routeStr.split(',');
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        const tempPoi = { id: 'route-poi', name: name || 'Destinazione', category: 'Interesse', position: [lat, lng] as [number, number] };
        setSelectedPoi(tempPoi);
        // Route requires user position; if available, compute now
        if (userPosition) {
          buildRouteToPoi(tempPoi);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, userPosition]);

  // Montaggio componente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch POIs
  const fetchPois = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pois${demoMode ? '?demo=1' : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch POIs');
      }
      const data = await response.json();
      setPois(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [demoMode]);

  useEffect(() => {
    fetchPois();
  }, [fetchPois]);

  const handleRefresh = () => {
    // Filters and selection
    setActiveCategory('Tutti');
    setSearchTerm('');
    setSelectedPoi(null);
    setError(null);

    // Map UI states
    setIsWidgetOpen(false);
    setFollowUser(false);
    setCompassEnabled(false);
    setHeading(null);
    setMapTheme('day');

    // Routing / overlays
    setRouteCoords([]);
    setIsRouting(false);

    // Location visualization
    setAccuracy(null);

    // Data mode
    setDemoMode(true);

    // Force MapContainer re-mount (resets center/zoom and all leaflet internals)
    setMapKey(Date.now());

    // Reload data will be triggered by demoMode change effect
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const filteredPois = pois.filter(poi => {
    const categoryMatch = activeCategory === 'Tutti' || poi.category === activeCategory;
    const searchMatch = poi.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const handleMarkerClick = (poi: any) => {
    triggerHaptic('light');
    setSelectedPoi(poi);
  };

  // Geolocation watch
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setUserPosition([latitude, longitude]);
        setAccuracy(acc);
        if (followUser && mapInstance) {
          mapInstance.setView([latitude, longitude]);
        }
      },
      () => {
        // ignore errors silently for UX
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [followUser, mapInstance]);

  // Stop follow on user map interaction
  useEffect(() => {
    if (!mapInstance) return;
    const handleDragStart = () => setFollowUser(false);
    mapInstance.on('dragstart', handleDragStart);
    return () => {
      mapInstance.off('dragstart', handleDragStart);
    };
  }, [mapInstance]);

  // Compass / heading
  useEffect(() => {
    if (!compassEnabled) return;
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha;
      if (typeof alpha === 'number') setHeading(alpha);
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [compassEnabled]);

  const requestCompassPermission = async () => {
    // iOS requires explicit permission
    const anyDeviceOrientation = (DeviceOrientationEvent as any);
    try {
      if (anyDeviceOrientation && typeof anyDeviceOrientation.requestPermission === 'function') {
        const res = await anyDeviceOrientation.requestPermission();
        if (res === 'granted') setCompassEnabled(true);
      } else {
        setCompassEnabled(true);
      }
    } catch (_) {
      setCompassEnabled(false);
    }
  };

  // Theme tiles
  const tileUrl = mapTheme === 'day'
    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const tileAttribution = mapTheme === 'day'
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    : '&copy; <a href="https://carto.com/attributions">CARTO</a>';

  const toggleTheme = () => setMapTheme((t) => (t === 'day' ? 'night' : 'day'));

  // Build route via OSRM foot
  const buildRouteToPoi = useCallback(async (poi: any) => {
    if (!userPosition || !poi?.position) return;
    setIsRouting(true);
    try {
      const [lat1, lng1] = userPosition;
      const [lat2, lng2] = poi.position;
      const url = `https://router.project-osrm.org/route/v1/foot/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      const coords = data?.routes?.[0]?.geometry?.coordinates || [];
      const latLngs: [number, number][] = coords.map((c: [number, number]) => [c[1], c[0]]);
      setRouteCoords(latLngs);
      if (mapInstance && latLngs.length) {
        const bounds = L.latLngBounds(latLngs);
        mapInstance.fitBounds(bounds.pad(0.15));
      }
    } catch (_) {
      // ignore
    } finally {
      setIsRouting(false);
    }
  }, [mapInstance, userPosition]);

  if (!isMounted || isLoading) {
    return <div className="flex items-center justify-center h-screen">Caricamento...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Error: {error}</div>;
  }

  return (
    <div className="relative h-screen">
      <MapContainer
        key={mapKey}
        center={civitanovaPosition}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        whenCreated={setMapInstance}
      >
        <TileLayer url={tileUrl} attribution={tileAttribution} />

        {/* Route preview */}
        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} pathOptions={{ color: '#C6FF00', weight: 5, opacity: 0.8 }} />
        )}

        {/* User position */}
        {userPosition && (
          <>
            {typeof accuracy === 'number' && (
              <Circle center={userPosition} radius={Math.max(accuracy, 10)} pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.15, weight: 1 }} />
            )}
            <Marker position={userPosition} icon={defaultIcon} />
          </>
        )}

        <MarkerClusterGroup key={activeCategory + searchTerm}>
          {filteredPois.map(poi => (
            <Marker
              key={poi.id}
              position={poi.position as [number, number]}
              icon={getIconForPoi(poi.category)}
              eventHandlers={{
                click: () => handleMarkerClick(poi),
              }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Top chips - quick category filters */}
      <div className="absolute top-4 left-4 right-4 z-[600]">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['Tutti', ...activityCategories].map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium shadow ${
                activeCategory === category ? 'bg-black/80 text-white' : 'bg-white/90 text-gray-800'
              }`}
              style={{ backdropFilter: 'blur(8px)' }}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute top-20 right-4 z-[600] flex flex-col gap-3">
        <motion.button
          onClick={() => setIsWidgetOpen(true)}
          whileTap={{ scale: 0.9 }}
          className="bg-white p-4 rounded-full shadow-lg hover:bg-gray-100 transition-transform"
          aria-label="Apri controlli mappa"
        >
          <SlidersHorizontal size={22} className="text-gray-800" />
        </motion.button>

        <motion.button
          onClick={handleRefresh}
          whileTap={{ scale: 0.9 }}
          className="bg-white p-4 rounded-full shadow-lg hover:bg-gray-100 transition-transform"
          aria-label="Reset mappa"
          title="Reset mappa"
        >
          <RefreshCw size={22} className="text-gray-800" />
        </motion.button>

        <motion.button
          onClick={() => {
            if (userPosition && mapInstance) {
              setFollowUser(true);
              mapInstance.setView(userPosition, Math.max(mapInstance.getZoom(), 15));
              triggerHaptic('light');
            }
          }}
          whileTap={{ scale: 0.9 }}
          className={`p-4 rounded-full shadow-lg transition-colors ${followUser ? 'bg-accent' : 'bg-white'} `}
          aria-label="Centra sulla mia posizione"
        >
          <Navigation size={22} className={followUser ? 'text-black' : 'text-gray-800'} />
        </motion.button>

        <motion.button
          onClick={toggleTheme}
          whileTap={{ scale: 0.9 }}
          className="bg-white p-4 rounded-full shadow-lg hover:bg-gray-100 transition-transform"
          aria-label="Cambia tema mappa"
        >
          {mapTheme === 'day' ? <Moon size={20} className="text-gray-800" /> : <SunMedium size={20} className="text-gray-800" />}
        </motion.button>

        <motion.button
          onClick={requestCompassPermission}
          whileTap={{ scale: 0.9 }}
          className={`p-4 rounded-full shadow-lg ${compassEnabled ? 'bg-accent' : 'bg-white'}`}
          aria-label="Attiva bussola"
        >
          <Compass size={22} className={compassEnabled ? 'text-black' : 'text-gray-800'} />
        </motion.button>

        {/* Demo Mode Toggle */}
        <motion.button
          onClick={() => { setDemoMode((d) => !d); }}
          whileTap={{ scale: 0.9 }}
          className={`p-4 rounded-full shadow-lg ${demoMode ? 'bg-black text-white' : 'bg-white text-gray-800'}`}
          aria-label="Attiva/Disattiva Demo Mode"
          title={demoMode ? 'Demo ON' : 'Demo OFF'}
        >
          <Beaker size={20} />
        </motion.button>
      </div>

      <MapControlWidget
        isOpen={isWidgetOpen}
        onClose={() => setIsWidgetOpen(false)}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      {/* Compass overlay */}
      {compassEnabled && typeof heading === 'number' && (
        <div className="absolute bottom-24 left-4 z-[600]">
          <div className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center relative" style={{ backdropFilter: 'blur(8px)' }}>
            <div
              className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-red-500"
              style={{ transform: `rotate(${heading}deg)` }}
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        <PoiDetailCard
          poi={selectedPoi}
          onClose={() => setSelectedPoi(null)}
          onNavigate={async (poi) => {
            setRouteCoords([]);
            await buildRouteToPoi(poi);
          }}
        />
      </AnimatePresence>
    </div>
  );
};

export default MappaMagnifica;
