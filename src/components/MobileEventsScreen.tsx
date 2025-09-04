"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Users, Heart, Share2, MapPin, ArrowRight } from 'lucide-react';
import { BottomNavbar } from './BottomNavbar';
import { PullToRefresh } from './PullToRefresh';
import { useToast } from './Toast';
import EventPopup from './EventPopup';

// Eventi aggiornati: Settembre, Ottobre, Novembre 2025
export const events = [
  {
    id: 1,
    title: 'Bim Bum Bam Festival - Giorno 1',
    date: '2025-09-06',
    time: '10:00',
    location: 'Varie location in città',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    category: 'Famiglia',
    price: 'Gratuito',
    attendees: 450,
    liked: false,
    description: 'Weekend dedicato a bambini e famiglie con spettacoli, laboratori e giochi. 6-7 settembre 2025. Programma dettagliato sui canali ufficiali.'
  },
  {
    id: 2,
    title: 'Bim Bum Bam Festival - Giorno 2',
    date: '2025-09-07',
    time: '10:00',
    location: 'Varie location in città',
    image: 'https://images.unsplash.com/photo-1520975693416-35a29d6f1a47?auto=format&fit=crop&w=800&q=80',
    category: 'Famiglia',
    price: 'Gratuito',
    attendees: 520,
    liked: false,
    description: 'Seconda giornata del festival per i più piccoli. Spettacoli e animazione per concludere l’estate.'
  },
  {
    id: 3,
    title: 'Civitanova Vintage Market - Giorno 1',
    date: '2025-09-06',
    time: '09:00',
    location: 'Lungomare Piermanni',
    image: 'https://images.unsplash.com/photo-1515168833906-d2a3b82b302a?auto=format&fit=crop&w=800&q=80',
    category: 'Mercato',
    price: 'Gratuito',
    attendees: 300,
    liked: true,
    description: 'Vintage, collezionismo e modernariato sul lungomare. A cura di Gianni Brandozzi.'
  },
  {
    id: 4,
    title: 'Civitanova Vintage Market - Giorno 2',
    date: '2025-09-07',
    time: '09:00',
    location: 'Lungomare Piermanni',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    category: 'Mercato',
    price: 'Gratuito',
    attendees: 340,
    liked: true,
    description: 'Seconda giornata del mercato vintage: abbigliamento, accessori e design d’epoca.'
  },
  {
    id: 5,
    title: 'Civitate Nova - Rievocazione Storica',
    date: '2025-09-06',
    time: '17:00',
    location: 'Centro città e Civitanova Alta',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    category: 'Storia',
    price: 'Gratuito',
    attendees: 600,
    liked: false,
    description: 'Cortei in costume, figuranti, spettacoli e antichi mestieri per riscoprire tradizioni e storia locale.'
  },
  {
    id: 6,
    title: 'Sport Live - Festival dello Sport Marchigiano',
    date: '2025-09-14',
    time: '10:00',
    location: 'Varie location in città',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
    category: 'Sport',
    price: 'Gratuito',
    attendees: 800,
    liked: false,
    description: 'Giornata dedicata alla promozione dello sport con dimostrazioni, esibizioni e prove aperte a tutti.'
  },
  {
    id: 7,
    title: 'Dramma Teatrale "Carbonari!"',
    date: '2025-09-20',
    time: '21:00',
    location: 'Teatro Annibal Caro, Civitanova Alta',
    image: 'https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=800&q=80',
    category: 'Teatro',
    price: '—',
    attendees: 250,
    liked: false,
    description: 'Dramma di Stefano Cosimi con Quintetto Gigli e il M° Alfredo Sorichetti al pianoforte. Ore 21:00.'
  },
  {
    id: 8,
    title: 'Civitanova Piano Festival - Giorno 1',
    date: '2025-09-24',
    time: '21:00',
    location: 'Teatri di Civitanova',
    image: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=800&q=80',
    category: 'Musica',
    price: '—',
    attendees: 200,
    liked: false,
    description: 'Rassegna di musica classica con concerti pianistici. Programma e artisti sui canali TDiC.'
  },
  {
    id: 9,
    title: 'Civitanova Piano Festival - Giorno 2',
    date: '2025-09-25',
    time: '21:00',
    location: 'Teatri di Civitanova',
    image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80',
    category: 'Musica',
    price: '—',
    attendees: 210,
    liked: false,
    description: 'Seconda serata della rassegna pianistico-classica. Programma in definizione.'
  },
  {
    id: 10,
    title: 'NID Platform – FORMA MENTIS / WOLF SPIDER',
    date: '2025-10-01',
    time: '20:30',
    location: 'Teatro Rossini',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80',
    category: 'Danza',
    price: '—',
    attendees: 500,
    liked: false,
    description: 'La Piattaforma della Danza Italiana: Jacopo Godani – FORMA MENTIS / KOR’SIA – WOLF SPIDER.'
  },
  {
    id: 11,
    title: 'NID Platform – SUSPENDED CHORUS',
    date: '2025-10-02',
    time: '20:30',
    location: 'Teatro Rossini',
    image: 'https://images.unsplash.com/photo-1555371363-7a63aca750f2?auto=format&fit=crop&w=800&q=80',
    category: 'Danza',
    price: '—',
    attendees: 480,
    liked: false,
    description: 'NID Platform: Silvia Gribaudi – Suspended Chorus.'
  },
  {
    id: 12,
    title: 'NID Platform – RAVE.L',
    date: '2025-10-03',
    time: '20:30',
    location: 'Teatro Rossini',
    image: 'https://images.unsplash.com/photo-1492683513057-20145b8e3753?auto=format&fit=crop&w=800&q=80',
    category: 'Danza',
    price: '—',
    attendees: 470,
    liked: false,
    description: 'NID Platform: Virginia Spallarossa – RAVE.L.'
  },
  {
    id: 13,
    title: 'NID Platform – SISTA / LA DUSE. Nessuna Opera',
    date: '2025-10-04',
    time: '20:30',
    location: 'Teatro Rossini',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80',
    category: 'Danza',
    price: '—',
    attendees: 520,
    liked: false,
    description: 'NID Platform: Simona Bertozzi – SISTA / Adriano Bolognino – LA DUSE. Nessuna Opera.'
  },
  {
    id: 14,
    title: "Fiera d'Autunno e Mercatini",
    date: '2025-10-19',
    time: '09:00',
    location: 'Piazza XX Settembre',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80',
    category: 'Fiera',
    price: 'Gratuito',
    attendees: 650,
    liked: true,
    description: 'Mercatini autunnali nel cuore della città. Tradizioni, sapori e colori di stagione.'
  },
  {
    id: 15,
    title: 'Sapore di Mare – Il Musical',
    date: '2025-11-11',
    time: '21:00',
    location: 'Teatro Rossini',
    image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80',
    category: 'Teatro',
    price: '—',
    attendees: 700,
    liked: false,
    description: 'Apertura stagione 2025/26. Adattamento del cult dei Vanzina, regia di Maurizio Colombi con Fatima Trotta.'
  },
  {
    id: 16,
    title: "I Martedì dell'Arte – Apertura rassegna",
    date: '2025-09-10',
    time: '18:00',
    location: 'Cine-Teatro Enrico Cecchetti',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=800&q=80',
    category: 'Conferenze',
    price: 'Gratuito',
    attendees: 180,
    liked: false,
    description: "Rassegna di conferenze su storia dell'arte, archeologia e cultura. Ogni martedì pomeriggio (ingresso gratuito)."
  },
  {
    id: 17,
    title: "I Martedì dell'Arte – Ciclo autunnale",
    date: '2025-10-14',
    time: '18:00',
    location: 'Cine-Teatro Enrico Cecchetti',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80',
    category: 'Conferenze',
    price: 'Gratuito',
    attendees: 160,
    liked: false,
    description: 'Approfondimenti su Piero della Francesca, desiderio, archeologia di Ancona e Numana.'
  },
  {
    id: 18,
    title: "I Martedì dell'Arte – Ciclo invernale",
    date: '2025-11-18',
    time: '18:00',
    location: 'Cine-Teatro Enrico Cecchetti',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80',
    category: 'Conferenze',
    price: 'Gratuito',
    attendees: 170,
    liked: false,
    description: 'Focus su Monte Rinaldo, Barocco ascolano e opere salvate dal terremoto.'
  }
];

export function MobileEventsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('today');
  const [likedEvents, setLikedEvents] = useState(new Set([2, 4]));
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const { showToast, ToastContainer } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isPopupOpen, setPopupOpen] = useState(false);

  const openPopup = (event: any) => {
    setSelectedEvent(event);
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    setSelectedEvent(null);
  };

  // Calcolo dinamico contatori filtri (oggi, settimana, mese, tutti)
  const parseISODateLocal = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const day = (date.getDay() + 6) % 7; // Lunedì = 0
    date.setDate(date.getDate() - day);
    return date;
  };

  const getEndOfWeek = (d: Date) => {
    const start = getStartOfWeek(d);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const now = new Date();
  const startW = getStartOfWeek(now);
  const endW = getEndOfWeek(now);

  const counts = events.reduce(
    (acc: { today: number; week: number; month: number; all: number }, e) => {
      const ed = parseISODateLocal(e.date);
      if (isSameDay(ed, now)) acc.today++;
      if (ed >= startW && ed <= endW) acc.week++;
      if (ed.getFullYear() === now.getFullYear() && ed.getMonth() === now.getMonth()) acc.month++;
      acc.all++;
      return acc;
    },
    { today: 0, week: 0, month: 0, all: 0 }
  );

  const timeFilters = [
    { id: 'today', label: 'Oggi', count: counts.today },
    { id: 'week', label: 'Questa settimana', count: counts.week },
    { id: 'month', label: 'Questo mese', count: counts.month },
    { id: 'all', label: 'Tutti', count: counts.all },
  ];

  const toggleLike = (eventId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  const toggleFlip = (eventId: number) => {
    const newSet = new Set(flipped);
    if (newSet.has(eventId)) newSet.delete(eventId);
    else newSet.add(eventId);
    setFlipped(newSet);
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

  const featured = events[0];
  const isFeaturedFlipped = flipped.has(featured.id);

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

        {/* Featured Event (Flip Card) */}
        <div className="px-6 mb-6">
          <h2 className="text-white text-lg font-bold mb-4">In Evidenza</h2>
          <div
            className="group transition-all duration-300 hover:scale-[1.02]"
            style={{ perspective: '1000px', WebkitPerspective: '1000px' }}
            onClick={() => toggleFlip(featured.id)}
          >
            <div
              className="relative rounded-3xl overflow-hidden cursor-pointer"
              style={{
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                willChange: 'transform',
                transform: isFeaturedFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 600ms',
                minHeight: '280px'
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <div
                  className="relative h-72"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={(e) => toggleLike(featured.id, e)}
                      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/60 transition-all duration-200"
                    >
                      <Heart className={`w-5 h-5 ${likedEvents.has(featured.id) ? 'text-red-500 fill-current' : 'text-white'}`} />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/60 transition-all duration-200"
                    >
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                        {featured.category}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
                        {featured.price}
                      </span>
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">{featured.title}</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white/80 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(featured.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{featured.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{featured.attendees}</span>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); openPopup(featured); }} className="text-accent text-sm font-medium flex items-center hover:underline">
                            <span>Scopri di più</span>
                        </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 p-6 flex flex-col overflow-y-auto"
                style={{
                  transform: 'rotateY(180deg)',
                  WebkitTransform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  background: 'rgba(30, 31, 33, 0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="flex flex-col h-full justify-between">
                  {/* Header con categoria */}
                  <div className="mb-4">
                    <span className="px-4 py-2 self-start rounded-full bg-accent/25 text-accent text-sm font-semibold border border-accent/30">{featured.category}</span>
                  </div>
                  
                  {/* Titolo ottimizzato */}
                  <h3 className="text-white text-xl font-bold mb-5 leading-tight">{featured.title}</h3>
                  
                  {/* Info evento con layout verticale */}
                  <div className="flex flex-col gap-3 mb-5">
                    <div className="flex items-center gap-3 text-white/80 text-base">
                      <Calendar className="w-5 h-5 text-accent" />
                      <span className="font-medium">{formatDate(featured.date)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/80 text-base">
                      <Clock className="w-5 h-5 text-accent" />
                      <span className="font-medium">{featured.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/80 text-base">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span className="font-medium">{featured.location}</span>
                    </div>
                  </div>
                  
                  {/* Descrizione ottimizzata */}
                  <div className="flex-1 mb-5">
                    <h4 className="text-white/90 text-base font-semibold mb-3 uppercase tracking-wide">Descrizione</h4>
                    <p className="text-white/95 text-lg leading-relaxed whitespace-pre-wrap font-light">{featured.description}</p>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-center pt-4 border-t border-white/10">
                    <span className="text-white/60 text-sm font-medium bg-white/5 px-4 py-2 rounded-full">Tocca per tornare</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events List (Flip Cards) */}
        <div className="px-6">
          <h2 className="text-white text-lg font-bold mb-4">Prossimi Eventi</h2>
          <div className="space-y-4">
            {events.slice(1).map((event, index) => {
              const isFlipped = flipped.has(event.id);
              return (
                <div
                  key={event.id}
                  className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 0.1}s`, perspective: '1000px', WebkitPerspective: '1000px' }}
                  onClick={() => toggleFlip(event.id)}
                >
                  <div
                    className="relative rounded-2xl overflow-hidden border"
                    style={{
                      transformStyle: 'preserve-3d',
                      WebkitTransformStyle: 'preserve-3d',
                      willChange: 'transform',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      transition: 'transform 600ms',
                      minHeight: '200px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {/* Front */}
                    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                      <div className="flex w-full h-full">
                        {/* Image */}
                        <div className="relative w-32 h-full flex-shrink-0">
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
                                <button onClick={(e) => { e.stopPropagation(); openPopup(event); }} className="text-accent text-xs font-medium flex items-center hover:underline mt-2">
                                    <span>Scopri di più</span>
                                </button>
                            </div>
                            <button
                              onClick={(e) => toggleLike(event.id, e)}
                              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-200"
                            >
                              <Heart className={`w-4 h-4 ${likedEvents.has(event.id) ? 'text-red-500 fill-current' : 'text-white/60'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back */}
                    <div
                      className="absolute inset-0 p-5 flex flex-col overflow-y-auto"
                      style={{
                        transform: 'rotateY(180deg)',
                        WebkitTransform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        background: 'rgba(30, 31, 33, 0.85)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <div className="flex flex-col h-full justify-between">
                        {/* Header con categoria e prezzo */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1.5 rounded-full bg-accent/25 text-accent text-sm font-semibold border border-accent/30">
                            {event.category}
                          </span>
                          <span className="text-white/70 text-sm font-medium bg-white/10 px-2 py-1 rounded-lg">{event.price}</span>
                        </div>
                        
                        {/* Titolo ottimizzato */}
                        <h3 className="text-white text-lg font-bold mb-4 leading-tight">{event.title}</h3>
                        
                        {/* Info evento con icone più grandi */}
                        <div className="flex flex-col gap-2 mb-4">
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <Calendar className="w-4 h-4 text-accent" />
                            <span className="font-medium">{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <Clock className="w-4 h-4 text-accent" />
                            <span className="font-medium">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <MapPin className="w-4 h-4 text-accent" />
                            <span className="font-medium">{event.location}</span>
                          </div>
                        </div>
                        
                        {/* Descrizione ottimizzata */}
                        <div className="flex-1 mb-4">
                          <h4 className="text-white/90 text-sm font-semibold mb-2 uppercase tracking-wide">Descrizione</h4>
                          <p className="text-white/95 text-base leading-relaxed whitespace-pre-wrap font-light">
                            {event.description}
                          </p>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-center pt-3 border-t border-white/10">
                          <span className="text-white/60 text-xs font-medium bg-white/5 px-3 py-1.5 rounded-full">Tocca per tornare</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

          <div className="h-8" />
        </div>
      </PullToRefresh>

      <BottomNavbar />

      {isPopupOpen && selectedEvent && (
        <EventPopup event={selectedEvent} onClose={closePopup} />
      )}
      
      <ToastContainer />
    </div>
  );
}
