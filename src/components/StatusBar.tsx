"use client";

import React, { useState, useEffect } from 'react';
import { Wifi, Signal } from 'lucide-react';
import { NeonButtonSimple } from './NeonButtonSimple';

export function StatusBar() {
  const [currentTime, setCurrentTime] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="status-bar-fixed flex justify-between items-center px-6 pb-2 bg-black/30 backdrop-blur-md rounded-b-xl shadow-lg transition-all duration-300 ease-in-out"
      style={{
        zIndex: 9999,
        paddingTop: 'max(12px, env(safe-area-inset-top))',
      }}
    >
      {/* Left side - Time */}
      <div className="flex items-center">
        <span className="text-white text-lg font-bold tracking-wider drop-shadow-md">
          {isMounted ? currentTime : '--:--'}
        </span>
      </div>

      {/* Center - Neon Button */}
      <div className="flex-grow flex justify-center items-center">
        <NeonButtonSimple text="MYCIVITANOVA.IT" size="xs" className="h-6" />
      </div>

      {/* Right side - Status icons */}
      <div className="flex items-center gap-2">
        <Signal className="w-5 h-5 text-white/80 animate-pulse-subtle" />
        <Wifi className="w-5 h-5 text-white/80 animate-pulse-subtle animation-delay-100" />
      </div>
    </div>
  );
}