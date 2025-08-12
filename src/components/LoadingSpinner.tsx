"use client";

import React from 'react';
import '../styles/loader.css'; // Import the new loader styles

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export function LoadingSpinner({ size = 48, color = '#FF3D00' }: LoadingSpinnerProps) {
  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderBottomColor: color,
  };

  return (
    <div className="flex items-center justify-center">
      <div className="loader" style={spinnerStyle} />
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size={64} />
        <p className="text-white/70 text-sm mt-4">Caricamento...</p>
      </div>
    </div>
  );
}
