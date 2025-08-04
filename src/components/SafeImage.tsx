"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  style?: React.CSSProperties;
}

export function SafeImage({ 
  src, 
  alt, 
  fallbackSrc = '/placeholder-image.jpg',
  className = '',
  fill = false,
  width,
  height,
  priority = false,
  style
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Usa un placeholder colorato se non c'è fallbackSrc
      setImgSrc(fallbackSrc);
    }
  };

  // Se c'è un errore e non abbiamo un fallback, mostra un placeholder colorato
  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={`bg-gradient-to-br from-accent/20 to-dark-300/50 flex items-center justify-center ${className}`}
        style={style}
      >
        <div className="text-white/60 text-center p-4">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Immagine non disponibile</div>
        </div>
      </div>
    );
  }

  const imageProps = {
    src: imgSrc,
    alt,
    className,
    onError: handleError,
    priority,
    style,
    ...(fill ? { fill: true } : { width, height })
  };

  return <Image {...imageProps} />;
}