'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

interface MobileNeonWidgetProps {
  title?: string;
  description?: string;
  className?: string;
  onButtonClick?: () => void;
}

export default function MobileNeonWidget({ 
  title = "MyCivitanova Neon",
  description = "Tocca per l'effetto neon",
  className = "",
  onButtonClick
}: MobileNeonWidgetProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsPressed(true);
    setIsHovered(true);
    setShowParticles(true);
    
    // Vibrazione tattile ottimizzata per mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]); // Pattern di vibrazione
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsPressed(false);
    
    // Mantieni l'effetto più a lungo su mobile per feedback visivo
    setTimeout(() => {
      setIsHovered(false);
      setShowParticles(false);
    }, 800);
    
    if (onButtonClick) {
      setTimeout(() => onButtonClick(), 150);
    }
  }, [onButtonClick]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsHovered(true);
    setShowParticles(true);
    
    setTimeout(() => {
      setIsHovered(false);
      setShowParticles(false);
    }, 600);
    
    if (onButtonClick) onButtonClick();
  }, [onButtonClick]);

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 ${className}`}>
      {/* Header compatto per mobile */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-full">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Container dell'animazione Neon - Ottimizzato per mobile */}
      <div className="relative">
        <div className="w-full h-32 bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-200 transition-all duration-300 flex items-center justify-center">
          
          {/* Pulsante Neon Mobile */}
          <motion.button
            className="relative bg-transparent border-none cursor-pointer font-sans font-bold text-lg uppercase text-transparent transition-all duration-300 ease-in-out select-none touch-manipulation px-4 py-2"
            style={{
              WebkitTextStroke: '1px rgba(255, 255, 255, 0.6)',
              WebkitTapHighlightColor: 'transparent',
              letterSpacing: '0.05em',
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: isPressed ? 0.9 : isHovered ? 1.1 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 20
            }}
            aria-label="MyCivitanova.it"
            role="button"
          >
            {/* Testo base con contorno */}
            <span className="relative z-10 block">
              MyCivitanova.it
            </span>

            {/* Effetto neon overlay */}
            <motion.div
              className="absolute inset-0 overflow-hidden flex items-center justify-center"
              initial={{ width: "0%" }}
              animate={{
                width: isHovered ? "100%" : "0%",
              }}
              transition={{
                duration: 0.4,
                ease: "easeInOut"
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center text-lg font-sans font-bold uppercase"
                style={{
                  color: '#37FF8B',
                  WebkitTextStroke: '1px #37FF8B',
                  borderRight: isHovered ? '3px solid #37FF8B' : 'none',
                  filter: isHovered ? 'drop-shadow(0 0 10px #37FF8B) drop-shadow(0 0 20px #37FF8B)' : 'none',
                  letterSpacing: '0.05em',
                }}
              >
                MyCivitanova.it
              </div>
            </motion.div>

            {/* Effetto bagliore mobile */}
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              animate={{
                boxShadow: isHovered ? [
                  '0 0 3px #fff, 0 0 6px #fff, 0 0 10px #37FF8B, 0 0 15px #37FF8B',
                  '0 0 6px #fff, 0 0 12px #37FF8B, 0 0 20px #37FF8B, 0 0 25px #37FF8B',
                  '0 0 3px #fff, 0 0 6px #fff, 0 0 10px #37FF8B, 0 0 15px #37FF8B'
                ] : '0 0 0px transparent'
              }}
              transition={{
                duration: 1.2,
                repeat: isHovered ? Infinity : 0,
                repeatType: "reverse"
              }}
            />

            {/* Particelle di energia ottimizzate per mobile */}
            {showParticles && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-0.5 h-0.5 bg-green-400 rounded-full shadow-sm"
                    style={{
                      left: `${25 + Math.random() * 50}%`,
                      top: `${25 + Math.random() * 50}%`,
                      boxShadow: '0 0 2px #37FF8B',
                    }}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{
                      scale: [0, 2, 0],
                      opacity: [1, 1, 0],
                      x: [0, (Math.random() - 0.5) * 40],
                      y: [0, (Math.random() - 0.5) * 40],
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.08,
                      ease: "easeOut",
                      repeat: isHovered ? Infinity : 0,
                      repeatDelay: 1.5
                    }}
                  />
                ))}
              </div>
            )}

            {/* Onde di energia al touch - Mobile */}
            {isPressed && (
              <>
                <motion.div
                  className="absolute inset-0 border border-green-400 rounded-lg pointer-events-none"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ 
                    scale: [1, 1.4, 1.8], 
                    opacity: [0.8, 0.4, 0] 
                  }}
                  transition={{ 
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 border border-green-300 rounded-lg pointer-events-none"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ 
                    scale: [1, 1.6, 2.2], 
                    opacity: [0.6, 0.3, 0] 
                  }}
                  transition={{ 
                    duration: 0.8,
                    ease: "easeOut",
                    delay: 0.1
                  }}
                />
              </>
            )}
          </motion.button>

          {/* Overlay con informazioni - Mobile */}
          <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
            <span className="text-xs text-green-400">
              {isHovered ? 'Attivo!' : 'Tocca'}
            </span>
          </div>
        </div>
      </div>

      {/* Controlli compatti per mobile */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <motion.div 
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{
              scale: isHovered ? [1, 1.3, 1] : 1,
              opacity: isHovered ? [1, 0.6, 1] : 1
            }}
            transition={{
              duration: 0.6,
              repeat: isHovered ? Infinity : 0
            }}
          />
          <span className="text-xs text-gray-600">
            {isHovered ? 'Attivo' : 'Pronto'}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-purple-500">
          <Zap className="w-3 h-3" />
          <span className="text-xs font-medium">NEON</span>
        </div>
      </div>

      {/* Indicatore di stato compatto */}
      <div className="mt-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-full">
          <motion.div 
            className="w-1.5 h-1.5 rounded-full bg-green-500"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          />
          <span className="text-xs text-gray-600">
            Effetto Neon Mobile
          </span>
        </div>
      </div>

      {/* Sfondo animato per feedback tattile */}
      {isPressed && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          exit={{ opacity: 0 }}
          style={{
            background: 'radial-gradient(circle at center, #37FF8B, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}