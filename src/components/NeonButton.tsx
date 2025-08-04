"use client";

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface NeonButtonProps {
  text?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function NeonButton({ 
  text = "MyCivitanova.it", 
  onClick, 
  className = "",
  disabled = false 
}: NeonButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleTouchStart = useCallback(() => {
    if (disabled) return;
    setIsPressed(true);
    setIsHovered(true);
  }, [disabled]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    setIsPressed(false);
    // Mantieni l'effetto hover per un po' dopo il touch
    setTimeout(() => setIsHovered(false), 300);
    if (onClick) onClick();
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

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (onClick) onClick();
  }, [disabled, onClick]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <motion.button
        className={`
          relative
          bg-transparent
          border-none
          cursor-pointer
          font-sans
          text-2xl
          sm:text-3xl
          md:text-4xl
          lg:text-5xl
          letter-spacing-wider
          uppercase
          text-transparent
          transition-all
          duration-300
          ease-in-out
          select-none
          touch-manipulation
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        style={{
          WebkitTextStroke: '1px rgba(255, 255, 255, 0.6)',
          WebkitTapHighlightColor: 'transparent',
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
      >
        {/* Testo base con contorno */}
        <span className="relative z-10">
          {text}
        </span>

        {/* Effetto neon overlay */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
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
            className="absolute inset-0 flex items-center justify-start"
            style={{
              color: '#37FF8B',
              WebkitTextStroke: '1px #37FF8B',
              borderRight: isHovered ? '6px solid #37FF8B' : 'none',
              filter: isHovered ? 'drop-shadow(0 0 23px #37FF8B)' : 'none',
            }}
          >
            <span className="font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl letter-spacing-wider uppercase">
              {text}
            </span>
          </div>
        </motion.div>

        {/* Effetto bagliore pulsante per mobile */}
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

        {/* Particelle di energia per feedback tattile su mobile */}
        {isPressed && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-green-400 rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, (Math.random() - 0.5) * 100],
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </motion.button>

      {/* Stili CSS personalizzati per l'effetto letter-spacing */}
      <style jsx>{`
        .letter-spacing-wider {
          letter-spacing: 0.1em;
        }
        
        @media (max-width: 640px) {
          .letter-spacing-wider {
            letter-spacing: 0.05em;
          }
        }
      `}</style>
    </div>
  );
}

export default NeonButton;