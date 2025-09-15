'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';

import { quartieriData, Quartiere, QuartiereEvent, QuartierePark } from '@/data/quartieriData';
import { QuartieriCarousel3D } from '@/components/QuartieriCarousel3D';
import { PhotoGallery3D } from '@/components/PhotoGallery3D';
import { QuartiereEventsWidget } from '@/components/QuartiereEventsWidget';
import { QuartiereParksWidget } from '@/components/QuartiereParksWidget';
import { QuartiereSearchWidget } from '@/components/QuartiereSearchWidget';
import { 
  InformationCircleIcon, 
  PhotoIcon, 
  CalendarIcon, 
  MapIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

type TabType = 'info' | 'galleria' | 'eventi' | 'parchi';

const QuartieriPage = () => {
  const [selectedQuartiere, setSelectedQuartiere] = useState<Quartiere>(quartieriData[0]);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const handleQuartiereSelect = (quartiere: Quartiere) => {
    setSelectedQuartiere(quartiere);
    setActiveTab('info'); // Reset to info tab when selecting new quartiere
  };

  const handleSearchResult = (result: any) => {
    if (result.type === 'quartiere') {
      setSelectedQuartiere(result.data);
      setActiveTab('info');
    } else if (result.type === 'event') {
      // Find the quartiere that contains this event
      const quartiere = quartieriData.find(q => 
        q.events.some((e: QuartiereEvent) => e.id === result.id)
      );
      if (quartiere) {
        setSelectedQuartiere(quartiere);
        setActiveTab('eventi');
      }
    } else if (result.type === 'park') {
      // Find the quartiere that contains this park
      const quartiere = quartieriData.find(q => 
        q.parks.some((p: QuartierePark) => p.id === result.id)
      );
      if (quartiere) {
        setSelectedQuartiere(quartiere);
        setActiveTab('parchi');
      }
    }
    setIsSearchOpen(false);
  };

  const tabs = [
    { 
      id: 'info' as TabType, 
      label: 'Info Generale', 
      icon: InformationCircleIcon,
      color: selectedQuartiere.color
    },
    { 
      id: 'galleria' as TabType, 
      label: 'Galleria', 
      icon: PhotoIcon,
      color: selectedQuartiere.color
    },
    { 
      id: 'eventi' as TabType, 
      label: 'Eventi', 
      icon: CalendarIcon,
      color: selectedQuartiere.color
    },
    { 
      id: 'parchi' as TabType, 
      label: 'Parchi', 
      icon: MapIcon,
      color: selectedQuartiere.color
    }
  ];

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Reveal-on-scroll effect for titles and sections
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal-on-scroll'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            entry.target.classList.remove('opacity-0');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header title="Quartieri" />

      {/* Hero in stile Home con parallax e overlay */}
      <section className="relative w-full h-[300px] overflow-hidden" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 64px)' }}>
        <div className="absolute inset-0 z-0">
          <Image
            src={selectedQuartiere.image}
            alt={selectedQuartiere.name}
            fill
            priority
            className="object-cover scale-105"
            style={{
              transform: `translateY(${scrollY * 0.35}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/20" />
        </div>

        <div className="relative z-10 h-full flex items-end">
          <div className="px-4 pb-4 w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-textSecondary text-sm mb-1">Esplora</p>
                <h1 className="text-white text-[28px] font-bold leading-tight tracking-[-0.5px]">
                  Quartieri di Civitanova
                </h1>
                <p className="text-gray-300 text-sm">Scopri la bellezza e la cultura di ogni zona</p>
              </div>

              {/* Pulsante Search flottante in stile glass */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`action-button-liquid rounded-2xl p-3 border transition-all nav-item-transition ${
                  isSearchOpen ? 'bg-accent text-black' : 'border-white/10 hover:bg-white/10'
                }`}
                aria-label="Apri ricerca quartieri"
              >
                <MagnifyingGlassIcon className={`w-6 h-6 ${isSearchOpen ? 'text-black' : 'text-white'}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex-grow">
        {/* Nuova interfaccia quartieri */}
        <div className="min-h-screen bg-gradient-to-b from-dark-400 via-dark-300 to-black">
          <div className="container mx-auto px-4 py-6 content-with-navbar">
            {/* Search widget */}
            {isSearchOpen && (
              <div className="mb-6 animate-fadeIn">
                <QuartiereSearchWidget
                  quartieri={quartieriData}
                  onResultSelect={handleSearchResult}
                  color={selectedQuartiere.color}
                />
              </div>
            )}

            {/* Carousel 3D dei quartieri */}
            <div className="mb-8 reveal-on-scroll opacity-0">
              <QuartieriCarousel3D
                quartieri={quartieriData}
                onQuartiereSelect={handleQuartiereSelect}
                selectedQuartiereId={selectedQuartiere.id}
              />
            </div>

            {/* Quartiere header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-100 mb-3 reveal-on-scroll opacity-0">
                {selectedQuartiere.name}
              </h2>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {selectedQuartiere.highlights.map((highlight: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 font-medium"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex justify-center mb-8">
              <div className="nav-pill-liquid rounded-2xl p-2">
                <div className="flex space-x-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                          isActive
                            ? 'active-indicator text-white'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tab content */}
            <div className="max-w-6xl mx-auto">
              {activeTab === 'info' && (
                <div className="animate-fadeIn space-y-8">
                  {/* Main info card */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-blue-500/20 shadow-2xl card-glow">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-2xl font-bold text-blue-100 mb-4 reveal-on-scroll opacity-0">
                          Scopri {selectedQuartiere.name}
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                          {selectedQuartiere.description}
                        </p>
                        
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">
                              {selectedQuartiere.events.length}
                            </div>
                            <div className="text-gray-400 text-sm">Eventi</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">
                              {selectedQuartiere.parks.length}
                            </div>
                            <div className="text-gray-400 text-sm">Parchi</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">
                              {selectedQuartiere.gallery.length}
                            </div>
                            <div className="text-gray-400 text-sm">Foto</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative h-64">
                        <Image
                          src={selectedQuartiere.image}
                          alt={selectedQuartiere.name}
                          fill
                          className="object-cover rounded-xl shadow-lg"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'galleria' && (
                <div className="animate-fadeIn">
                  <PhotoGallery3D
                    images={selectedQuartiere.gallery}
                    title={`Galleria di ${selectedQuartiere.name}`}
                    color={selectedQuartiere.color}
                  />
                </div>
              )}

              {activeTab === 'eventi' && (
                <div className="animate-fadeIn">
                  <QuartiereEventsWidget
                    events={selectedQuartiere.events}
                    color={selectedQuartiere.color}
                  />
                </div>
              )}

              {activeTab === 'parchi' && (
                <div className="animate-fadeIn">
                  <QuartiereParksWidget
                    parks={selectedQuartiere.parks}
                    color={selectedQuartiere.color}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default QuartieriPage;