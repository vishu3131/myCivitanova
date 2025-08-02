"use client";

import React, { useState } from 'react';
import { Bus, Clock, MapPin, X, Filter, Calendar, Navigation, ChevronDown, ChevronUp } from 'lucide-react';

interface BusRoute {
  id: string;
  number: string;
  name: string;
  color: string;
  destinations: string[];
  schedules: {
    weekday: string[];
    weekend: string[];
  };
  direction: 'outbound' | 'return';
  stops: string[];
}

interface BusScheduleWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const busRoutes: BusRoute[] = [
  {
    id: '1',
    number: '1',
    name: 'Centro - Stazione',
    color: 'bg-blue-500',
    destinations: ['Centro Storico', 'Stazione FS'],
    schedules: {
      weekday: ['06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'],
      weekend: ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
    },
    direction: 'outbound',
    stops: ['Piazza del Popolo', 'Via Roma', 'Corso Matteotti', 'Stazione FS']
  },
  {
    id: '1r',
    number: '1',
    name: 'Stazione - Centro',
    color: 'bg-blue-500',
    destinations: ['Stazione FS', 'Centro Storico'],
    schedules: {
      weekday: ['06:45', '07:15', '07:45', '08:15', '08:45', '09:15', '09:45', '10:15', '10:45', '11:15', '11:45', '12:15', '12:45', '13:15', '13:45', '14:15', '14:45', '15:15', '15:45', '16:15', '16:45', '17:15', '17:45', '18:15', '18:45', '19:15', '19:45', '20:15'],
      weekend: ['07:15', '08:15', '09:15', '10:15', '11:15', '12:15', '13:15', '14:15', '15:15', '16:15', '17:15', '18:15', '19:15', '20:15']
    },
    direction: 'return',
    stops: ['Stazione FS', 'Corso Matteotti', 'Via Roma', 'Piazza del Popolo']
  },
  {
    id: '2',
    number: '2',
    name: 'Centro - Mare',
    color: 'bg-green-500',
    destinations: ['Centro Storico', 'Lungomare'],
    schedules: {
      weekday: ['06:45', '07:30', '08:15', '09:00', '09:45', '10:30', '11:15', '12:00', '12:45', '13:30', '14:15', '15:00', '15:45', '16:30', '17:15', '18:00', '18:45', '19:30'],
      weekend: ['07:30', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30']
    },
    direction: 'outbound',
    stops: ['Piazza del Popolo', 'Via Nazionale', 'Viale Europa', 'Lungomare Sud']
  },
  {
    id: '2r',
    number: '2',
    name: 'Mare - Centro',
    color: 'bg-green-500',
    destinations: ['Lungomare', 'Centro Storico'],
    schedules: {
      weekday: ['07:00', '07:45', '08:30', '09:15', '10:00', '10:45', '11:30', '12:15', '13:00', '13:45', '14:30', '15:15', '16:00', '16:45', '17:30', '18:15', '19:00', '19:45'],
      weekend: ['07:45', '08:45', '09:45', '10:45', '11:45', '12:45', '13:45', '14:45', '15:45', '16:45', '17:45', '18:45', '19:45']
    },
    direction: 'return',
    stops: ['Lungomare Sud', 'Viale Europa', 'Via Nazionale', 'Piazza del Popolo']
  },
  {
    id: '3',
    number: '3',
    name: 'Ospedale - Università',
    color: 'bg-red-500',
    destinations: ['Ospedale', 'Campus Universitario'],
    schedules: {
      weekday: ['06:30', '07:15', '08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '12:30', '13:15', '14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15'],
      weekend: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
    },
    direction: 'outbound',
    stops: ['Ospedale Civile', 'Via dei Medici', 'Viale Università', 'Campus Est']
  },
  {
    id: '4',
    number: '4',
    name: 'Zona Industriale',
    color: 'bg-purple-500',
    destinations: ['Centro', 'Zona Industriale'],
    schedules: {
      weekday: ['06:00', '06:45', '07:30', '08:15', '12:00', '12:45', '13:30', '14:15', '17:00', '17:45', '18:30'],
      weekend: ['08:00', '12:00', '17:00']
    },
    direction: 'outbound',
    stops: ['Piazza del Popolo', 'Via Industriale', 'Zona Artigianale', 'Area Industriale']
  }
];

export function BusScheduleWidget({ isOpen, onClose }: BusScheduleWidgetProps) {
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [scheduleType, setScheduleType] = useState<'weekday' | 'weekend'>('weekday');
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'outbound' | 'return'>('all');
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  if (!isOpen) return null;

  const filterSchedulesByTime = (schedules: string[]) => {
    if (timeFilter === 'all') return schedules;
    
    return schedules.filter(time => {
      const hour = parseInt(time.split(':')[0]);
      switch (timeFilter) {
        case 'morning': return hour >= 6 && hour < 12;
        case 'afternoon': return hour >= 12 && hour < 18;
        case 'evening': return hour >= 18 && hour <= 23;
        default: return true;
      }
    });
  };

  const filteredRoutes = busRoutes.filter(route => {
    const routeMatch = selectedRoute === 'all' || route.number === selectedRoute;
    const directionMatch = directionFilter === 'all' || route.direction === directionFilter;
    return routeMatch && directionMatch;
  });

  const uniqueRouteNumbers = Array.from(new Set(busRoutes.map(route => route.number)));

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const getNextDeparture = (schedules: string[]) => {
    const currentTime = getCurrentTime();
    const nextDeparture = schedules.find(time => time > currentTime);
    return nextDeparture || schedules[0]; // Return first departure of next day if no more today
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl border overflow-hidden"
        style={{
          background: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">Orari Autobus</h2>
              <p className="text-white/60 text-sm">Consulta gli orari di tutte le linee</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Route Filter */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Linea</label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutte le linee</option>
                {uniqueRouteNumbers.map(number => (
                  <option key={number} value={number}>Linea {number}</option>
                ))}
              </select>
            </div>

            {/* Schedule Type Filter */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Tipo orario</label>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value as 'weekday' | 'weekend')}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekday">Giorni feriali</option>
                <option value="weekend">Weekend e festivi</option>
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Fascia oraria</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutto il giorno</option>
                <option value="morning">Mattina (06:00-12:00)</option>
                <option value="afternoon">Pomeriggio (12:00-18:00)</option>
                <option value="evening">Sera (18:00-23:00)</option>
              </select>
            </div>

            {/* Direction Filter */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Direzione</label>
              <select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value as any)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutte le direzioni</option>
                <option value="outbound">Andata</option>
                <option value="return">Ritorno</option>
              </select>
            </div>
          </div>
        </div>

        {/* Routes List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredRoutes.map((route) => {
              const schedules = filterSchedulesByTime(route.schedules[scheduleType]);
              const nextDeparture = getNextDeparture(route.schedules[scheduleType]);
              const isExpanded = expandedRoute === route.id;

              return (
                <div
                  key={route.id}
                  className="rounded-xl border border-white/10 overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  {/* Route Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors duration-200"
                    onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${route.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                          {route.number}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{route.name}</h3>
                          <p className="text-white/60 text-sm">
                            {route.destinations.join(' ↔ ')} • {route.direction === 'outbound' ? 'Andata' : 'Ritorno'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            <span>Prossimo: {nextDeparture}</span>
                          </div>
                          <p className="text-white/60 text-xs mt-1">
                            {schedules.length} corse {scheduleType === 'weekday' ? 'feriali' : 'festive'}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-white/60" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/60" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-white/10">
                      {/* Stops */}
                      <div className="p-4 border-b border-white/10">
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          Fermate
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {route.stops.map((stop, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm"
                            >
                              {stop}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Schedule Table */}
                      <div className="p-4">
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-400" />
                          Orari {scheduleType === 'weekday' ? 'Feriali' : 'Festivi'}
                        </h4>
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                          {schedules.map((time, index) => {
                            const currentTime = getCurrentTime();
                            const isNext = time === nextDeparture && time > currentTime;
                            const isPast = time < currentTime;
                            
                            return (
                              <div
                                key={index}
                                className={`p-2 rounded-lg text-center text-sm font-medium transition-colors duration-200 ${
                                  isNext
                                    ? 'bg-green-500 text-white'
                                    : isPast
                                    ? 'bg-white/5 text-white/40'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                              >
                                {time}
                              </div>
                            );
                          })}
                        </div>
                        {schedules.length === 0 && (
                          <p className="text-white/60 text-sm text-center py-4">
                            Nessuna corsa disponibile per i filtri selezionati
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredRoutes.length === 0 && (
            <div className="text-center py-12">
              <Bus className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Nessuna linea trovata</h3>
              <p className="text-white/60 text-sm">
                Prova a modificare i filtri per visualizzare più risultati
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Prossima corsa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                <span>Corsa passata</span>
              </div>
            </div>
            <p className="text-white/60">
              Aggiornato alle {getCurrentTime()} • Orari indicativi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}