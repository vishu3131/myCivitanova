'use client';

import React, { useState, useCallback } from 'react';

interface PureNeonButtonProps {
  text?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  fontSize?: string;
  animationColor?: string;
  borderRight?: number;
  pulseDuration?: number;
}

export default function PureNeonButton({ 
  text = "MyCivitanova.it", 
  onClick, 
  className = "",
  disabled = false,
  fontSize = "2em",
  animationColor = "#37FF8B",
  borderRight = 6,
  pulseDuration = 1.5
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
    if (disabled) return;
    if (onClick) onClick();
  }, [disabled, onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsActive(true);
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
      if (onClick) onClick();
      setTimeout(() => setIsActive(false), 150);
    }
  }, [disabled, onClick]);

  return (
    <>
      {/* CSS Styles */}
      <style jsx>{`
        .pure-neon-button {
          --border-right: 6px;
          --text-stroke-color: rgba(255, 255, 255, 0.6);
          --animation-color: #37FF8B;
          --pulse-duration: 1.5s;
          --fs-size: ${fontSize};
          
          margin: 0;
          height: auto;
          width: 100%; /* Ensure button takes full width */
          display: block; /* Ensure it takes full width */
          background: transparent;
          padding: 4px 0 0 0; /* Increased padding-top */
          border: none;
          cursor: pointer;
          letter-spacing: normal;
          text-decoration: none;
          font-size: var(--fs-size);
          text-align: center;
          font-family: "Arial", sans-serif;
          position: relative;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px var(--text-stroke-color);
          transition: all 0.3s ease-in-out;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          touch-action: manipulation;
          will-change: transform;
          outline: none;
        }

        .pure-neon-button:focus-visible {
          outline: 2px solid var(--animation-color);
          outline-offset: 4px;
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--animation-color), transparent 70%);
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
          width: 100%; /* Always full width */
          inset: 0;
          border-right: var(--border-right) solid var(--animation-color);
          overflow: hidden;
          clip-path: inset(0% 50% 0% 50%); /* Start fully clipped in the center */
          transition: clip-path 0.5s, border-right 0.5s, filter 0.3s; /* Animate clip-path, border and glow */
          will-change: clip-path, filter;
          -webkit-text-stroke: 1px var(--animation-color);
          text-align: center; /* Ensure text in ::after is centered */
        }

        .pure-neon-button.active {
          animation: pulse-glow var(--pulse-duration) infinite alternate;
          transform: scale(1.05);
        }

        .pure-neon-button.active::after {
          width: 100%; /* Keep full width */
          clip-path: inset(0% 0% 0% 0%); /* Reveal fully */
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

        /* Riduzione animazioni per accessibilità */
        @media (prefers-reduced-motion: reduce) {
          .pure-neon-button {
            transition: none;
          }
          .pure-neon-button.active {
            animation: none;
            transform: none;
          }
          .pure-neon-button::after {
            transition: none;
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
        type="button"
        className={`pure-neon-button ${isActive ? 'active' : ''} ${className}`}
        data-text={text}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        disabled={disabled}
        aria-label={text}
        aria-disabled={disabled}
        role="button"
        style={{
          ['--animation-color' as any]: animationColor,
          ['--fs-size' as any]: fontSize,
          ['--border-right' as any]: `${borderRight}px`,
          ['--pulse-duration' as any]: `${pulseDuration}s`
        }}
      >
        <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>{text}</span>
      </button>
    </>
  );
}
// Test comment