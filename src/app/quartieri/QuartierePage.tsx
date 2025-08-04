'use client';

import React, { useState, useEffect } from 'react';
import { Quartiere } from '../../data/quartieriData';
import { QuartieriCarousel3D } from '../../components/QuartieriCarousel3D';
import { PhotoGallery3D } from '../../components/PhotoGallery3D';
import { QuartiereEventsWidget } from '../../components/QuartiereEventsWidget';
import { QuartiereParksWidget } from '../../components/QuartiereParksWidget';
import { QuartiereSearchWidget } from '../../components/QuartiereSearchWidget';
import { 
  InformationCircleIcon, 
  PhotoIcon, 
  CalendarIcon, 
  MapIcon,
  SparklesIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface QuartierePageProps {
  quartiereData: Quartiere[];
}

type TabType = 'info' | 'galleria' | 'eventi' | 'parchi';

const QuartierePage: React.FC<QuartierePageProps> = ({ quartiereData }) => {
  const [selectedQuartiere, setSelectedQuartiere] = useState<Quartiere | null>(quartiereData[0]);
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
      const quartiere = quartiereData.find(q => 
        q.events.some(e => e.id === result.id)
      );
      if (quartiere) {
        setSelectedQuartiere(quartiere);
        setActiveTab('eventi');
      }
    } else if (result.type === 'park') {
      // Find the quartiere that contains this park
      const quartiere = quartiereData.find(q => 
        q.parks.some(p => p.id === result.id)
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
      color: selectedQuartiere?.color || 'blue'
    },
    { 
      id: 'galleria' as TabType, 
      label: 'Galleria', 
      icon: PhotoIcon,
      color: selectedQuartiere?.color || 'blue'
    },
    { 
      id: 'eventi' as TabType, 
      label: 'Eventi', 
      icon: CalendarIcon,
      color: selectedQuartiere?.color || 'blue'
    },
    { 
      id: 'parchi' as TabType, 
      label: 'Parchi', 
      icon: MapIcon,
      color: selectedQuartiere?.color || 'blue'
    }
  ];

  if (!selectedQuartiere) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white text-xl">Caricamento quartieri...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header with search */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Esplora i Quartieri</h1>
              <p className="text-gray-400">Scopri la bellezza e la cultura di ogni zona</p>
            </div>
            
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                isSearchOpen 
                  ? `border-${selectedQuartiere.color}-400 bg-${selectedQuartiere.color}-500/10` 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <MagnifyingGlassIcon className={`w-6 h-6 ${
                isSearchOpen ? `text-${selectedQuartiere.color}-400` : 'text-gray-400'
              }`} />
            </button>
          </div>

          {/* Search widget */}
          {isSearchOpen && (
            <div className="mb-6 animate-fadeIn">
              <QuartiereSearchWidget
                quartieri={quartiereData}
                onResultSelect={handleSearchResult}
                color={selectedQuartiere.color}
              />
            </div>
          )}
        </div>
      </div>

      {/* 3D Carousel for quartiere selection */}
      <div className="relative">
        <QuartieriCarousel3D
          quartieri={quartiereData}
          onQuartiereSelect={handleQuartiereSelect}
          selectedQuartiereId={selectedQuartiere.id}
        />
      </div>

      {/* Selected quartiere content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quartiere header */}
        <div className="text-center mb-8">
          <h2 className={`text-4xl font-bold text-${selectedQuartiere.color}-100 mb-4`}>
            {selectedQuartiere.name}
          </h2>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {selectedQuartiere.highlights.map((highlight, index) => (
              <span
                key={index}
                className={`px-4 py-2 rounded-full bg-${selectedQuartiere.color}-500/20 text-${selectedQuartiere.color}-200 border border-${selectedQuartiere.color}-400/30 font-medium`}
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
                        ? `bg-${selectedQuartiere.color}-500 text-white shadow-lg shadow-${selectedQuartiere.color}-500/30`
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
              <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-${selectedQuartiere.color}-500/20 shadow-2xl`}>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className={`text-2xl font-bold text-${selectedQuartiere.color}-100 mb-4`}>
                      Scopri {selectedQuartiere.name}
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      {selectedQuartiere.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-${selectedQuartiere.color}-400`}>
                          {selectedQuartiere.events.length}
                        </div>
                        <div className="text-gray-400 text-sm">Eventi</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-${selectedQuartiere.color}-400`}>
                          {selectedQuartiere.parks.length}
                        </div>
                        <div className="text-gray-400 text-sm">Parchi</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-${selectedQuartiere.color}-400`}>
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
                    <div className={`absolute inset-0 bg-gradient-to-t from-${selectedQuartiere.color}-900/50 to-transparent rounded-xl`} />
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
  );
};

export default QuartierePage;