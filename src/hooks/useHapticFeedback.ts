"use client";

import { useCallback } from 'react';

export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    // Check if the device supports haptic feedback
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      
      navigator.vibrate(patterns[type]);
    }
    
    // For devices that support the Vibration API with more control
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      const intensities = {
        light: [5],
        medium: [15],
        heavy: [25]
      };
      
      navigator.vibrate(intensities[type]);
    }
  }, []);

  return { triggerHaptic };
}