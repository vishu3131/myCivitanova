"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabItemProps {
  icon: string;
  label: string;
  route: string;
  isActive: boolean;
  badge?: string | number;
  isSpecial?: boolean;
  onClick?: () => void;
}

function TabItem({ icon, label, route, isActive, badge, isSpecial, onClick }: TabItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Se c'è una funzione onClick personalizzata, previeni la navigazione predefinita
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link 
      href={route} 
      className="flex-1 flex flex-col items-center justify-center relative"
      onClick={handleClick}
    >
      <div 
        className={`
          w-10 h-10 flex items-center justify-center rounded-full mb-1
          transition-all duration-200 ease-in-out
          ${isActive ? 'scale-110' : 'scale-100'}
          ${isSpecial 
            ? 'text-[#E76F51]' 
            : isActive 
              ? 'text-[#0077BE]' 
              : 'text-gray-500'
          }
        `}
      >
        <span className="text-2xl">{icon}</span>
        
        {badge && (
          <div className={`
            absolute -top-1 -right-1 flex items-center justify-center
            ${typeof badge === 'number' 
              ? 'min-w-5 h-5 rounded-full text-xs bg-[#F4A261] text-white font-medium' 
              : 'px-1.5 py-0.5 rounded-full text-[10px] bg-[#F4A261] text-white font-medium'
            }
          `}>
            {badge}
          </div>
        )}
      </div>
      <span className={`
        text-xs font-medium
        ${isSpecial 
          ? 'text-[#E76F51]' 
          : isActive 
            ? 'text-[#0077BE]' 
            : 'text-gray-500'
        }
      `}>
        {label}
      </span>
    </Link>
  );
}

export function BottomTabBar() {
  const pathname = usePathname();
  
  const showFeatureComingSoon = () => {
    alert("Questa funzionalità sarà disponibile prossimamente!");
    // In futuro qui si potrebbe implementare un modal più sofisticato
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-lg rounded-t-xl z-50 flex items-center justify-around px-2 pb-2 pt-1">
      <TabItem 
        icon="🏠" 
        label="Home" 
        route="/" 
        isActive={pathname === '/'} 
      />
      <TabItem 
        icon="🗺️" 
        label="Esplora" 
        route="/explore" 
        isActive={pathname === '/explore'} 
        badge="Soon"
        onClick={showFeatureComingSoon}
      />
      <TabItem 
        icon="📅" 
        label="Eventi" 
        route="/events" 
        isActive={pathname === '/events'} 
        badge={3}
        onClick={showFeatureComingSoon}
      />
      <TabItem 
        icon="📢" 
        label="Segnala" 
        route="/reports" 
        isActive={pathname === '/reports'} 
        isSpecial={true}
        onClick={showFeatureComingSoon}
      />
      <TabItem 
        icon="👤" 
        label="Profilo" 
        route="/profile" 
        isActive={pathname === '/profile'} 
        onClick={showFeatureComingSoon}
      />
    </div>
  );
}