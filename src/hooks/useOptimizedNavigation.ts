"use client";

import { useRouter } from 'next/navigation';
import { useLoading } from '@/context/LoadingContext';
import { useCallback } from 'react';

export function useOptimizedNavigation() {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();

  const navigateTo = useCallback(
    (path: string, message: string = 'Caricamento pagina...') => {
      // Avvia immediatamente il loading
      startLoading(message);
      
      // Naviga alla nuova pagina
      router.push(path);
      
      // Il loading verrà fermato dal PageTransition component
      setTimeout(() => {
        stopLoading();
      }, 1000); // Timeout di sicurezza
    },
    [router, startLoading, stopLoading]
  );

  const navigateWithReplace = useCallback(
    (path: string, message: string = 'Caricamento pagina...') => {
      startLoading(message);
      router.replace(path);
      setTimeout(() => {
        stopLoading();
      }, 1000);
    },
    [router, startLoading, stopLoading]
  );

  const goBack = useCallback(
    (message: string = 'Tornando indietro...') => {
      startLoading(message);
      router.back();
      setTimeout(() => {
        stopLoading();
      }, 800);
    },
    [router, startLoading, stopLoading]
  );

  const refresh = useCallback(
    (message: string = 'Aggiornamento pagina...') => {
      startLoading(message);
      router.refresh();
      setTimeout(() => {
        stopLoading();
      }, 1200);
    },
    [router, startLoading, stopLoading]
  );

  return {
    navigateTo,
    navigateWithReplace,
    goBack,
    refresh,
    startLoading,
    stopLoading,
  };
}