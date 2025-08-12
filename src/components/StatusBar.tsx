"use client";

import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

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
      className="status-bar-fixed flex justify-between items-center px-6 pb-2" 
      style={{ 
        zIndex: 9999,
        paddingTop: 'max(12px, env(safe-area-inset-top))'
      }}
    >
      {/* Left side - Time */}
      <div className="flex items-center">
        <span className="text-white text-sm font-semibold tracking-wide">
          {isMounted ? currentTime : '--:--'}
        </span>
      </div>

      {/* Right side - Status icons */}
      <div className="flex items-center gap-1">
        <Signal className="w-4 h-4 text-white/80" />
        <Wifi className="w-4 h-4 text-white/80" />
        <div className="flex items-center gap-1">
          <Battery className="w-4 h-4 text-white/80" />
          <span className="text-white/70 text-xs">87%</span>
        </div>
      </div>
    </div>
  );
}