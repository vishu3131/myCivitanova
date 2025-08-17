"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useOptimizedNavigation } from '@/hooks/useOptimizedNavigation';

interface OptimizedLinkProps {
  href: string;
  children: React.ReactNode;
  loadingMessage?: string;
  className?: string;
  replace?: boolean;
  prefetch?: boolean;
  preventMultipleClicks?: boolean;
  cooldownMs?: number;
}

export function OptimizedLink({
  href,
  children,
  loadingMessage,
  className = '',
  replace = false,
  prefetch = true,
  preventMultipleClicks = true,
  cooldownMs = 800,
  ...props
}: OptimizedLinkProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const { navigateTo, navigateWithReplace } = useOptimizedNavigation();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (isNavigating && preventMultipleClicks) return;

    if (preventMultipleClicks) {
      setIsNavigating(true);
    }

    const message = loadingMessage || `Caricamento ${href}...`;

    try {
      if (replace) {
        navigateWithReplace(href, message);
      } else {
        navigateTo(href, message);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      if (preventMultipleClicks) {
        setTimeout(() => {
          setIsNavigating(false);
        }, cooldownMs);
      }
    }
  };

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={`
        ${className}
        ${isNavigating ? 'opacity-70 pointer-events-none' : ''}
        transition-opacity duration-200
      `}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}