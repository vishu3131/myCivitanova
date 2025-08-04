"use client";

import React, { useState } from 'react';
import { Calendar, Car, Waves, AlertTriangle } from 'lucide-react';

interface IntegratedWidgetBarProps {
  onEventClick?: () => void;
  onParkingClick?: () => void;
  onBeachClick?: () => void;
  onReportClick?: () => void;
}

export const IntegratedWidgetBar: React.FC<IntegratedWidgetBarProps> = ({
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
      bgClass: 'widget-btn-eventi',
      onClick: onEventClick
    },
    {
      id: 'parcheggi',
      label: 'Parcheggi',
      icon: Car,
      bgClass: 'widget-btn-parcheggi',
      onClick: onParkingClick
    },
    {
      id: 'spiagge',
      label: 'Spiagge',
      icon: Waves,
      bgClass: 'widget-btn-spiagge',
      onClick: onBeachClick
    },
    {
      id: 'segnala',
      label: 'Segnala',
      icon: AlertTriangle,
      bgClass: 'widget-btn-segnala',
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
    <div className="min-h-[100px] rounded-[16px] p-2 flex items-center justify-start pl-1 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group bg-gradient-to-r from-gray-800 to-gray-900">
      {widgets.map((widget) => {
        const IconComponent = widget.icon;
        const isActive = activeWidget === widget.id;
        
        return (
          <div key={widget.id} className="flex flex-col items-center gap-2 px-1">
            {/* Circular Button */}
            <button
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-200 transform
                ${isActive ? 'scale-90' : 'hover:scale-110'}
                ${widget.bgClass}
                shadow-lg hover:shadow-xl
                border border-white/20
              `}
              onClick={() => handleWidgetClick(widget)}
              aria-label={widget.label}
            >
              <IconComponent 
                size={18} 
                className="text-white drop-shadow-sm"
              />
            </button>
            
            {/* Label */}
             <span className="text-white/80 text-[10px] font-medium group-hover:text-white transition-colors duration-200 leading-tight">
                {widget.label}
              </span>
          </div>
        );
      })}
    </div>
  );
};