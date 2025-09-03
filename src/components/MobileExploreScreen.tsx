"use client";

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { StatusBar } from './StatusBar';
import { BottomNavbar } from './BottomNavbar';
import { SearchModal } from './SearchModal';
import { ArrowLeft, Search, Filter, Star, MapPin, Globe, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ShoppingActivityCard } from '@/components/ShoppingActivityCard';
import HeliotropeCard from '@/components/explore/HeliotropeCard';
import TeaExperienceCard from '@/components/explore/TeaExperienceCard';
import FitFuelCard from '@/components/explore/FitFuelCard';

// Unified POI item shape from /api/pois
type PoiItem = {
  id: string | number;
  name: string;
  category: string;
  imageUrl?: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  position?: [number, number];
};

// Category chip shape
type CategoryChip = { id: string; label: string; count: number };

// Mock shopping activities integrated into Explore (module scope for stable identity)
const shoppingActivities = [
  {
    id: 1,
    name: 'Boutique Eleganza',
    category: 'shopping',
    subcategory: 'shopping',
    image: '/images/boutique-eleganza.jpg',
    rating: 4.8,
    reviews: 120,
    distance: '2.5 km',
    time: '10-20 min',
    description: 'Abbigliamento di alta moda e accessori esclusivi.',
    address: 'Via Roma, 10',
    openingHours: 'Lun-Sab: 10:00-19:00',
    tags: ['moda', 'lusso', 'accessori'],
    priceRange: '€€€',
    phone: '+39 0733 123456',
    website: 'www.boutiqueeleganza.it',
    features: ['Wi-Fi gratuito', 'Parcheggio', 'Accesso disabili', 'Camerini ampi'],
  },
];

export function MobileExploreScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('shopping');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [places, setPlaces] = useState<PoiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { triggerHaptic } = useHapticFeedback();

  const handleRefresh = async () => {
    triggerHaptic('light');
    await fetchPlaces();
  };

  const pullToRefreshProps = usePullToRefresh({ onRefresh: handleRefresh });

  // Fetch POIs from unified API (demo ensures many pins and auto-geocoding)
  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pois?demo=1');
      const data: PoiItem[] = await res.json();
      setPlaces(Array.isArray(data) ? data : []);
    } catch (_) {
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Build category chips dynamically + keep a special shopping pill
  const categoryChips: CategoryChip[] = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of places) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    const chips: CategoryChip[] = [
      { id: 'shopping', label: 'Shopping', count: shoppingActivities.length },
      { id: 'all', label: 'Tutti', count: places.length },
      ...Object.entries(counts).map(([cat, count]) => ({ id: cat.toLowerCase(), label: cat, count })),
    ];
    return chips;
  }, [places]);

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return places.filter((place) => {
      const matchesCategory =
        activeCategory === 'all' ||
        (activeCategory !== 'shopping' && place.category.toLowerCase() === activeCategory);
      const matchesSearch =
        !q || place.name.toLowerCase().includes(q) || (place.description?.toLowerCase().includes(q) ?? false);
      return matchesCategory && matchesSearch;
    });
  }, [places, activeCategory, searchQuery]);

  return (
    <div ref={pullToRefreshProps.containerRef} className="min-h-screen bg-black relative overflow-hidden">
      <StatusBar />
      
      <div className="content-with-navbar">
        {/* Header */}
        <div className="relative px-6 pt-16 pb-6">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            <h1 className="text-white text-xl font-bold">Esplora</h1>
            
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-200">
              <Filter className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full flex items中心 gap-3 p-4 rounded-2xl border transition-all duration-200 hover:bg-white/5"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <Search className="w-5 h-5 text-white/60" />
              <span className="flex-1 text-left text-white/60 text-sm">
                {searchQuery || 'Cerca luoghi, attrazioni...'}
              </span>
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide mb-6">
            {categoryChips.map((category) => {
              const isShopping = category.id === 'shopping';
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    if (isShopping) {
                      setActiveCategory('shopping');
                    } else {
                      setActiveCategory(category.id);
                    }
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ease-in-out ${
                    isActive ? 'scale-105' : 'hover:scale-105'
                  } ${isShopping ? 'shopping-pill hover:brightness-110' : ''}`}
                  style={{
                    background: isShopping
                      ? 'linear-gradient(135deg, rgba(212,175,55,0.35), rgba(212,175,55,0.15))'
                      : (isActive
                        ? 'rgba(198, 255, 0, 0.15)'
                        : 'rgba(255, 255, 255, 0.08)'),
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: isShopping
                      ? '1px solid rgba(212,175,55,0.6)'
                      : (isActive
                        ? '1px solid rgba(198, 255, 0, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.12)'),
                    boxShadow: isShopping
                      ? 'none'
                      : (isActive
                        ? '0 0 10px rgba(198, 255, 0, 0.1)'
                        : 'none'),
                  }}
                >
                  <span className={`text-sm font-medium ${
                    isShopping ? 'text-yellow-200' : (isActive ? 'text-white' : 'text-white/80')
                  }`}>
                    {category.label}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isShopping
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                      : (isActive ? 'bg-accent/20 text-accent' : 'bg-white/10 text-white/60')
                  }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {activeCategory === 'shopping' ? (
          <div className="px-6 space-y-6">
            <h2 className="text-2xl font-bold text-white">In Evidenza</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 place-items-center">
              <div className="w-full max-w-sm"><HeliotropeCard /></div>
              <div className="w-full max-w-sm"><TeaExperienceCard /></div>
              <div className="w-full max-w-sm"><FitFuelCard /></div>
            </div>
            <h2 className="text-2xl font-bold text-white">Altre Attività</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shoppingActivities.map((activity) => (
                <ShoppingActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 space-y-4">
            {loading && (
              <div className="grid grid-cols-1 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-3xl overflow-hidden border border-white/10 bg白色/5 h-48" />
                ))}
              </div>
            )}
            {!loading && filteredPlaces.length === 0 && (
              <div className="text-center text-white/70 py-10">
                Nessun luogo trovato per la categoria selezionata.
              </div>
            )}

            {!loading && filteredPlaces.map((place) => (
              <div
                key={place.id}
                className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/50"
                onClick={() => {
                  if (place.position) {
                    const [lat, lng] = place.position;
                    router.push(`/mappa?focus=${lat.toFixed(6)},${lng.toFixed(6)}&name=${encodeURIComponent(place.name)}`);
                  }
                }}
              >
                <div
                  className="rounded-3xl overflow-hidden border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-800">
                    <Image src={place.imageUrl || 'https://images.unsplash.com/photo-1503264116251-35a269479413?w=800&h=400&fit=crop'} alt={place.name} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Optional Rating Badge (if available in future) */}
                    {false && (
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-white text-xs font-medium">4.5</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white text-lg font-bold mb-1 group-hover:text-accent transition-colors duration-200">
                          {place.name}
                        </h3>
                        <p className="text-white/70 text-sm leading-relaxed">
                          {place.description || 'Scopri di più aprendo la mappa con i dettagli.'}
                        </p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-2">
                      {place.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-white/60" />
                          <span className="text-white/80 text-sm">{place.address}</span>
                        </div>
                      )}
                      {place.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-white/60" />
                          <a href={`tel:${place.phone}`} className="text-white/80 text-sm hover:underline">{place.phone}</a>
                        </div>
                      )}
                      {place.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-white/60" />
                          <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-white/80 text-sm hover:underline">Sito web</a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="h-8" />
      </div>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={(query) => setSearchQuery(query)}
      />

      <BottomNavbar />

      <style jsx>{`
        .shopping-pill {
          position: relative;
          isolation: isolate; /* keep pseudo-elements within this pill's stacking context */
        }
        .shopping-pill::before {
          content: "";
          position: absolute;
          inset: -2px; /* slight halo outside the pill */
          border-radius: 9999px;
          border: 1px solid rgba(212, 175, 55, 0.55);
          box-shadow:
            0 0 0 1px rgba(212, 175, 55, 0.25) inset,
            0 0 12px rgba(212, 175, 55, 0.30),
            0 0 24px rgba(212, 175, 55, 0.15);
          pointer-events: none;
          z-index: -1; /* sit behind content but above background */
          animation: goldPulse 3.2s ease-in-out infinite;
        }
        .shopping-pill::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: linear-gradient(120deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0));
          transform: translateX(-150%);
          animation: shimmer 6s linear infinite;
          pointer-events: none;
          mix-blend-mode: screen;
          opacity: 0.35;
        }
        @keyframes goldPulse {
          0%, 100% {
            box-shadow:
              0 0 0 1px rgba(212, 175, 55, 0.25) inset,
              0 0 12px rgba(212, 175, 55, 0.30),
              0 0 24px rgba(212, 175, 55, 0.15);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(212, 175, 55, 0.35) inset,
              0 0 18px rgba(212, 175, 55, 0.40),
              0 0 34px rgba(212, 175, 55, 0.22);
          }
        }
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
      `}</style>
    </div>
  );
}
