'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import dynamic from 'next/dynamic';
import { SlidersHorizontal, Search, RefreshCw } from 'lucide-react';
import MapControlWidget from './MapControlWidget';
import PoiDetailCard from './PoiDetailCard';

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

const activityCategories = ['Ristorante', 'Bar', 'Servizi', 'Spiaggia'];

const getIconForPoi = (category: string) => {
  return activityCategories.includes(category) ? activityIcon : defaultIcon;
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

const MappaMagnifica = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [pois, setPois] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tutti');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPoi, setSelectedPoi] = useState<any>(null);
  const [mapKey, setMapKey] = useState(Date.now()); // Add a key for re-rendering
  const civitanovaPosition: [number, number] = [43.307, 13.73];

  useEffect(() => {
    setIsMounted(true);
    fetchPois();
  }, []);

  const fetchPois = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pois');
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
  };

  const handleRefresh = () => {
    setActiveCategory('Tutti');
    setSearchTerm('');
    setSelectedPoi(null);
    setMapKey(Date.now()); // Change the key to force a re-render
    fetchPois();
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
    setSelectedPoi(poi);
  };

  if (!isMounted || isLoading) {
    return <div className="flex items-center justify-center h-screen">Caricamento...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Error: {error}</div>;
  }

  return (
    <div className="relative h-screen">
      <MapContainer key={mapKey} center={civitanovaPosition} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
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

      {/* Floating Action Buttons */}
      <div className="absolute top-4 right-4 z-[500] flex flex-col gap-3">
        <button 
          onClick={() => setIsWidgetOpen(true)}
          className="bg-white p-4 rounded-full shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-110"
          aria-label="Apri controlli mappa"
        >
          <SlidersHorizontal size={24} className="text-gray-800" />
        </button>
        <button 
          onClick={handleRefresh}
          className="bg-white p-4 rounded-full shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-110"
          aria-label="Aggiorna mappa"
        >
          <RefreshCw size={24} className="text-gray-800" />
        </button>
      </div>

      <MapControlWidget 
        isOpen={isWidgetOpen} 
        onClose={() => setIsWidgetOpen(false)}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      <PoiDetailCard poi={selectedPoi} onClose={() => setSelectedPoi(null)} />
    </div>
  );
};

export default MappaMagnifica;
