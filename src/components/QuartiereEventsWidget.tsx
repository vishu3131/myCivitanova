'use client';

import React, { useState } from 'react';
import { QuartiereEvent } from '@/data/quartieriData';
import { CalendarIcon, ClockIcon, MapPinIcon, TagIcon } from '@heroicons/react/24/outline';

interface QuartiereEventsWidgetProps {
  events: QuartiereEvent[];
  color?: string;
}

const categoryColors = {
  cultura: 'purple',
  sport: 'green',
  musica: 'pink',
  arte: 'blue',
  gastronomia: 'orange'
};

const categoryIcons = {
  cultura: '🎭',
  sport: '⚽',
  musica: '🎵',
  arte: '🎨',
  gastronomia: '🍽️'
};

export const QuartiereEventsWidget: React.FC<QuartiereEventsWidgetProps> = ({ 
  events, 
  color = "blue" 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  const categories = Array.from(new Set(events.map(event => event.category)));
  
  const filteredEvents = selectedCategory 
    ? events.filter(event => event.category === selectedCategory)
    : events;

  const sortedEvents = filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const isEventToday = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return today.toDateString() === eventDate.toDateString();
  };

  const isEventUpcoming = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return eventDate > today;
  };

  if (events.length === 0) {
    return (
      <div className="w-full bg-gray-800 rounded-xl p-6">
        <h3 className={`text-xl font-bold text-${color}-100 mb-4`}>Eventi del Quartiere</h3>
        <div className="text-center py-8">
          <CalendarIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Nessun evento programmato</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold text-${color}-100`}>Eventi del Quartiere</h3>
          <span className={`px-3 py-1 rounded-full bg-${color}-500/20 text-${color}-300 text-sm font-medium`}>
            {filteredEvents.length} eventi
          </span>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedCategory === null
                ? `bg-${color}-500 text-white`
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Tutti
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${
                selectedCategory === category
                  ? `bg-${categoryColors[category as keyof typeof categoryColors]}-500 text-white`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
              <span className="capitalize">{category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Events list */}
      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="p-4 space-y-4">
          {sortedEvents.map((event) => {
            const isExpanded = expandedEvent === event.id;
            const categoryColor = categoryColors[event.category];
            
            return (
              <div
                key={event.id}
                className={`relative bg-gray-800/50 backdrop-blur-sm rounded-lg border transition-all duration-300 hover:shadow-lg cursor-pointer ${
                  isEventToday(event.date)
                    ? `border-${color}-400 shadow-${color}-500/20`
                    : isEventUpcoming(event.date)
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-700 opacity-75'
                }`}
                onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
              >
                {/* Event badge */}
                {isEventToday(event.date) && (
                  <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full bg-${color}-500 text-white text-xs font-bold animate-pulse`}>
                    OGGI
                  </div>
                )}

                <div className="p-4">
                  {/* Event header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{categoryIcons[event.category]}</span>
                        <h4 className="font-semibold text-white text-lg">{event.title}</h4>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`px-2 py-1 rounded-full bg-${categoryColor}-500/20 text-${categoryColor}-300 text-xs font-medium`}>
                      <TagIcon className="w-3 h-3 inline mr-1" />
                      {event.category}
                    </div>
                  </div>

                  {/* Event description (expandable) */}
                  <div className={`transition-all duration-300 overflow-hidden ${
                    isExpanded ? 'max-h-40' : 'max-h-12'
                  }`}>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Event image */}
                  {event.image && isExpanded && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}

                  {/* Expand indicator */}
                  <div className="flex justify-center mt-3">
                    <div className={`w-6 h-1 rounded-full bg-gray-600 transition-transform duration-300 ${
                      isExpanded ? 'rotate-180' : ''
                    }`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer stats */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <div className="flex justify-between text-sm text-gray-400">
          <span>
            {sortedEvents.filter(e => isEventUpcoming(e.date)).length} eventi in arrivo
          </span>
          <span>
            {sortedEvents.filter(e => isEventToday(e.date)).length} eventi oggi
          </span>
        </div>
      </div>
    </div>
  );
};