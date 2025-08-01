"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Code, Home, Calendar, Compass, MapPin, User, Settings, X } from 'lucide-react';

const pages = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Esplora', path: '/esplora', icon: Compass },
  { name: 'Eventi', path: '/eventi', icon: Calendar },
  { name: 'Servizi', path: '/servizi', icon: Settings },
  { name: 'Mappa', path: '/mappa', icon: MapPin },
  { name: 'Profilo', path: '/profilo', icon: User },
];

export function DevNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
        style={{ zIndex: 9997 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Code className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Navigation Menu */}
      {isOpen && (
        <div
          className="fixed bottom-40 right-6 rounded-2xl border p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            zIndex: 9997,
          }}
        >
          <h3 className="text-white text-sm font-bold mb-3">Dev Navigation</h3>
          <div className="space-y-2">
            {pages.map((page) => {
              const IconComponent = page.icon;
              return (
                <button
                  key={page.path}
                  onClick={() => {
                    router.push(page.path);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-left"
                >
                  <IconComponent className="w-4 h-4 text-purple-400" />
                  <span className="text-white text-sm">{page.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}