"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './ModernServicesWidget.css';

const ModernServicesWidget = () => {
  const router = useRouter();
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const createRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 1000);
  };

  const handleMainButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    createRipple(event);
    // Naviga direttamente alla pagina servizi
    router.push('/servizi');
  };

  return (
    <div className="services-widget-container">
      {/* Main Widget Button */}
      <div 
        className="services-main-button"
        onClick={handleMainButtonClick}
      >
        <div className="glass-effect">
          <div className="button-content">
            <div className="services-icon">
              <div className="icon-inner">
                ⚡
              </div>
            </div>
            
            {/* Ripple Effects */}
            {ripples.map(ripple => (
              <div
                key={ripple.id}
                className="ripple-effect"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                }}
              />
            ))}
            
            {/* Continuous ripple effect */}
            <div className="continuous-ripple"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernServicesWidget;