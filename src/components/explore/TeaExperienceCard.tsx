import React from 'react';
import Image from 'next/image';
import { MapPin, Clock, Star, Coffee, Phone, Globe } from 'lucide-react';

const TeaExperienceCard: React.FC = () => {
  return (
    <div
      className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20"
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
            src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80"
            alt="Tea Experience - Tè, infusi e tisane"
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md flex items-center gap-1 border border-emerald-400/30">
            <Coffee className="w-3 h-3 text-emerald-300" />
            <span className="text-emerald-200 text-xs font-medium">Tè & Infusi</span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-medium">4.7</span>
          </div>

          {/* Price Range */}
          <div className="absolute bottom-4 left-4 px-2 py-1 rounded-full bg-white/20 backdrop-blur-md">
            <span className="text-white text-xs font-medium">€€</span>
          </div>

          {/* Featured */}
          <div className="absolute bottom-4 right-4 px-2 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md border border-emerald-400/50">
            <span className="text-emerald-200 text-xs font-medium">Artigianale</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-white text-lg font-bold mb-1 group-hover:text-emerald-300 transition-colors duration-200">
                Tea Experience
              </h3>
              <p className="text-white/70 text-sm leading-relaxed mb-2">
                Selezione curata di tè in foglia, infusi e tisane da filiera controllata. Miscele classiche e specialty, accessori per la preparazione e consigli di degustazione.
              </p>
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3 text-white/60" />
                <span className="text-white/60 text-xs">Centro, Civitanova Marche</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/60" />
                <span className="text-white/60 text-xs">10:00 - 20:00 • Lun-Sab</span>
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
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-400/30">
              Miscele Pregiate
            </span>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-400/30">
              Accessori da Tè
            </span>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-400/30">
              Degustazione
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">Centro</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">5-10 min</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">120</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full mt-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] border border-emerald-400/30 backdrop-blur-sm">
            Scopri di più
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeaExperienceCard;
