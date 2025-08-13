"use client";

import React from 'react';
import { Star, MapPin, Clock, Wine, Coffee, ShoppingBag, Utensils, Phone, Globe } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface ShoppingActivity {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  image: string;
  rating: number;
  reviews: number;
  distance: string;
  time: string;
  description: string;
  address: string;
  openingHours: string;
  tags: string[];
  priceRange: string;
  phone?: string;
  website?: string;
  features: string[];
}

interface ShoppingActivityCardProps {
  activity: ShoppingActivity;
  onClick?: (activity: ShoppingActivity) => void;
  className?: string;
}

const subcategoryIcons = {
  bar: Wine,
  cafe: Coffee,
  restaurant: Utensils,
  shopping: ShoppingBag,
};

const subcategoryLabels = {
  bar: 'Bar & Cocktail',
  cafe: 'Caffè',
  restaurant: 'Ristoranti',
  shopping: 'Negozi',
};

export function ShoppingActivityCard({ activity, onClick, className = '' }: ShoppingActivityCardProps) {
  const { triggerHaptic } = useHapticFeedback();
  
  const handleClick = () => {
    triggerHaptic('light');
    onClick?.(activity);
  };

  const Icon = subcategoryIcons[activity.subcategory as keyof typeof subcategoryIcons] || ShoppingBag;
  const subcategoryLabel = subcategoryLabels[activity.subcategory as keyof typeof subcategoryLabels] || activity.subcategory;

  return (
    <div
      onClick={handleClick}
      className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/20 ${className}`}
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
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-yellow-900/20 to-orange-900/20">
          {/* Placeholder gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/30 via-orange-600/20 to-red-600/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-yellow-500/20 backdrop-blur-md flex items-center gap-1 border border-yellow-400/30">
            <Icon className="w-3 h-3 text-yellow-300" />
            <span className="text-yellow-200 text-xs font-medium">
              {subcategoryLabel}
            </span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-medium">{activity.rating}</span>
          </div>

          {/* Price Range */}
          <div className="absolute bottom-4 left-4 px-2 py-1 rounded-full bg-white/20 backdrop-blur-md">
            <span className="text-white text-xs font-medium">{activity.priceRange}</span>
          </div>

          {/* Featured Badge (if it has special features) */}
          {activity.features.length > 3 && (
            <div className="absolute bottom-4 right-4 px-2 py-1 rounded-full bg-yellow-500/30 backdrop-blur-md border border-yellow-400/50">
              <span className="text-yellow-200 text-xs font-medium">Premium</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-white text-lg font-bold mb-1 group-hover:text-yellow-300 transition-colors duration-200">
                {activity.name}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed mb-2">
                {activity.description}
              </p>
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3 text-white/60" />
                <span className="text-white/60 text-xs">{activity.address}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/60" />
                <span className="text-white/60 text-xs">{activity.openingHours}</span>
              </div>
            </div>
          </div>

          {/* Contact Info (if available) */}
          {(activity.phone || activity.website) && (
            <div className="flex items-center gap-3 mb-3">
              {activity.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-white/60" />
                  <span className="text-white/60 text-xs">{activity.phone}</span>
                </div>
              )}
              {activity.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-white/60" />
                  <span className="text-white/60 text-xs truncate max-w-[120px]">{activity.website}</span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {activity.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded-full border border-yellow-400/30"
              >
                {tag}
              </span>
            ))}
            {activity.tags.length > 3 && (
              <span className="px-2 py-1 bg-white/10 text-white/60 text-xs font-medium rounded-full border border-white/20">
                +{activity.tags.length - 3}
              </span>
            )}
          </div>

          {/* Features Preview */}
          {activity.features.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {activity.features.slice(0, 4).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/5 text-white/70 text-xs rounded-full border border-white/10"
                  >
                    {feature}
                  </span>
                ))}
                {activity.features.length > 4 && (
                  <span className="px-2 py-1 bg-white/5 text-white/50 text-xs rounded-full border border-white/10">
                    +{activity.features.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">{activity.distance}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">{activity.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">{activity.reviews}</span>
              </div>
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
}

export default ShoppingActivityCard;
