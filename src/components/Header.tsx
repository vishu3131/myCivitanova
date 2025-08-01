'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const showFeatureComingSoon = () => {
    alert("Questa funzionalità sarà disponibile prossimamente!");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 md:h-[70px] lg:h-20 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 md:px-6 lg:px-8 mx-auto max-w-7xl">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 bg-[#0077BE] rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
              CM
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-heading font-medium text-[#264653]">Civitanova Marche</h1>
              <p className="text-xs text-gray-500">Smart City App</p>
            </div>
          </Link>
        </div>

        {/* Navigation - Desktop Only */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link href="/" className="text-[#264653] hover:text-[#0077BE] font-medium transition-colors">
            Home
          </Link>
          <Link href="#" onClick={showFeatureComingSoon} className="text-[#264653] hover:text-[#0077BE] font-medium transition-colors">
            Esplora
          </Link>
          <Link href="#" onClick={showFeatureComingSoon} className="text-[#264653] hover:text-[#0077BE] font-medium transition-colors">
            Eventi
          </Link>
          <Link href="#" onClick={showFeatureComingSoon} className="text-[#264653] hover:text-[#0077BE] font-medium transition-colors">
            Servizi
          </Link>
          <Link href="#" onClick={showFeatureComingSoon} className="text-[#264653] hover:text-[#0077BE] font-medium transition-colors">
            Info
          </Link>
        </nav>

        {/* Search Bar - Tablet & Desktop Only */}
        <div className="hidden md:flex items-center flex-1 max-w-lg mx-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cerca luoghi, eventi, servizi..."
              className="w-full py-2 pl-10 pr-4 text-[#264653] bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0077BE] focus:ring-2 focus:ring-[#0077BE]/20 transition-all"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-[#264653] hover:bg-gray-100 rounded-full transition-colors" onClick={showFeatureComingSoon}>
            <span className="text-2xl">🔔</span>
            <span className="absolute top-1 right-1 h-5 w-5 bg-[#E76F51] text-white text-xs font-medium rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* User Avatar */}
          <div className="relative">
            <button 
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#0077BE] flex items-center justify-center bg-gray-200"
              onClick={toggleUserMenu}
            >
              <span className="text-xl">👤</span>
            </button>
            
            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-medium text-[#264653]">Mario Rossi</p>
                  <p className="text-xs text-gray-500">mario.rossi@email.com</p>
                </div>
                <Link href="#" onClick={showFeatureComingSoon} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                  <span className="mr-2 text-lg">👤</span>
                  <span>Profilo</span>
                </Link>
                <Link href="#" onClick={showFeatureComingSoon} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                  <span className="mr-2 text-lg">⚙️</span>
                  <span>Impostazioni</span>
                </Link>
                <Link href="#" onClick={showFeatureComingSoon} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                  <span className="mr-2 text-lg">❓</span>
                  <span>Aiuto</span>
                </Link>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                    <span className="mr-2 text-lg">🚪</span>
                    <span>Esci</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
