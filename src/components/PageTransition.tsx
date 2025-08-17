"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/context/LoadingContext';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { stopLoading } = useLoading();

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      // Ferma il loading globale quando la transizione è completata
      stopLoading();
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, stopLoading]);

  return (
    <div className="relative">
      {/* Page Content */}
      <div
        className={`transition-all duration-300 ${
          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {children}
      </div>
    </div>
  );
}