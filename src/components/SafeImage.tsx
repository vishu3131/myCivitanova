import React, { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt = 'Image',
  width, 
  height, 
  className = '',
  fallbackSrc = '/images/placeholder.jpg'
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    setImgSrc(fallbackSrc);
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ 
          width: width ? `${width}px` : '100%', 
          height: height ? `${height}px` : '100%',
          minHeight: '50px'
        }}
      >
        <span className="text-gray-500 text-sm">Image</span>
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      unoptimized={imgSrc.startsWith('data:')}
    />
  );
};