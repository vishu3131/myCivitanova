"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { StatusBar } from './StatusBar';
import { BottomNavbar } from './BottomNavbar';
import { ArrowLeft, Search, Filter, Navigation, MapPin, Star, Clock, Layers } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Place = {
  id: number;
  name: string;
  type: string;
  distance: string;
  rating: number;
  image: string;
  description: string;
  coordinates?: { lat: number; lng: number };
};

const mapLayers = [
  { id: 'places', label: 'Luoghi', icon: MapPin, active: true, color: 'text-blue-400' },
  { id: 'events', label: 'Eventi', icon: Star, active: true, color: 'text-purple-400' },
  { id: 'services', label: 'Servizi', icon: Clock, active: false, color: 'text-green-400' },
];

export function MobileMapScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayers, setActiveLayers] = useState(new Set(['places', 'events']));
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  useEffect(() => {
    async function fetchPlaces() {
      setLoading(true);
      const { data, error } = await supabase.from('places').select('*');
      if (!error && data) setPlaces(data as Place[]);
      setLoading(false);
    }
    fetchPlaces();
  }, []);

  const toggleLayer = (layerId: string) => {
    const newLayers = new Set(activeLayers);
    if (newLayers.has(layerId)) {
      newLayers.delete(layerId);
    } else {
      newLayers.add(layerId);
    }
    setActiveLayers(newLayers);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      <StatusBar />
      
      <div className="content-with-navbar relative">
        {/* Map Container - Simulated */}
        <div className="relative h-screen">
          {/* Map Background - Using a static image for demo */}
          <div className="absolute inset-0 bg-gray-800">
            <Image
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Mappa Civitanova"
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Map Pins - Simulated */}
          {places.map((place: Place, index: number) => (
            <div
              key={place.id}
              className="absolute cursor-pointer group"
              style={{
                top: `${30 + index * 15}%`,
                left: `${20 + index * 20}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => setSelectedPlace(place)}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200 animate-pulse">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-accent rounded-full"></div>
              </div>
            </div>
          ))}

          {/* Header Overlay */}
          <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-16 pb-4">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => router.back()}
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/60 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              
              <h1 className="text-white text-xl font-bold">Mappa</h1>
              
              <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/60 transition-all duration-200">
                <Navigation className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Search Bar */}
            <div 
              className="flex items-center gap-3 p-4 rounded-2xl border mb-4"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Search className="w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Cerca sulla mappa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none text-sm"
              />
              <button className="p-1">
                <Filter className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* InfoCards Widget Placeholder */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="h-[100px] rounded-[20px] p-4 flex flex-col justify-between cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group" style={{background: 'linear-gradient(135deg, #667eea, #764ba2)'}} />
              <div className="h-[100px] rounded-[20px] p-4 flex flex-col justify-between cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group" style={{background: 'linear-gradient(135deg, #667eea, #764ba2)'}} />
              <div className="h-[100px] rounded-[20px] p-4 flex flex-col justify-between cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group" style={{background: 'linear-gradient(135deg, #667eea, #764ba2)'}} />
            </div>

            {/* Map Layers */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {mapLayers.map((layer) => {
                const IconComponent = layer.icon;
                const isActive = activeLayers.has(layer.id);
                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
                      isActive ? 'scale-105' : 'hover:scale-105'
                    }`}
                    style={{
                      background: isActive 
                        ? 'rgba(198, 255, 0, 0.2)' 
                        : 'rgba(0, 0, 0, 0.4)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: isActive 
                        ? '1px solid rgba(198, 255, 0, 0.4)' 
                        : '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-white/70'}`} />
                    <span className={`text-sm font-medium ${isActive ? 'text-accent' : 'text-white/70'}`}>
                      {layer.label}
                    </span>
                    {/* DUPLICATO */}
                    <span className={`text-sm font-medium ${isActive ? 'text-accent' : 'text-white/70'}`}>
                      {layer.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Place Detail Modal - VERSIONE MIGLIORATA */}
          {selectedPlace && (
            <div
              className="fixed inset-0 z-[9979] flex items-end"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSelectedPlace(null)}
              aria-label="Chiudi modale"
            >
              <div
                className="w-full bg-black/90 backdrop-blur-xl p-6 rounded-t-3xl border-t border-white/10 relative"
                style={{ zIndex: 9980 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-start gap-4 mb-4">
                  <Image
                    src={selectedPlace.image || '/placeholder.png'}
                    alt={selectedPlace.name || 'Luogo'}
                    width={80}
                    height={80}
                    className="rounded-2xl object-cover bg-gray-700"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-white text-xl font-bold mb-2">{selectedPlace.name || 'Luogo'}</h3>
                    <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                      <span>{selectedPlace.type || '-'}</span>
                      <span>•</span>
                      <span>{selectedPlace.distance || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm font-medium">{selectedPlace.rating ?? '-'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    style={{ position: 'absolute', top: 16, right: 16, zIndex: 9999 }}
                    aria-label="Chiudi"
                  >
                    <ArrowLeft className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="text-white/80 text-sm mb-4">{selectedPlace.description || 'Nessuna descrizione disponibile.'}</p>
                <button className="mt-2 w-full py-3 rounded-2xl bg-accent text-black font-bold text-base hover:bg-accent/90 transition-colors">
                  Vai qui
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNavbar />
    </div>
  );
}
