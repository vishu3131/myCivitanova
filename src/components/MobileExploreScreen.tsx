"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';
import { StatusBar } from './StatusBar';
import { BottomNavbar } from './BottomNavbar';
import { SearchModal } from './SearchModal';
import { ArrowLeft, Search, Filter, Star, MapPin, Clock, Users, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const categories = [
  { id: 'shopping', label: 'Shopping', count: 7 },
  { id: 'all', label: 'Tutti', count: 24 },
  { id: 'culture', label: 'Cultura', count: 8 },
  { id: 'nature', label: 'Natura', count: 6 },
  { id: 'food', label: 'Cibo', count: 10 },
  { id: 'history', label: 'Storia', count: 5 },
  { id: 'fun', label: 'Divertimento', count: 12 },
];

const demoPlaces = [
  {
    id: 1,
    name: 'Spiaggia di Civitanova Marche',
    category: 'Natura',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Bayside_Civitanova_Marche.JPG',
    rating: 4.5,
    reviews: 120,
    distance: '2 km',
    time: '10 min',
    description: 'Una bellissima spiaggia con sabbia fine e mare cristallino.',
  },
  {
    id: 2,
    name: 'Porto Turistico',
    category: 'Cultura',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Porto_di_Civitanova.jpg',
    rating: 4.0,
    reviews: 80,
    distance: '1 km',
    time: '5 min',
    description: 'Un vivace porto con molte barche e ristoranti di pesce.',
  },
  {
    id: 3,
    name: 'Centro Storico',
    category: 'Storia',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Centro_storico_di_Civitanova_Alta_-_Civitanova_Marche_1.jpg',
    rating: 4.7,
    reviews: 150,
    distance: '3 km',
    time: '15 min',
    description: 'Esplora le vie antiche e i palazzi storici della città alta.',
  },
  {
    id: 4,
    name: 'Lungomare Piermanni',
    category: 'Natura',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Panorama_di_Civitanova_Marche.jpg',
    rating: 4.3,
    reviews: 95,
    distance: '0.5 km',
    time: '2 min',
    description: 'Una passeggiata panoramica lungo la costa con vista mozzafiato.',
  },
  {
    id: 5,
    name: 'Varco sul Mare',
    category: 'Cultura',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Varco_sul_Mare_-_Civitanova_Marche_%28MC%29.jpg',
    rating: 3.8,
    reviews: 60,
    distance: '1.5 km',
    time: '7 min',
    description: 'Un moderno spazio urbano e punto di riferimento architettonico.',
  },
  {
    id: 6,
    name: 'Vecchia Pescheria',
    category: 'Cultura',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Esterno_antica_pescheria.jpg',
    rating: 4.2,
    reviews: 75,
    distance: '0.8 km',
    time: '4 min',
    description: 'L\'antico mercato del pesce, ora un luogo di eventi e cultura.',
  },
  {
    id: 7,
    name: 'Santuario Santa Maria Apparente',
    category: 'Storia',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Civitanova_Marche_-_Torrione_di_Santa_Maria_Apparente_-_2023-09-27_16-19-07_001.jpg',
    rating: 4.6,
    reviews: 110,
    distance: '4 km',
    time: '20 min',
    description: 'Un santuario storico con architettura affascinante e vista panoramica.',
  },
  {
    id: 8,
    name: 'Palazzo Sforza-Cesarini',
    category: 'Storia',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Palazzo_comunale_sforzA.jpg',
    rating: 4.4,
    reviews: 85,
    distance: '3.2 km',
    time: '16 min',
    description: 'Un imponente palazzo storico, sede del municipio.',
  },
  {
    id: 9,
    name: 'Azienda Agricola San Marco',
    category: 'Natura',
    image: 'https://source.unsplash.com/random/800x600?farm',
    rating: 4.8,
    reviews: 130,
    distance: '7 km',
    time: '25 min',
    description: 'Una fattoria locale che offre prodotti tipici e degustazioni.',
  },
  {
    id: 10,
    name: 'Il Trialone',
    category: 'Divertimento',
    image: 'https://source.unsplash.com/random/800x600?amusement-park',
    rating: 4.1,
    reviews: 70,
    distance: '5 km',
    time: '18 min',
    description: 'Un parco divertimenti per tutta la famiglia con attrazioni e giochi.',
  },
  {
    id: 11,
    name: 'Pista Ciclabile sul Lungomare',
    category: 'Natura',
    image: 'https://source.unsplash.com/random/800x600?bike-path',
    rating: 4.5,
    reviews: 90,
    distance: '0.3 km',
    time: '1 min',
    description: 'Percorso ciclabile panoramico lungo la costa, ideale per una pedalata rilassante.'
  },
  {
    id: 12,
    name: 'Teatro Annibal Caro',
    category: 'Cultura',
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Civitanova_Marche_-_Teatro_Annibal_Caro_-_2023-09-27_16-09-36_001.jpg',
    rating: 4.3,
    reviews: 55,
    distance: '2.5 km',
    time: '12 min',
    description: 'Storico teatro che ospita spettacoli e eventi culturali.'
  },
  {
    id: 13,
    name: 'Shopping al Cuore Adriatico',
    category: 'Shopping',
    image: 'https://source.unsplash.com/random/800x600?shopping-mall',
    rating: 4.0,
    reviews: 110,
    distance: '6 km',
    time: '20 min',
    description: 'Uno dei più grandi centri commerciali della zona, perfetto per lo shopping.'
  },
  {
    id: 14,
    name: 'Degustazione Vini nelle Cantine Locali',
    category: 'Cibo',
    image: 'https://source.unsplash.com/random/800x600?wine-tasting',
    rating: 4.8,
    reviews: 70,
    distance: '8 km',
    time: '30 min',
    description: 'Scopri i sapori dei vini locali con una visita guidata alle cantine.'
  },
  {
    id: 15,
    name: 'Corso Umberto I (Passeggiata Serale)',
    category: 'Divertimento',
    image: 'https://source.unsplash.com/random/800x600?night-street',
    rating: 4.2,
    reviews: 80,
    distance: '0.7 km',
    time: '3 min',
    description: 'La via principale per una piacevole passeggiata serale, ricca di negozi e caffè.'
  }
];

type Place = {
  id: number;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  distance: string;
  time: string;
  description: string;
};

export function MobileExploreScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [places, setPlaces] = useState<Place[]>(demoPlaces);
  const [loading, setLoading] = useState(false);
  const { triggerHaptic } = useHapticFeedback();

  const handleRefresh = async () => {
    triggerHaptic('light');
    // Supabase logic removed for now
  };

  const pullToRefreshProps = usePullToRefresh({ onRefresh: handleRefresh });

  // useEffect to fetch data from Supabase is removed for now to force demo data

  const filteredPlaces = places.filter((place: Place) => {
    const matchesCategory = activeCategory === 'all' || place.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              className="w-full flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 hover:bg-white/5"
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
            {categories.map((category) => {
              const isShopping = category.id === 'shopping';
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    if (isShopping) {
                      router.push('/esplora/shopping');
                    } else {
                      setActiveCategory(category.id);
                    }
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ease-in-out ${
                    isActive ? 'scale-105' : 'hover:scale-105'
                  } ${isShopping ? 'shopping-pill hover:brightness-110' : ''}`}
                  style={{
                    // Elegant gold treatment for the Shopping pill
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
                    // For shopping we delegate the glow to CSS ::before animation
                    boxShadow: isShopping
                      ? 'none'
                      : (isActive
                        ? '0 0 10px rgba(198, 255, 0, 0.1)'
                        : 'none'),
                  }}
                >
                  {isShopping && <ShoppingBag className="w-4 h-4 text-yellow-300" />}
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

        {/* Places List */}
        <div className="px-6 space-y-4">
          {loading && (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-3xl overflow-hidden border border-white/10 bg-white/5 h-48" />
              ))}
            </div>
          )}
          {!loading && filteredPlaces.length === 0 && (
            <div className="text-center text-white/70 py-10">
              Nessun luogo trovato per la categoria selezionata.
            </div>
          )}

          {!loading && filteredPlaces.map((place, index) => (
            <div
              key={place.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/50"
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
                  <Image src={place.image} alt={place.name} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-white text-xs font-medium">{place.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white text-lg font-bold mb-1 group-hover:text-accent transition-colors duration-200">
                        {place.name}
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {place.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-white/60" />
                        <span className="text-white/80 text-sm">{place.distance}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-white/60" />
                        <span className="text-white/80 text-sm">{place.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-white/60" />
                        <span className="text-white/80 text-sm">{place.reviews}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
