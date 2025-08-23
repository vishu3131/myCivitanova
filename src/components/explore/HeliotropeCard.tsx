import React from 'react';
import Image from 'next/image';
import { MapPin, Clock, Star, Wine, Phone, Globe } from 'lucide-react';

const HeliotropeCard: React.FC = () => {
  return (
    <div
      className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/20"
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
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMODsV6G-0None0LSSTjhl9LAxsmXEYXY1Qg&s"
            alt="Heliotrope Bar"
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-yellow-500/20 backdrop-blur-md flex items-center gap-1 border border-yellow-400/30">
            <Wine className="w-3 h-3 text-yellow-300" />
            <span className="text-yellow-200 text-xs font-medium">Cocktail Bar</span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-medium">4.8</span>
          </div>

          {/* Price Range (assuming Heliotrope has a price range, adding a placeholder) */}
          <div className="absolute bottom-4 left-4 px-2 py-1 rounded-full bg-white/20 backdrop-blur-md">
            <span className="text-white text-xs font-medium">€€€</span>
          </div>

          {/* Featured Badge (if it has special features) */}
          {/* Assuming some features for Heliotrope to show this badge */}
          <div className="absolute bottom-4 right-4 px-2 py-1 rounded-full bg-yellow-500/30 backdrop-blur-md border border-yellow-400/50">
            <span className="text-yellow-200 text-xs font-medium">Premium</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-white text-lg font-bold mb-1 group-hover:text-yellow-300 transition-colors duration-200">
                Heliotrope
              </h3>
              <p className="text-white/70 text-sm leading-relaxed mb-2">
                Cocktail bar elegante nel cuore di Civitanova Marche. Atmosfera sofisticata con una selezione curata di cocktail creativi e drink premium.
              </p>
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3 text-white/60" />
                <span className="text-white/60 text-xs">Corso Umberto I, 180, 62012 Civitanova Marche MC</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/60" />
                <span className="text-white/60 text-xs">12:30 - 01:00 • Ogni giorno</span>
              </div>
            </div>
          </div>

          {/* Contact Info (if available) - Adding placeholders for phone/website */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs">+39 0733 123456</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs truncate max-w-[120px]">www.heliotropebar.it</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded-full border border-yellow-400/30">
              Cocktail Creativi
            </span>
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded-full border border-yellow-400/30">
              Atmosfera Elegante
            </span>
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded-full border border-yellow-400/30">
              Centro Storico
            </span>
          </div>

          {/* Features Preview - Adding some placeholder features */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-white/5 text-white/70 text-xs rounded-full border border-white/10">
                Wi-Fi gratuito
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full mt-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] border border-yellow-400/30 backdrop-blur-sm">
            Scopri di più
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeliotropeCard;
