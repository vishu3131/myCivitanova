"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarIconProps {
  emoji: string;
  isActive?: boolean;
  label?: string;
  onClick?: () => void;
}

function SidebarIcon({ emoji, isActive = false, label, onClick }: SidebarIconProps) {
  return (
    <div className="relative group">
      <div 
        className={`
          w-10 h-10 md:w-12 md:h-12 flex items-center justify-center 
          rounded-xl md:rounded-2xl transition-all duration-300 ease-in-out text-xl md:text-2xl
          ${isActive 
            ? 'bg-accent text-black' 
            : 'text-gray-300 hover:text-white hover:bg-dark-200'
          }
          ${onClick ? 'cursor-pointer' : ''}
        `}
        onClick={onClick}
      >
        {emoji}
      </div>
      
      {label && (
        <div className="absolute left-full ml-2 md:ml-4 px-2 py-1 bg-dark-200 rounded-md text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {label}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Funzione per gestire il toggle della sidebar
  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    // Emetti un evento personalizzato per notificare il cambio di stato
    const event = new CustomEvent('sidebarToggle', { 
      detail: { isOpen: newState } 
    });
    window.dispatchEvent(event);
  };
  
  // Funzione per la navigazione
  const handleNavigation = (path: string) => {
    router.push(path);
  };
  
  // Gestione della chiusura/apertura con tasto Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Sidebar principale */}
      <div 
        className={`
          fixed left-0 top-0 h-screen flex flex-col 
          bg-[#0E0E0E]/95 backdrop-blur-sm text-white z-20 py-4 md:py-6
          rounded-tr-3xl rounded-br-3xl shadow-[4px_0_12px_rgba(0,0,0,0.2)]
          transition-all duration-500 ease-in-out
          ${isOpen ? 'w-16 md:w-20 lg:w-24 translate-x-0' : 'w-16 md:w-20 -translate-x-full'}
        `}
      >
        {/* Back Button */}
        <div className="px-3 md:px-4 mb-6 md:mb-10">
          <div 
            className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={toggleSidebar}
          >
            <span className="text-black text-xl md:text-2xl">←</span>
          </div>
        </div>
        
        {/* Main Navigation Icons */}
        <div className="flex-1 flex flex-col items-center gap-4 md:gap-6 px-3 md:px-4">
          <SidebarIcon 
            emoji="🏠" 
            label="Home" 
            isActive={pathname === '/'}
            onClick={() => handleNavigation('/')}
          />
          <SidebarIcon 
            emoji="👥" 
            label="Community" 
            isActive={pathname === '/community'}
            onClick={() => handleNavigation('/community')}
          />
          <SidebarIcon 
            emoji="🧭" 
            label="Esplora" 
            isActive={pathname === '/esplora'}
            onClick={() => handleNavigation('/esplora')}
          />
          <SidebarIcon 
            emoji="❤️" 
            label="Preferiti" 
            isActive={pathname === '/preferiti'}
            onClick={() => handleNavigation('/preferiti')}
          />
          <SidebarIcon 
            emoji="📅" 
            label="Eventi" 
            isActive={pathname === '/eventi'}
            onClick={() => handleNavigation('/eventi')}
          />
          <SidebarIcon 
            emoji="🗺️" 
            label="Mappa" 
            isActive={pathname === '/mappa'}
            onClick={() => handleNavigation('/mappa')}
          />
          <SidebarIcon 
            emoji="🔔" 
            label="Notifiche" 
            isActive={pathname === '/notifiche'}
            onClick={() => handleNavigation('/notifiche')}
          />
          <SidebarIcon 
            emoji="ℹ️" 
            label="Informazioni" 
            isActive={pathname === '/informazioni'}
            onClick={() => handleNavigation('/informazioni')}
          />
        </div>
        
        {/* Bottom Icons */}
        <div className="flex flex-col items-center gap-4 md:gap-6 px-3 md:px-4 mt-auto">
          <SidebarIcon 
            emoji="👤" 
            label="Profilo" 
            isActive={pathname === '/profilo'}
            onClick={() => handleNavigation('/profilo')}
          />
          <SidebarIcon 
            emoji="⚙️" 
            label="Impostazioni" 
            isActive={pathname === '/impostazioni'}
            onClick={() => handleNavigation('/impostazioni')}
          />
        </div>
      </div>
      
      {/* Pulsante fluttuante per riaprire la sidebar quando è chiusa */}
      <div 
        className={`
          fixed left-0 top-20 md:top-1/2 md:-translate-y-1/2 z-10
          transition-all duration-500 ease-in-out
          ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}
        `}
      >
        <div 
          className="w-8 md:w-10 h-14 md:h-20 bg-accent/90 backdrop-blur-sm rounded-r-xl flex items-center justify-center cursor-pointer hover:bg-accent transition-colors shadow-lg animate-pulse-slow"
          onClick={toggleSidebar}
        >
          <span className="text-black text-xl md:text-2xl">→</span>
        </div>
      </div>
    </>
  );
};