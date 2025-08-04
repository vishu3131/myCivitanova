"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Users, Heart, Share2, MapPin } from 'lucide-react';
import { BottomNavbar } from './BottomNavbar';
import { PullToRefresh } from './PullToRefresh';
import { useToast } from './Toast';

const timeFilters = [
  { id: 'today', label: 'Oggi', count: 5 },
  { id: 'week', label: 'Questa settimana', count: 12 },
  { id: 'month', label: 'Questo mese', count: 28 },
  { id: 'all', label: 'Tutti', count: 45 },
];

const events = [
  {
    id: 1,
    title: 'Concerto Jazz al Porto',
    date: '2024-01-15',
    time: '21:00',
    location: 'Porto Turistico',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Musica',
    price: 'Gratuito',
    attendees: 156,
    liked: false,
    description: 'Serata di jazz con artisti locali e internazionali'
  },
  {
    id: 2,
    title: 'Mercato del Sabato',
    date: '2024-01-16',
    time: '08:00',
    location: 'Piazza XX Settembre',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Mercato',
    price: 'Gratuito',
    attendees: 89,
    liked: true,
    description: 'Prodotti locali, artigianato e specialità gastronomiche'
  },
  {
    id: 3,
    title: 'Mostra d\'Arte Contemporanea',
    date: '2024-01-18',
    time: '18:00',
    location: 'Palazzo Sforza',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Arte',
    price: '€8',
    attendees: 234,
    liked: false,
    description: 'Esposizione di artisti emergenti del territorio marchigiano'
  },
  {
    id: 4,
    title: 'Corsa sulla Spiaggia',
    date: '2024-01-20',
    time: '07:30',
    location: 'Lungomare Sud',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Sport',
    price: '€5',
    attendees: 67,
    liked: true,
    description: '5km di corsa mattutina lungo la costa adriatica'
  }
];

export function MobileEventsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('today');
  const [likedEvents, setLikedEvents] = useState(new Set([2, 4]));
  const { showToast, ToastContainer } = useToast();

  const toggleLike = (eventId: number) => {
    const newLiked = new Set(likedEvents);
    if (newLiked.has(eventId)) {
      newLiked.delete(eventId);
      showToast('Evento rimosso dai preferiti', 'info');
    } else {
      newLiked.add(eventId);
      showToast('Evento aggiunto ai preferiti', 'success');
    }
    setLikedEvents(newLiked);
  };

  const handleRefresh = async () => {
    // Simula il caricamento di nuovi eventi
    await new Promise(resolve => setTimeout(resolve, 1500));
    showToast('Eventi aggiornati', 'success');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* StatusBar removed */}
      
      <PullToRefresh onRefresh={handleRefresh}>
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
            
            <h1 className="text-white text-xl font-bold">Eventi</h1>
            
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-200">
              <Calendar className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Time Filters */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide mb-6">
            {timeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
                  activeFilter === filter.id ? 'scale-105' : 'hover:scale-105'
                }`}
                style={{
                  background: activeFilter === filter.id 
                    ? 'rgba(198, 255, 0, 0.15)' 
                    : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: activeFilter === filter.id 
                    ? '1px solid rgba(198, 255, 0, 0.3)' 
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: activeFilter === filter.id 
                    ? '0 0 10px rgba(198, 255, 0, 0.1)' 
                    : 'none',
                }}
              >
                <span className={`text-sm font-medium ${
                  activeFilter === filter.id ? 'text-white' : 'text-white/80'
                }`}>
                  {filter.label}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeFilter === filter.id 
                    ? 'bg-accent/20 text-accent' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Event */}
        <div className="px-6 mb-6">
          <h2 className="text-white text-lg font-bold mb-4">In Evidenza</h2>
          <div
            className="relative rounded-3xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div className="relative h-56">
              <Image
                src={events[0].image}
                alt={events[0].title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => toggleLike(events[0].id)}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/60 transition-all duration-200"
                >
                  <Heart className={`w-5 h-5 ${likedEvents.has(events[0].id) ? 'text-red-500 fill-current' : 'text-white'}`} />
                </button>
                <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/60 transition-all duration-200">
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                    {events[0].category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
                    {events[0].price}
                  </span>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">{events[0].title}</h3>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(events[0].date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{events[0].time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{events[0].attendees}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="px-6">
          <h2 className="text-white text-lg font-bold mb-4">Prossimi Eventi</h2>
          <div className="space-y-4">
            {events.slice(1).map((event, index) => (
              <div
                key={event.id}
                className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="rounded-2xl overflow-hidden border flex"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {/* Image */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                            {event.category}
                          </span>
                          <span className="text-white/60 text-xs">{event.price}</span>
                        </div>
                        <h3 className="text-white text-sm font-bold mb-1 group-hover:text-accent transition-colors duration-200">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-3 text-white/60 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleLike(event.id)}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-200"
                      >
                        <Heart className={`w-4 h-4 ${likedEvents.has(event.id) ? 'text-red-500 fill-current' : 'text-white/60'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

          <div className="h-8" />
        </div>
      </PullToRefresh>

      <BottomNavbar />
    </div>
  );
}