"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { events as allEvents } from './MobileEventsScreen';

const eventStyles = {
  icon: '📅',
  bg: 'bg-[#2A9D8F]/10',
  text: 'text-[#2A9D8F]',
  border: 'border-[#2A9D8F]/20',
};

function formatEventDate(date?: string, time?: string) {
  if (!date) return '';
  const d = new Date(`${date}T${time || '00:00'}`);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

type CarouselEvent = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  price: string;
  attendees: number;
  liked?: boolean;
};

export function EventsCarousel() {
  const [events, setEvents] = useState<CarouselEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [activeItem, setActiveItem] = useState<CarouselEvent | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
      const ordered = [...allEvents].sort((a, b) => {
        const aDate = new Date(`${a.date}T${a.time || '00:00'}`);
        const bDate = new Date(`${b.date}T${b.time || '00:00'}`);
        return aDate.getTime() - bDate.getTime();
      });
      setEvents(ordered);
      setIndex(0);
    } catch (e) {
      console.error('Errore nel caricamento eventi:', e);
      setError('Errore nel caricamento degli eventi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (events.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % events.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [events.length]);

  const handlePrevious = () => setIndex((i) => (i - 1 + events.length) % events.length);
  const handleNext = () => setIndex((i) => (i + 1) % events.length);

  const handleView = (item: CarouselEvent) => {
    setActiveItem(item);
    setShowDetails(true);
  };

  
  
  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white">Caricamento eventi...</span>
        </div>
      </div>
    );
  }

  if (error || events.length === 0) {
    return (
      <div className="mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-center">{error || 'Nessun evento in programma'}</p>
        </div>
      </div>
    );
  }

  const current = events[index];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-heading font-medium">Eventi</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <CalendarDays className="w-4 h-4 text-emerald-300" />
            <span>{events.length} eventi</span>
          </div>
          <Link href="/eventi" className="text-xs text-white/80 hover:text-white underline">
            Scopri tutti gli eventi
          </Link>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className={`relative rounded-2xl p-6 border ${eventStyles.bg} ${eventStyles.border} cursor-pointer overflow-hidden`}
            onClick={() => handleView(current)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full ${eventStyles.bg} flex items-center justify-center text-xl`}>
                  {eventStyles.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${eventStyles.bg} ${eventStyles.text} border ${eventStyles.border}`}>
                      EVENTO
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 text-white`}>
                    {current.title}
                  </h3>
                  {current.description && (
                    <p className="text-gray-300 text-sm line-clamp-2 mb-3">{current.description}</p>
                  )}
                  <div className="flex items-center text-gray-400 text-xs gap-2 flex-wrap">
                    <span>{formatEventDate(current.date, current.time)}</span>
                    <span>•</span>
                    <span>{current.location}</span>
                    <span>•</span>
                    <span>{current.category}</span>
                  </div>
                </div>
              </div>

              {/* Actions removed for simplified carousel; tap card to see dettagli */}
            </div>
          </motion.div>
        </AnimatePresence>

        {events.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
            >
              →
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {events.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-emerald-300' : 'bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    {/* Details Modal */}
      {showDetails && activeItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6 overscroll-contain" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="w-full sm:max-w-lg sm:rounded-2xl bg-gray-900 border border-white/10 p-4 sm:p-6 max-h-[85vh] overflow-y-auto mx-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white text-lg font-semibold pr-6">{activeItem.title}</h3>
              <button className="text-white/60 hover:text-white" onClick={() => setShowDetails(false)} aria-label="Chiudi">✕</button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2 py-1 rounded bg-white/10 text-white/90 text-xs">{activeItem.category}</span>
              <span className="px-2 py-1 rounded bg-white/10 text-white/90 text-xs">{activeItem.price}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm mb-3">
              <div>📅 {formatEventDate(activeItem.date, activeItem.time)}</div>
              <div>📍 {activeItem.location}</div>
              <div>👥 {activeItem.attendees}</div>
            </div>
            {activeItem.description && <p className="text-white/80 text-sm mb-3">{activeItem.description}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Link href="/eventi" className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Scopri tutti gli eventi</Link>
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20" onClick={() => setShowDetails(false)}>Chiudi</button>
            </div>
          </motion.div>
          <button className="absolute inset-0 w-full h-full" onClick={() => setShowDetails(false)} aria-hidden="true"></button>
        </div>
      )}

          </div>
  );
}

export default EventsCarousel;
