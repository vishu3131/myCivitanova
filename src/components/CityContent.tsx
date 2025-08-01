"use client";

import React from 'react';
import { WeatherWidget } from './WeatherWidget';
import { ServicesWidget } from './ServicesWidget';

export function CityContent() {
  return (
    <div className="flex-1 p-6 md:p-8 ml-20 md:ml-24 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-medium text-white mb-1">
            Civitanova Marche
          </h1>
          <p className="text-textSecondary text-sm">
            Disegnata da Comune di Civitanova
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-dark-300 transition-colors relative">
            <span className="text-white text-2xl">🔔</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full"></span>
          </button>
          <button className="p-2 rounded-full hover:bg-dark-300 transition-colors">
            <span className="text-white text-2xl">✏️</span>
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="image-grid">
          <div className="image-grid-main rounded-xl overflow-hidden shadow-md relative">
            <img 
              src="https://source.unsplash.com/random/800x600/?civitanova,marche,port" 
              alt="Porto di Civitanova Marche" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-center text-white text-sm">
                <span className="mr-1 text-base">📍</span>
                <span>Porto</span>
              </div>
            </div>
          </div>
          <div className="image-grid-secondary rounded-xl overflow-hidden relative shadow-md">
            <img 
              src="https://source.unsplash.com/random/400x300/?civitanova,marche,beach" 
              alt="Lungomare di Civitanova Marche" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-center text-white text-xs">
                <span className="mr-1 text-sm">📍</span>
                <span>Lungomare</span>
              </div>
            </div>
          </div>
          <div className="image-grid-secondary rounded-xl overflow-hidden relative shadow-md">
            <img 
              src="https://source.unsplash.com/random/400x300/?civitanova,marche,historic" 
              alt="Centro storico di Civitanova Marche" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-center text-white text-xs">
                <span className="mr-1 text-sm">📍</span>
                <span>Centro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <p className="text-white/80 leading-relaxed">
          Civitanova Marche è una perla dell'Adriatico. Con il suo mix di arte, mare e cultura contemporanea, 
          la città invita ogni visitatore a esplorare i suoi quartieri vivaci e la sua anima marittima. 
          Scopri la storia che vive tra le sue vie.
        </p>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          {/* District Card */}
          <div className="bg-dark-300 rounded-xl p-6 card-glow border border-dark-100 relative overflow-hidden mb-6">
            <div className="absolute top-3 right-3 bg-accent/20 text-accent rounded-full px-2 py-1 text-xs font-medium flex items-center">
              <span className="mr-1 text-sm">⭐</span>
              <span>In evidenza</span>
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-heading font-medium text-white">Centro Storico</h2>
                <div className="flex items-center text-textSecondary text-sm mt-1">
                  <span className="mr-1 text-base">🕒</span>
                  <span>Ultimo aggiornamento 5 ore fa</span>
                </div>
              </div>
              <button className="bg-accent text-black font-medium py-2 px-4 rounded-lg flex items-center hover:bg-opacity-90 transition-colors">
                <span>ENTRA</span>
                <span className="ml-1 text-base">→</span>
              </button>
            </div>
            
            <div className="h-40 rounded-lg overflow-hidden mt-4">
              <img 
                src="https://source.unsplash.com/random/800x400/?civitanova,marche,old,town" 
                alt="Centro Storico di Civitanova Marche" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-dark-300 overflow-hidden">
                  <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-dark-300 overflow-hidden">
                  <img src="https://i.pravatar.cc/100?img=2" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-dark-300 overflow-hidden">
                  <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="text-textSecondary text-sm">
                +24 persone hanno visitato oggi
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Weather Widget */}
          {/* <WeatherWidget /> */}
          
          {/* Services Widget */}
          <ServicesWidget />
        </div>
      </div>
    </div>
  );
}