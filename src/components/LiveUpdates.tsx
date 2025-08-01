"use client";

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

const updates = [
  {
    id: 1,
    title: "Nuovo evento al Porto",
    message: "Concerto jazz stasera alle 21:00",
    time: "2 min fa",
    type: "event"
  },
  {
    id: 2,
    title: "Traffico Centro",
    message: "Via Roma temporaneamente chiusa",
    time: "5 min fa",
    type: "traffic"
  },
  {
    id: 3,
    title: "Meteo",
    message: "Possibili piogge nel pomeriggio",
    time: "10 min fa",
    type: "weather"
  }
];

export function LiveUpdates() {
  const [currentUpdate, setCurrentUpdate] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUpdate((prev) => (prev + 1) % updates.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const update = updates[currentUpdate];

  return (
    <div style={{ paddingLeft: '24px', paddingRight: '24px', marginTop: '16px' }}>
      <div
        className="relative rounded-2xl p-4 cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/20"
        >
          <X className="w-3 h-3 text-white/70" />
        </button>

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-accent" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-white text-sm font-semibold truncate">
                {update.title}
              </h4>
              <span className="text-white/50 text-xs flex-shrink-0 ml-2">
                {update.time}
              </span>
            </div>
            <p className="text-white/80 text-xs leading-relaxed">
              {update.message}
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-1 mt-3 justify-center">
          {updates.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentUpdate 
                  ? 'w-6 bg-accent' 
                  : 'w-1 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}