"use client";

import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuthWithRole } from '../hooks/useAuthWithRole';

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const { user } = useAuthWithRole();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <section className="relative h-[340px] w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Civitanova Marche Porto"
          className="w-full h-full object-cover scale-105"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between" style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '48px', paddingBottom: '24px' }}>
        {/* Header Text */}
        <div className="flex flex-col">
          {/* Greeting */}
          <p className="text-[#A0A0A0] text-sm font-normal mb-1 animate-fade-in">
            {user?.display_name ? `Ciao ${user.display_name.split(' ')[0]}!` : 'Ciao!'}
          </p>
          
          {/* Main Title */}
          <h1 className="text-white text-[34px] font-bold leading-[1.2] tracking-[-0.5px] max-w-[80%] mb-2 animate-slide-up">
            Scopri il<br />
            Meglio di<br />
            Civitanova
          </h1>
          
          {/* Subtitle with Dropdown */}
          <div className="flex items-center -mt-2 cursor-pointer hover:text-white transition-colors duration-200">
            <span className="text-[#888888] text-base">Centro Storico</span>
            <ChevronDown className="ml-1 w-4 h-4 text-[#888888] transition-transform duration-200 hover:rotate-180" />
          </div>
        </div>
        
        {/* Bottom spacing for content flow */}
        <div className="h-4"></div>
      </div>
    </section>
  );
}
