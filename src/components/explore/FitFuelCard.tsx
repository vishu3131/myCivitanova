import React from 'react';
import Image from 'next/image';
import { MapPin, Clock, Star, Dumbbell, Phone, Globe } from 'lucide-react';

const FitFuelCard: React.FC = () => {
  return (
    <div
      className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20"
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
            src="https://images.unsplash.com/photo-1517341720779-6d2687dc53f0?auto=format&fit=crop&w=1200&q=80"
            alt="FitFuel - Healthy Bar @ EXE Gym"
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-cyan-500/20 backdrop-blur-md flex items-center gap-1 border border-cyan-400/30">
            <Dumbbell className="w-3 h-3 text-cyan-300" />
            <span className="text-cyan-200 text-xs font-medium">Healthy Bar</span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-medium">4.6</span>
          </div>

          {/* Price Range */}
          <div className="absolute bottom-4 left-4 px-2 py-1 rounded-full bg-white/20 backdrop-blur-md">
            <span className="text-white text-xs font-medium">€€</span>
          </div>

          {/* Featured */}
          <div className="absolute bottom-4 right-4 px-2 py-1 rounded-full bg-cyan-500/30 backdrop-blur-md border border-cyan-400/50">
            <span className="text-cyan-200 text-xs font-medium">Protein & Smoothies</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-white text-lg font-bold mb-1 group-hover:text-cyan-300 transition-colors duration-200">
                FitFuel (EXE Gym)
              </h3>
              <p className="text-white/70 text-sm leading-relaxed mb-2">
                Bar salutare all’interno della palestra EXE: smoothie proteici, healthy bowls, caffetteria e snack bilanciati per pre e post workout.
              </p>
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3 text-white/60" />
                <span className="text-white/60 text-xs">EXE Gym, Civitanova Marche</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/60" />
                <span className="text-white/60 text-xs">07:00 - 21:30 • Lun-Sab</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs">+39 0733 ••••••</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs truncate max-w-[140px]">—</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-medium rounded-full border border-cyan-400/30">
              Smoothies
            </span>
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-medium rounded-full border border-cyan-400/30">
              Protein Bar
            </span>
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-medium rounded-full border border-cyan-400/30">
              Healthy Snacks
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">EXE</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">2-5 min</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">95</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full mt-4 bg-gradient-to-r from-cyan-500/20 to-sky-500/20 hover:from-cyan-500/30 hover:to-sky-500/30 text-cyan-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] border border-cyan-400/30 backdrop-blur-sm">
            Scopri di più
          </button>
        </div>
      </div>
    </div>
  );
};

export default FitFuelCard;
