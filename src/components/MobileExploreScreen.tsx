"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { StatusBar } from './StatusBar';
import { BottomNavbar } from './BottomNavbar';
import { SearchModal } from './SearchModal';
import { ArrowLeft, Search, Filter, Star, MapPin, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const categories = [
  { id: 'all', label: 'Tutti', count: 24 },
  { id: 'culture', label: 'Cultura', count: 8 },
  { id: 'nature', label: 'Natura', count: 6 },
  { id: 'food', label: 'Cibo', count: 10 },
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
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaces() {
      setLoading(true);
      const { data, error } = await supabase.from('places').select('*');
      if (!error && data) setPlaces(data as Place[]);
      setLoading(false);
    }
    fetchPlaces();
  }, []);

  const filteredPlaces = places.filter((place: Place) => {
    const matchesCategory = activeCategory === 'all' || place.category === activeCategory;
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
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
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
                  activeCategory === category.id ? 'scale-105' : 'hover:scale-105'
                }`}
                style={{
                  background: activeCategory === category.id 
                    ? 'rgba(198, 255, 0, 0.15)' 
                    : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: activeCategory === category.id 
                    ? '1px solid rgba(198, 255, 0, 0.3)' 
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: activeCategory === category.id 
                    ? '0 0 10px rgba(198, 255, 0, 0.1)' 
                    : 'none',
                }}
              >
                <span className={`text-sm font-medium ${
                  activeCategory === category.id ? 'text-white' : 'text-white/80'
                }`}>
                  {category.label}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeCategory === category.id 
                    ? 'bg-accent/20 text-accent' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Places List */}
        <div className="px-6 space-y-4">
          {filteredPlaces.map((place, index) => (
            <div
              key={place.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className="rounded-3xl overflow-hidden border"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={place.image}
                    alt={place.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
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
    </div>
  );
}