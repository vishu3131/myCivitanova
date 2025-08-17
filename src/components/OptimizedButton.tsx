"use client";

import React, { useState, useCallback } from 'react';
import { useLoading } from '@/context/LoadingContext';

interface OptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingMessage?: string;
  preventMultipleClicks?: boolean;
  cooldownMs?: number;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function OptimizedButton({
  children,
  onClick,
  loadingMessage = 'Elaborazione...',
  preventMultipleClicks = true,
  cooldownMs = 1000,
  variant = 'primary',
  size = 'md',
  disabled,
  className = '',
  ...props
}: OptimizedButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { startLoading, stopLoading } = useLoading();

  const handleClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isProcessing || disabled) return;

      if (preventMultipleClicks) {
        setIsProcessing(true);
        startLoading(loadingMessage);
      }

      try {
        if (onClick) {
          await onClick(event);
        }
      } catch (error) {
        console.error('Button click error:', error);
      } finally {
        if (preventMultipleClicks) {
          setTimeout(() => {
            setIsProcessing(false);
            stopLoading();
          }, cooldownMs);
        }
      }
    },
    [onClick, isProcessing, disabled, preventMultipleClicks, startLoading, stopLoading, loadingMessage, cooldownMs]
  );

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600';
      case 'accent':
        return 'bg-accent hover:bg-accent/80 text-black border-accent';
      case 'ghost':
        return 'bg-transparent hover:bg-white/10 text-white border-white/20';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const isButtonDisabled = disabled || isProcessing;

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={isButtonDisabled}
      className={`
        relative
        inline-flex
        items-center
        justify-center
        font-medium
        rounded-lg
        border
        transition-all
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-accent/50
        focus:ring-offset-2
        focus:ring-offset-black
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <span className={isProcessing ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
}