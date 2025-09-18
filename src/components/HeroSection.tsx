"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useAuthWithRole } from '../hooks/useAuthWithRole';
import heroImageLocal from '../../nuova immagine per herosection/nuova immagine per herosection.jpeg';

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const { user } = useAuthWithRole();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <section className="relative h-[340px] w-full overflow-hidden rounded-b-lg">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImageLocal}
          alt="Civitanova Marche Porto"
          fill
          className="object-cover scale-105"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-end justify-between" style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '48px', paddingBottom: '24px' }}>
        {/* Header Text */}
        <div className="flex flex-col items-end text-right">
          {/* Greeting */}
          <p className="text-[#A0A0A0] text-sm font-normal mb-1 animate-fade-in">
            {user?.display_name ? `Ciao ${user.display_name.split(' ')[0]}!` : 'Ciao!'}
          </p>
          
          {/* Main Title */}
          <h1 className="text-white text-[34px] font-bold leading-[1.2] tracking-[-0.5px] max-w-[80%] mb-2 animate-slide-up">
            Scopri il<br />
            Meglio di<br />
            Civitanova Marche
          </h1>
          
          {/* Subtitle with Dropdown */}
          <div className="flex items-center justify-end -mt-2 cursor-pointer hover:text-white transition-colors duration-200">
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
