import React from 'react';
import Image from 'next/image';
import { MapPin, Clock, Star, Wine } from 'lucide-react';

const HeliotropeCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src="/placeholder.svg?height=192&width=384"
          alt="Heliottrope Cocktail Bar"
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
          <Wine className="w-4 h-4 text-amber-400" />
          <span className="text-white text-sm font-medium">Cocktail Bar</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Rating */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900">Heliottrope</h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">4.8</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          Cocktail bar elegante nel cuore di Civitanova Marche. Atmosfera sofisticata con una selezione curata di cocktail creativi e drink premium.
        </p>

        {/* Location */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-600">Centro Storico, Civitanova Marche</span>
        </div>

        {/* Opening Hours */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-600">18:00 - 02:00 • Chiuso Lunedì</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
            Cocktail Creativi
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
            Atmosfera Elegante
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            Centro Storico
          </span>
        </div>

        {/* Action Button */}
        <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
          Scopri di più
        </button>
      </div>
    </div>
  );
};

export default HeliotropeCard;
