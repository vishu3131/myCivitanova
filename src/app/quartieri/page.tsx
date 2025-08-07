'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNavbar } from '@/components/BottomNavbar';
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

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header title="Quartieri" />
      
      {/* BANNER DI TEST */}
      <div className="bg-purple-500 text-white text-center py-4 text-xl font-bold">
        🚀 WIDGET INTERATTIVI ATTIVI - VERSIONE COMPLETA ✅
      </div>
      
      <div className="pt-16 md:pt-[70px] lg:pt-20 flex-grow">
        {/* Nuova interfaccia quartieri */}
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-4">
                🏘️ Esplora i Quartieri
              </h1>
              <p className="text-gray-300 text-xl">
                Nuova esperienza futuristica attiva!
              </p>
            </div>

            {/* Header with search */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Esplora i Quartieri</h1>
                <p className="text-gray-400">Scopri la bellezza e la cultura di ogni zona</p>
              </div>
              
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                  isSearchOpen 
                    ? 'border-blue-400 bg-blue-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <MagnifyingGlassIcon className={`w-6 h-6 ${
                  isSearchOpen ? 'text-blue-400' : 'text-gray-400'
                }`} />
              </button>
            </div>

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
            <div className="mb-8">
              <QuartieriCarousel3D
                quartieri={quartieriData}
                onQuartiereSelect={handleQuartiereSelect}
                selectedQuartiereId={selectedQuartiere.id}
              />
            </div>

            {/* Quartiere header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-blue-100 mb-4">
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
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700">
                <div className="flex space-x-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
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
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-blue-500/20 shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-2xl font-bold text-blue-100 mb-4">
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
                      
                      <div className="relative">
                        <img
                          src={selectedQuartiere.image}
                          alt={selectedQuartiere.name}
                          className="w-full h-64 object-cover rounded-xl shadow-lg"
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

      <BottomNavbar />
    </div>
  );
};

export default QuartieriPage;