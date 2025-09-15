"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useLoading } from '@/context/LoadingContext';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const { stopLoading } = useLoading();

  useEffect(() => {
    // Porta la pagina in alto ad ogni cambio rotta per una migliore UX
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.985 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => stopLoading()}
          className="transition-all duration-300 will-change-transform"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}