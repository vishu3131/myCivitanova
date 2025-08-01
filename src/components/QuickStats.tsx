"use client";

import React from 'react';
import { Users, Calendar, MapPin, Thermometer } from 'lucide-react';

const stats = [
  { id: 'population', label: 'Abitanti', value: '42.5K', icon: Users, color: 'from-blue-500 to-blue-600' },
  { id: 'events', label: 'Eventi oggi', value: '8', icon: Calendar, color: 'from-purple-500 to-purple-600' },
  { id: 'places', label: 'Luoghi', value: '156', icon: MapPin, color: 'from-green-500 to-green-600' },
  { id: 'temp', label: 'Temperatura', value: '24°', icon: Thermometer, color: 'from-orange-500 to-orange-600' },
];

export function QuickStats() {
  return (
    <div style={{ paddingLeft: '24px', paddingRight: '24px', marginTop: '24px' }}>
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.id}
              className="relative h-20 rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer group transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Gradient overlay on hover */}
              <div 
                className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${stat.color}`}
              ></div>
              
              <IconComponent className="w-4 h-4 text-white/70 group-hover:text-white transition-colors duration-200 mb-1" />
              <span className="text-white text-xs font-bold group-hover:scale-110 transition-transform duration-200">
                {stat.value}
              </span>
              <span className="text-white/60 text-[10px] text-center leading-tight group-hover:text-white/80 transition-colors duration-200">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}