"use client";

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface NeonButtonSimpleProps {
  text?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function NeonButtonSimple({ 
  text = "MyCivitanova.it", 
  onClick, 
  className = "",
  disabled = false,
  size = 'md'
}: NeonButtonSimpleProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsPressed(true);
    setIsHovered(true);
    
    // Vibrazione tattile su dispositivi supportati
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [disabled]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsPressed(false);
    
    // Mantieni l'effetto hover per feedback visivo
    setTimeout(() => setIsHovered(false), 400);
    
    if (onClick) {
      setTimeout(() => onClick(), 100);
    }
  }, [disabled, onClick]);

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    setIsHovered(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    setIsHovered(false);
    setIsPressed(false);
  }, [disabled]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (onClick) onClick();
  }, [disabled, onClick]);

  // Dimensioni responsive basate sulla prop size
  const sizeClasses = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl md:text-3xl',
    lg: 'text-2xl sm:text-3xl md:text-4xl',
    xl: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
  };

  const paddingClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
    xl: 'px-10 py-5'
  };

  return (
    <motion.button
      className={`
        relative
        bg-transparent
        border-none
        cursor-pointer
        font-sans
        font-bold
        uppercase
        text-transparent
        transition-all
        duration-300
        ease-in-out
        select-none
        touch-manipulation
        ${sizeClasses[size]}
        ${paddingClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        WebkitTextStroke: '1px rgba(255, 255, 255, 0.6)',
        WebkitTapHighlightColor: 'transparent',
        letterSpacing: '0.1em',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isPressed ? 0.95 : isHovered ? 1.05 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
      aria-label={text}
      role="button"
    >
      {/* Testo base con contorno */}
      <span className="relative z-10 block">
        {text}
      </span>

      {/* Effetto neon overlay */}
      <motion.div
        className="absolute inset-0 overflow-hidden flex items-center justify-center"
        initial={{ width: "0%" }}
        animate={{
          width: isHovered ? "100%" : "0%",
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut"
        }}
      >
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            ${sizeClasses[size]}
            font-sans font-bold uppercase
          `}
          style={{
            color: '#37FF8B',
            WebkitTextStroke: '1px #37FF8B',
            borderRight: isHovered ? '4px solid #37FF8B' : 'none',
            filter: isHovered ? 'drop-shadow(0 0 15px #37FF8B) drop-shadow(0 0 25px #37FF8B)' : 'none',
            letterSpacing: '0.1em',
          }}
        >
          {text}
        </div>
      </motion.div>

      {/* Effetto bagliore pulsante */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        animate={{
          boxShadow: isHovered ? [
            '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #37FF8B, 0 0 20px #37FF8B',
            '0 0 10px #fff, 0 0 20px #37FF8B, 0 0 30px #37FF8B, 0 0 40px #37FF8B',
            '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #37FF8B, 0 0 20px #37FF8B'
          ] : '0 0 0px transparent'
        }}
        transition={{
          duration: 1.5,
          repeat: isHovered ? Infinity : 0,
          repeatType: "reverse"
        }}
      />

      {/* Particelle di energia per feedback tattile */}
      {isPressed && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full shadow-lg"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`,
                boxShadow: '0 0 4px #37FF8B',
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
                x: [0, (Math.random() - 0.5) * 60],
                y: [0, (Math.random() - 0.5) * 60],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.08,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Onde di energia al touch */}
      {isPressed && (
        <motion.div
          className="absolute inset-0 border-2 border-green-400 rounded-lg pointer-events-none"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ 
            scale: [1, 1.2, 1.4], 
            opacity: [0.8, 0.4, 0] 
          }}
          transition={{ 
            duration: 0.6,
            ease: "easeOut"
          }}
        />
      )}
    </motion.button>
  );
}

export default NeonButtonSimple;