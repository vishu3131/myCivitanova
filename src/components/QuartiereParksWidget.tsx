'use client';

import React, { useState } from 'react';
import { QuartierePark } from '@/data/quartieriData';
import { MapPinIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface QuartiereParksWidgetProps {
  parks: QuartierePark[];
  color?: string;
}

const facilityIcons: { [key: string]: string } = {
  'area giochi': '🎠',
  'panchine': '🪑',
  'fontana': '⛲',
  'percorso fitness': '🏃‍♂️',
  'area cani': '🐕',
  'campo basket': '🏀',
  'campo calcio': '⚽',
  'pista ciclabile': '🚴‍♂️',
  'area picnic': '🧺',
  'bagni pubblici': '🚻',
  'parcheggio': '🅿️',
  'illuminazione': '💡',
  'wifi': '📶',
  'bar': '☕',
  'ristorante': '🍽️'
};

export const QuartiereParksWidget: React.FC<QuartiereParksWidgetProps> = ({ 
  parks, 
  color = "green" 
}) => {
  const [selectedPark, setSelectedPark] = useState<QuartierePark | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const toggleFavorite = (parkId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(parkId)) {
      newFavorites.delete(parkId);
    } else {
      newFavorites.add(parkId);
    }
    setFavorites(newFavorites);
  };

  const getFacilityIcon = (facility: string) => {
    const lowerFacility = facility.toLowerCase();
    for (const [key, icon] of Object.entries(facilityIcons)) {
      if (lowerFacility.includes(key)) {
        return icon;
      }
    }
    return '🌳'; // Default icon
  };

  if (parks.length === 0) {
    return (
      <div className="w-full bg-gray-800 rounded-xl p-6">
        <h3 className={`text-xl font-bold text-${color}-100 mb-4`}>Parchi e Aree Verdi</h3>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🌳</div>
          <p className="text-gray-400">Nessun parco disponibile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold text-${color}-100`}>Parchi e Aree Verdi</h3>
          <span className={`px-3 py-1 rounded-full bg-${color}-500/20 text-${color}-300 text-sm font-medium`}>
            {parks.length} parchi
          </span>
        </div>
        <p className="text-gray-400 text-sm">Scopri gli spazi verdi del quartiere</p>
      </div>

      {/* Parks grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parks.map((park) => (
            <div
              key={park.id}
              className={`relative bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-600 hover:border-${color}-500 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-${color}-500/20 group`}
              onClick={() => setSelectedPark(selectedPark?.id === park.id ? null : park)}
            >
              {/* Park image */}
              <div className="relative h-32 rounded-t-lg overflow-hidden">
                <img
                  src={park.image}
                  alt={park.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Favorite button */}
                <button
                  onClick={(e) => toggleFavorite(park.id, e)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-300"
                >
                  {favorites.has(park.id) ? (
                    <StarIconSolid className={`w-5 h-5 text-${color}-400`} />
                  ) : (
                    <StarIcon className="w-5 h-5 text-white" />
                  )}
                </button>

                {/* Park name overlay */}
                <div className="absolute bottom-2 left-2 right-2">
                  <h4 className="font-semibold text-white text-lg">{park.name}</h4>
                </div>
              </div>

              {/* Park info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="line-clamp-1">{park.address}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span className="whitespace-nowrap">{park.openingHours}</span>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-gray-300 text-sm mb-3 transition-all duration-300 ${
                  selectedPark?.id === park.id ? 'line-clamp-none' : 'line-clamp-2'
                }`}>
                  {park.description}
                </p>

                {/* Facilities preview */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {park.facilities.slice(0, selectedPark?.id === park.id ? park.facilities.length : 4).map((facility, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-${color}-500/20 text-${color}-300 text-xs font-medium`}
                    >
                      <span>{getFacilityIcon(facility)}</span>
                      <span>{facility}</span>
                    </span>
                  ))}
                  {park.facilities.length > 4 && selectedPark?.id !== park.id && (
                    <span className="px-2 py-1 rounded-full bg-gray-600 text-gray-300 text-xs font-medium">
                      +{park.facilities.length - 4}
                    </span>
                  )}
                </div>

                {/* Expanded content */}
                {selectedPark?.id === park.id && (
                  <div className="animate-fadeIn">
                    <div className="border-t border-gray-700 pt-3 mt-3">
                      <h5 className="font-medium text-white mb-2">Tutte le strutture:</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {park.facilities.map((facility, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                            <span>{getFacilityIcon(facility)}</span>
                            <span>{facility}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coordinates for map integration */}
                    {park.coordinates && (
                      <div className="border-t border-gray-700 pt-3 mt-3">
                        <button className={`w-full py-2 px-4 rounded-lg bg-${color}-500/20 text-${color}-300 hover:bg-${color}-500/30 transition-all duration-300 text-sm font-medium`}>
                          📍 Visualizza sulla mappa
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Expand indicator */}
                <div className="flex justify-center mt-3">
                  <div className={`w-6 h-1 rounded-full bg-gray-600 transition-transform duration-300 ${
                    selectedPark?.id === park.id ? 'rotate-180' : ''
                  }`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <div className="flex justify-between text-sm text-gray-400">
          <span>
            {parks.length} parchi disponibili
          </span>
          <span>
            {favorites.size} preferiti
          </span>
        </div>
      </div>
    </div>
  );
};