'use client';

import React, { useState, useCallback } from 'react';

interface NeonTitleProps {
  text?: string;
  onClick?: () => void;
  className?: string;
  fontSize?: string;
}

export default function NeonTitle({ 
  text = "MyCivitanova", 
  onClick, 
  className = "",
  fontSize = "clamp(1.5rem, 4vw, 2.5rem)"
}: NeonTitleProps) {
  const [isActive, setIsActive] = useState(false);

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
  }, [onClick]);

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
        className={`neon-title ${isActive ? 'active' : ''} ${className}`}
        data-text={text}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={text}
      >
        {text}
      </span>
    </>
  );
}