'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

interface NeonAnimationWidgetProps {
  title?: string;
  description?: string;
  className?: string;
  onButtonClick?: () => void;
}

export default function NeonAnimationWidget({ 
  title = "Animazione Neon",
  description = "Tocca per attivare l'effetto neon",
  className = "",
  onButtonClick
}: NeonAnimationWidgetProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsPressed(true);
    setIsHovered(true);
    setShowParticles(true);
    
    // Vibrazione tattile su dispositivi supportati
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsPressed(false);
    
    // Mantieni l'effetto hover per feedback visivo
    setTimeout(() => {
      setIsHovered(false);
      setShowParticles(false);
    }, 600);
    
    if (onButtonClick) {
      setTimeout(() => onButtonClick(), 100);
    }
  }, [onButtonClick]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setShowParticles(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowParticles(false);
    setIsPressed(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (onButtonClick) onButtonClick();
  }, [onButtonClick]);

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${className}`}>
      {/* Header del Widget */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Container dell'animazione Neon */}
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-200 transition-all duration-300 flex items-center justify-center">
          
          {/* Pulsante Neon */}
          <motion.button
            className="relative bg-transparent border-none cursor-pointer font-sans font-bold text-2xl md:text-3xl uppercase text-transparent transition-all duration-300 ease-in-out select-none touch-manipulation px-6 py-3"
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
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: isPressed ? 0.95 : isHovered ? 1.05 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 17
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
                duration: 0.5,
                ease: "easeInOut"
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center text-2xl md:text-3xl font-sans font-bold uppercase"
                style={{
                  color: '#37FF8B',
                  WebkitTextStroke: '1px #37FF8B',
                  borderRight: isHovered ? '4px solid #37FF8B' : 'none',
                  filter: isHovered ? 'drop-shadow(0 0 15px #37FF8B) drop-shadow(0 0 25px #37FF8B)' : 'none',
                  letterSpacing: '0.1em',
                }}
              >
                MyCivitanova.it
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

            {/* Particelle di energia */}
            {showParticles && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-green-400 rounded-full shadow-lg"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                      boxShadow: '0 0 4px #37FF8B',
                    }}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [1, 1, 0],
                      x: [0, (Math.random() - 0.5) * 80],
                      y: [0, (Math.random() - 0.5) * 80],
                    }}
                    transition={{
                      duration: 1.2,
                      delay: i * 0.1,
                      ease: "easeOut",
                      repeat: isHovered ? Infinity : 0,
                      repeatDelay: 2
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
                  scale: [1, 1.3, 1.6], 
                  opacity: [0.8, 0.4, 0] 
                }}
                transition={{ 
                  duration: 0.8,
                  ease: "easeOut"
                }}
              />
            )}
          </motion.button>

          {/* Overlay con informazioni */}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-xs text-green-400">
              {isHovered ? 'Effetto Attivo!' : 'Hover/Touch per animare'}
            </span>
          </div>
        </div>
      </div>

      {/* Controlli e informazioni */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <motion.div 
            className="w-3 h-3 rounded-full bg-green-500"
            animate={{
              scale: isHovered ? [1, 1.2, 1] : 1,
              opacity: isHovered ? [1, 0.7, 1] : 1
            }}
            transition={{
              duration: 0.8,
              repeat: isHovered ? Infinity : 0
            }}
          />
          <span className="text-sm text-gray-600">
            {isHovered ? 'Animazione attiva' : 'Pronto per l\'interazione'}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-purple-500">
          <Zap className="w-4 h-4" />
          <span className="text-xs font-medium">NEON</span>
        </div>
      </div>

      {/* Indicatore di stato */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
          <motion.div 
            className="w-2 h-2 rounded-full bg-green-500"
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
            Effetto Neon Interattivo Attivo
          </span>
        </div>
      </div>

      {/* Sfondo animato per maggiore immersione */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          exit={{ opacity: 0 }}
          style={{
            background: 'radial-gradient(circle at center, #37FF8B, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}