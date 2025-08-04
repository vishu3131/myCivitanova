"use client";

import React from 'react';
import Image from 'next/image';
import { ArrowLeftRight, Sun, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IntegratedWidgetBar } from './IntegratedWidgetBar';

interface InfoCardsProps {
  onReportClick?: () => void;
}

export function InfoCards({ onReportClick }: InfoCardsProps) {
  const router = useRouter();

  return (
    <div style={{ paddingLeft: '24px', paddingRight: '24px', marginTop: '24px' }}>
       <div className="grid grid-cols-2 gap-4">
        {/* Card immagine luogo - Centro */}
        <div className="relative h-[200px] rounded-[20px] overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300">
          <Image
            src="https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            alt="Centro Civitanova"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/70 transition-all duration-300"></div>
          <div className="absolute bottom-3 left-4 transform group-hover:translate-y-[-2px] transition-transform duration-300">
            <span className="text-white text-base font-semibold drop-shadow-lg">Centro</span>
          </div>
        </div>

        {/* Card percorso */}
        <div className="h-[100px] rounded-[20px] p-4 flex flex-col justify-between cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
             style={{
               background: 'linear-gradient(135deg, #6B73FF, #000DFF)',
             }}>
          <div className="flex items-center justify-between">
            <ArrowLeftRight className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-200" />
            <span className="text-white/70 text-xs group-hover:text-white/90 transition-colors duration-200">8 min a piedi</span>
          </div>
          <div>
            <span className="text-white text-sm font-medium group-hover:text-white transition-colors duration-200">Porto ⇄ Piazza</span>
          </div>
        </div>
        {/* Widget Bar Integrato */}
        <IntegratedWidgetBar 
          onEventClick={() => console.log('Eventi clicked')}
          onParkingClick={() => console.log('Parcheggi clicked')}
          onBeachClick={() => console.log('Spiagge clicked')}
          onReportClick={onReportClick}
        />

        {/* Card meteo */}
        <div className="h-[100px] rounded-[20px] p-4 flex flex-col justify-between cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
             style={{
               background: 'linear-gradient(135deg, #93F9B9, #1D976C)',
             }}>
          <div className="flex items-center justify-between">
            <Sun className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-white/70 text-xs group-hover:text-white/90 transition-colors duration-200">14:30</span>
          </div>
          <div>
            <span className="text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-200 inline-block">24°C</span>
          </div>
        </div>

        {/* Card servizi */}
        <div 
          className="h-[100px] rounded-[20px] p-4 flex flex-col justify-between cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
          }}
          onClick={() => router.push('/servizi')}
        >
          <div className="flex items-center justify-between">
            <Settings className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-200 group-hover:rotate-90" />
            <span className="text-white/70 text-xs group-hover:text-white/90 transition-colors duration-200">Disponibili</span>
          </div>
          <div>
            <span className="text-white text-sm font-medium group-hover:text-white transition-colors duration-200">Servizi</span>
          </div>
        </div>
      </div>
    </div>
  );
}