"use client";
import { supabase } from '@/utils/supabaseClient';

import React, { useState } from 'react';
import LoginModal from './LoginModal';
import { useAuthWithRole } from '@/hooks/useAuthWithRole';
import { Home, Search, MapPin, User, Compass, Users } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useRouter, usePathname } from 'next/navigation';

const navItems = [
  { id: 'home', icon: Home, label: 'Home', path: '/' },
  { id: 'community', icon: Users, label: 'Community', path: '/community' },
  { id: 'explore', icon: Compass, label: 'Esplora', isCenter: true, path: '/esplora' },
  { id: 'mappa', icon: MapPin, label: 'Mappa', path: '/mappa' },
  { id: 'profile', icon: User, label: 'Profilo', path: '/profilo' },
];

export function BottomNavbar() {
  const { triggerHaptic } = useHapticFeedback();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthWithRole();
  const [showLogin, setShowLogin] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const handleNavigation = (path: string, isCenter = false) => {
    triggerHaptic(isCenter ? 'medium' : 'light');
    router.push(path);
  };

  const handleProfileClick = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      handleNavigation('/profilo');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogout(false);
    router.push('/');
  };

  return (
    <>
      <div 
        className="navbar-fixed w-full px-6 flex justify-around items-center fixed bottom-0 left-0 right-0"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9998,
          height: '72px',
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 -1px 8px rgba(0,0,0,0.25)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
        }}
      >
        {navItems.map((item) => {
          const IconComponent = item.icon;
          if (item.isCenter) {
            return (
              <div
                key={item.id}
                className="relative flex flex-col items-center cursor-pointer group"
                onClick={() => handleNavigation(item.path, true)}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-active:scale-95 transition-all duration-200"
                  style={{
                    background: '#C6FF00',
                    boxShadow: '0 4px 20px rgba(198, 255, 0, 0.3), 0 0 0 0 rgba(198, 255, 0, 0.4)',
                    zIndex: 50,
                    animation: 'pulse-glow 2s infinite',
                  }}
                >
                  <IconComponent className="w-6 h-6 text-black group-hover:scale-110 transition-transform duration-200" />
                </div>
                {/* Ripple effect on tap */}
                <div className="absolute inset-0 rounded-full opacity-0 group-active:opacity-30 group-active:animate-ping bg-accent"></div>
              </div>
            );
          }
          const isActive = pathname === item.path;
          // Se è l'icona profilo, gestisci click custom
          if (item.id === 'profile') {
            return (
              <div
                key={item.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={handleProfileClick}
              >
                <div className="p-2 group-hover:scale-110 transition-transform duration-200">
                  <IconComponent className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-accent' : 'text-white/70 group-hover:text-white'
                  }`} />
                </div>
                {isActive && (
                  <div className="w-1 h-1 bg-accent rounded-full mt-1"></div>
                )}
              </div>
            );
          }
          return (
            <div
              key={item.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleNavigation(item.path)}
            >
              <div className="p-2 group-hover:scale-110 transition-transform duration-200">
                <IconComponent className={`w-6 h-6 transition-colors ${
                  isActive ? 'text-accent' : 'text-white/70 group-hover:text-white'
                }`} />
              </div>
              {isActive && (
                <div className="w-1 h-1 bg-accent rounded-full mt-1"></div>
              )}
            </div>
          );
        })}
      </div>
      {showLogin && (
        <LoginModal onClose={() => {
          setShowLogin(false);
          if (user) router.push('/profilo');
        }} />
      )}
      {showLogout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4">Vuoi uscire?</h2>
            <button onClick={handleLogout} className="w-full bg-red-500 text-white p-2 rounded mb-2">Logout</button>
            <button onClick={() => setShowLogout(false)} className="w-full text-gray-500 mt-2">Annulla</button>
          </div>
        </div>
      )}
    </>
  );
}
