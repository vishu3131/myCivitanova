import Image from 'next/image';
import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc: string;
  width: number;
  height: number;
  className?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc,
  width,
  height,
  className,
}) => {
  const [isError, setIsError] = useState(false);

  return (
    <Image
      src={isError ? fallbackSrc : src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setIsError(true)}
    />
  );
};

export default ImageWithFallback;