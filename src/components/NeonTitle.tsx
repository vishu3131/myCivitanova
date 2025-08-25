'use client';

import React, { useState, useCallback, useEffect } from 'react';

interface NeonTitleProps {
  text?: string;
  onClick?: () => void;
  className?: string;
  fontSize?: string;
  onAnimationComplete?: () => void;
}

export default function NeonTitle({ 
  text = "MyCivitanova", 
  onClick, 
  className = "",
  fontSize = "clamp(1.5rem, 4vw, 2.5rem)",
  onAnimationComplete
}: NeonTitleProps) {
  const [isActive, setIsActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showIntro, setShowIntro] = useState(false);

  // Gestisce l'animazione iniziale e il callback
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 3000); // 3 secondi per l'animazione completa

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  // Gestisce la ricarica della pagina con intro
  const reloadWithIntro = useCallback(() => {
    try {
      // Always remove the intro flag to force it to play
      localStorage.removeItem('introUnlockedV1');
      // Dispatch custom event to trigger intro immediately
      window.dispatchEvent(new CustomEvent('triggerIntro'));
      // Small delay to ensure the event is processed, then reload
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Errore durante la ricarica con intro:', error);
      window.location.reload();
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsActive(true);
    
    // Vibrazione tattile per mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    // Mantieni l'effetto attivo per un po' su mobile
    setTimeout(() => setIsActive(false), 400);
    
    if (onClick) {
      setTimeout(() => onClick(), 100);
    }
  }, [onClick]);

  const handleMouseEnter = useCallback(() => {
    setIsActive(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsActive(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    // Ricarica la pagina con l'intro
    reloadWithIntro();
  }, [onClick, reloadWithIntro]);

  return (
    <>
      {/* CSS Styles */}
      <style jsx>{`
        .neon-title {
          --border-right: 4px;
          --text-stroke-color: rgba(255, 255, 255, 0.6);
          --animation-color: #37FF8B;
          --fs-size: ${fontSize};
          
          margin: 0;
          padding: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          letter-spacing: 2px;
          text-decoration: none;
          font-size: var(--fs-size);
          font-family: "Arial", sans-serif;
          font-weight: bold;
          position: relative;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px var(--text-stroke-color);
          transition: all 0.3s ease-in-out;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          touch-action: manipulation;
          display: inline-block;
        }

        .neon-title.animating {
          animation: neon-startup 3s ease-out;
        }

        .neon-title::after {
          position: absolute;
          box-sizing: border-box;
          content: attr(data-text);
          color: var(--animation-color);
          width: 0%;
          inset: 0;
          border-right: var(--border-right) solid var(--animation-color);
          overflow: hidden;
          transition: 0.5s;
          -webkit-text-stroke: 1px var(--animation-color);
        }

        .neon-title.active {
          animation: pulse-glow 1.5s infinite alternate;
          transform: scale(1.02);
        }

        .neon-title.active::after {
          width: 100%;
          filter: drop-shadow(0 0 15px var(--animation-color));
        }

        @keyframes neon-startup {
          0% {
            opacity: 0;
            transform: scale(0.8);
            -webkit-text-stroke: 1px transparent;
          }
          20% {
            opacity: 0.3;
            transform: scale(0.9);
            -webkit-text-stroke: 1px rgba(55, 255, 139, 0.3);
          }
          40% {
            opacity: 0.6;
            transform: scale(0.95);
            -webkit-text-stroke: 1px rgba(55, 255, 139, 0.6);
          }
          60% {
            opacity: 0.8;
            transform: scale(1.02);
            -webkit-text-stroke: 1px rgba(55, 255, 139, 0.8);
            box-shadow: 0 0 10px var(--animation-color);
          }
          80% {
            opacity: 0.9;
            transform: scale(1.05);
            -webkit-text-stroke: 1px var(--animation-color);
            box-shadow: 0 0 20px var(--animation-color);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            -webkit-text-stroke: 1px var(--text-stroke-color);
            box-shadow: none;
          }
        }

        @keyframes pulse-glow {
          from {
            box-shadow: 0 0 3px #fff, 0 0 6px #fff, 0 0 10px var(--animation-color), 0 0 15px var(--animation-color);
          }
          to {
            box-shadow: 0 0 6px #fff, 0 0 12px var(--animation-color), 0 0 20px var(--animation-color), 0 0 25px var(--animation-color);
          }
        }

        /* Ottimizzazioni responsive */
        @media (max-width: 768px) {
          .neon-title {
            letter-spacing: 1.5px;
            --border-right: 3px;
          }
        }

        @media (max-width: 480px) {
          .neon-title {
            letter-spacing: 1px;
            --border-right: 2px;
          }
        }
      `}</style>

      <span
        className={`neon-title ${isActive ? 'active' : ''} ${isAnimating ? 'animating' : ''} ${className}`}
        data-text={text}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={`${text} - Clicca per rivedere l'intro`}
        title="Clicca per rivedere l'intro"
      >
        {text}
      </span>
    </>
  );
}