"use client";

import { useCallback } from 'react';

export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    // Check if the device supports haptic feedback
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      
      try {
        navigator.vibrate(patterns[type]);
      } catch (error) {
        // Silently fail if vibration is not supported or blocked
        console.debug('Haptic feedback not available:', error);
      }
    }
  }, []);

  return { triggerHaptic };
}