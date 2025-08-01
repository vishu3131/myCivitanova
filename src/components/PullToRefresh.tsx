"use client";

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { containerRef, isRefreshing, pullDistance, isPulling } = usePullToRefresh({
    onRefresh,
  });

  return (
    <div ref={containerRef} className="relative">
      {/* Pull to Refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10"
        style={{
          transform: `translateY(${Math.max(0, pullDistance - 60)}px)`,
          opacity: isPulling ? 1 : 0,
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full border"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <RefreshCw 
            className={`w-4 h-4 text-accent transition-transform duration-200 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: `rotate(${pullDistance * 2}deg)`,
            }}
          />
          <span className="text-white text-xs font-medium">
            {isRefreshing ? 'Aggiornamento...' : 'Rilascia per aggiornare'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${isPulling ? pullDistance * 0.5 : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}