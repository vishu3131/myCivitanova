'use client';

import React, { useState, useCallback } from 'react';

interface PureNeonButtonProps {
  text?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  fontSize?: string;
}

export default function PureNeonButton({ 
  text = "MyCivitanova.it", 
  onClick, 
  className = "",
  disabled = false,
  fontSize = "2em"
}: PureNeonButtonProps) {
  const [isActive, setIsActive] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    setIsActive(true);
    
    // Vibrazione tattile per mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [disabled]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    // Mantieni l'effetto attivo per un po' su mobile per feedback visivo
    setTimeout(() => setIsActive(false), 600);
    
    if (onClick) {
      setTimeout(() => onClick(), 100);
    }
  }, [disabled, onClick]);

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    setIsActive(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    setIsActive(false);
  }, [disabled]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (onClick) onClick();
  }, [disabled, onClick]);

  return (
    <>
      {/* CSS Styles */}
      <style jsx>{`
        .pure-neon-button {
          --border-right: 6px;
          --text-stroke-color: rgba(255, 255, 255, 0.6);
          --animation-color: #37FF8B;
          --fs-size: ${fontSize};
          
          margin: 0;
          height: auto;
          background: transparent;
          padding: 0;
          border: none;
          cursor: pointer;
          letter-spacing: 3px;
          text-decoration: none;
          font-size: var(--fs-size);
          font-family: "Arial", sans-serif;
          position: relative;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px var(--text-stroke-color);
          transition: all 0.3s ease-in-out;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          touch-action: manipulation;
        }

        .pure-neon-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pure-neon-button::after {
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

        .pure-neon-button.active {
          animation: pulse-glow 1.5s infinite alternate;
          transform: scale(1.05);
        }

        .pure-neon-button.active::after {
          width: 100%;
          filter: drop-shadow(0 0 23px var(--animation-color));
        }

        @keyframes pulse-glow {
          from {
            box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px var(--animation-color), 0 0 20px var(--animation-color);
          }
          to {
            box-shadow: 0 0 10px #fff, 0 0 20px var(--animation-color), 0 0 30px var(--animation-color), 0 0 40px var(--animation-color);
          }
        }

        /* Ottimizzazioni responsive per mobile */
        @media (max-width: 768px) {
          .pure-neon-button {
            --fs-size: 1.5em;
            letter-spacing: 2px;
          }
        }

        @media (max-width: 480px) {
          .pure-neon-button {
            --fs-size: 1.2em;
            letter-spacing: 1px;
          }
        }
      `}</style>

      <button
        className={`pure-neon-button ${isActive ? 'active' : ''} ${className}`}
        data-text={text}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        disabled={disabled}
        aria-label={text}
        role="button"
      >
        <span>{text}</span>
      </button>
    </>
  );
}