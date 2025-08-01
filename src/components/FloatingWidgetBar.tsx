"use client";

import React, { useState } from 'react';
import { Calendar, Car, Waves, AlertTriangle } from 'lucide-react';

interface FloatingWidgetBarProps {
  onEventClick?: () => void;
  onParkingClick?: () => void;
  onBeachClick?: () => void;
  onReportClick?: () => void;
}

export const FloatingWidgetBar: React.FC<FloatingWidgetBarProps> = ({
  onEventClick,
  onParkingClick,
  onBeachClick,
  onReportClick
}) => {
  const [activeWidget, setActiveWidget] = useState<string | null>(null);

  const widgets = [
    {
      id: 'eventi',
      label: 'Eventi',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: onEventClick
    },
    {
      id: 'parcheggi',
      label: 'Parcheggi',
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: onParkingClick
    },
    {
      id: 'spiagge',
      label: 'Spiagge',
      icon: Waves,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      onClick: onBeachClick
    },
    {
      id: 'segnala',
      label: 'Segnala',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      onClick: onReportClick
    }
  ];

  const handleWidgetClick = (widget: typeof widgets[0]) => {
    setActiveWidget(widget.id);
    widget.onClick?.();
    
    // Reset active state after animation
    setTimeout(() => setActiveWidget(null), 200);
  };

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      {/* Widget Bar Container */}
      <div className="floating-widget-container">
        {widgets.map((widget) => {
          const IconComponent = widget.icon;
          const isActive = activeWidget === widget.id;
          
          return (
            <div key={widget.id} className="flex flex-col items-center text-center gap-2 w-[72px]">
              {/* Circular Button */}
              <button
                className={`floating-widget-button ${isActive ? 'floating-widget-active' : ''}`}
                onClick={() => handleWidgetClick(widget)}
                aria-label={widget.label}
              >
                <div className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-150 ${widget.bgColor}`}>
                  <IconComponent
                    size={24}
                    className={`transition-all duration-150 ${widget.color}`}
                    style={{
                      filter: isActive
                        ? 'drop-shadow(inset 0 1px 2px rgba(0, 0, 0, 0.2))'
                        : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                      transform: isActive ? 'translate(1px, 1px)' : 'translate(0, 0)'
                    }}
                  />
                </div>
              </button>
              
              {/* Label */}
              <span className="floating-widget-label">
                {widget.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};