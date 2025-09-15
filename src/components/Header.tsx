'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DonorNotifications from '@/components/fundraising/DonorNotifications';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function Header({ title }: { title?: string }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const showFeatureComingSoon = () => {
    alert("Questa funzionalità sarà disponibile prossimamente!");
  };

  const items = [
    { label: 'Home', href: '/' },
    { label: 'Esplora', href: '/esplora' },
    { label: 'Eventi', href: '/eventi' },
    { label: 'Servizi', href: '/servizi' },
    { label: 'News', href: '/news' },
  ] as const;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  useEffect(() => {
    let lastY = typeof window !== 'undefined' ? window.scrollY : 0;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      if (Math.abs(y - lastY) < 8) return;
      setHidden(y > lastY && y > 80);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: hidden ? -80 : 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`hidden md:block fixed top-0 left-0 right-0 z-50 h-16 md:h-[70px] lg:h-20 border-b transition-all duration-300 ${
        scrolled ? 'bg-black/60 backdrop-blur-xl border-white/10 shadow-lg' : 'bg-black/40 backdrop-blur-md border-white/10 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6 lg:px-8 mx-auto max-w-7xl">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <div className="w-10 h-10 bg-[#0077BE] rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3 shadow-md group-hover:shadow-[#0077BE]/30 transition-shadow">
              CM
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-heading font-medium text-white">{title || 'Civitanova Marche'}</h1>
              <p className="text-xs text-gray-400">Smart City App</p>
            </div>
          </Link>
        </div>

        {/* Navigation - Desktop Only */}
        <nav className="hidden lg:flex items-center space-x-2 nav-pill-liquid rounded-full px-2 py-1">
          {items.map(({ label, href }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 text-sm rounded-full transition-colors ${active ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="relative z-10">{label}</span>
                {active && (
                  <motion.span
                    layoutId="headerActiveBar"
                    className="absolute left-3 right-3 -bottom-1 h-0.5 bg-[#D8FF00] rounded-full shadow-[0_0_8px_2px_rgba(216,255,0,0.5)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar - Tablet & Desktop Only */}
        <div className="hidden md:flex items-center flex-1 max-w-lg mx-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cerca luoghi, eventi, servizi..."
              className="w-full py-2 pl-10 pr-4 text-white placeholder-gray-400 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#D8FF00] focus:ring-2 focus:ring-[#D8FF00]/20 transition-all"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {/* Donor Notifications */}
          <DonorNotifications />
          
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
                <Link href="/admin" className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50">
                  <span className="mr-2 text-lg">⚙️</span>
                  <span>Admin Panel</span>
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
    </motion.header>
  );
}
