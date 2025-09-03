"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { StatusBar } from '@/components/StatusBar';
import { ArrowLeft, MapPin, Star, Thermometer, Wind, Eye, Waves, Sun, Umbrella, Car, Wifi, ShowerHead, UtensilsCrossed } from 'lucide-react';

// Icon mapping to ensure all icons are properly defined
const iconMap = {
  Umbrella,
  Shower: ShowerHead,
  UtensilsCrossed,
  Car,
  Wifi
};

interface BeachInfo {
  id: number;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  distance: string;
  features: string[];
  services: {
    icon: keyof typeof iconMap;
    name: string;
    available: boolean;
  }[];
  weatherInfo: {
    temperature: number;
    windSpeed: number;
    visibility: string;
    waveHeight: string;
    uvIndex: number;
  };
}

const beachesData: BeachInfo[] = [
  {
    id: 1,
    name: "Lungomare Sud",
    description: "Spiaggia sabbiosa e misto ghiaia, lunga circa 2,5 km. Promenade con palme, stabilimenti, bar e locali. Atmosfera vivace, perfetta per relax di giorno e socialità la sera.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop",
    rating: 4.8,
    reviews: 245,
    distance: "1.2 km",
    features: ["Sabbia fine", "Stabilimenti balneari", "Bar e ristoranti", "Parcheggio", "Pista ciclabile"],
    services: [
      { icon: "Umbrella", name: "Ombrelloni", available: true },
      { icon: "Shower", name: "Docce", available: true },
      { icon: "UtensilsCrossed", name: "Ristoranti", available: true },
      { icon: "Car", name: "Parcheggio", available: true },
      { icon: "Wifi", name: "WiFi", available: true }
    ],
    weatherInfo: {
      temperature: 28,
      windSpeed: 12,
      visibility: "Ottima",
      waveHeight: "0.5-1m",
      uvIndex: 7
    }
  },
  {
    id: 2,
    name: "Lungomare Nord",
    description: "Spiaggia ampia con sabbia fine e mare limpido dall'azzurro al blu cobalto. Delimitata a sud dal porto, verso nord si unisce alla costa di Potenza Picena. Contornata da piste ciclabili, hotel e ristoranti.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop",
    rating: 4.9,
    reviews: 312,
    distance: "2.1 km",
    features: ["Sabbia finissima", "Mare cristallino", "Piste ciclabili", "Hotel fronte mare", "Natura incontaminata"],
    services: [
      { icon: "Umbrella", name: "Ombrelloni", available: true },
      { icon: "Shower", name: "Docce", available: true },
      { icon: "UtensilsCrossed", name: "Ristoranti", available: true },
      { icon: "Car", name: "Parcheggio", available: true },
      { icon: "Wifi", name: "WiFi", available: false }
    ],
    weatherInfo: {
      temperature: 27,
      windSpeed: 8,
      visibility: "Eccellente",
      waveHeight: "0.3-0.8m",
      uvIndex: 6
    }
  }
];

export default function SpiaggiaPage() {
  const router = useRouter();
  const [selectedBeach, setSelectedBeach] = useState<BeachInfo>(beachesData[0]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [beachesWithLiveData, setBeachesWithLiveData] = useState<BeachInfo[]>(beachesData);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLiveBeachData = async () => {
      try {
        const response = await fetch('/api/beach');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const updatedBeaches = beachesData.map(beach => {
              if (beach.name === "Lungomare Sud" && result.data.lungomareSud) {
                const sudData = result.data.lungomareSud;
                return {
                  ...beach,
                  weatherInfo: {
                    ...beach.weatherInfo,
                    temperature: typeof sudData.temperature === 'number' ? sudData.temperature : beach.weatherInfo.temperature,
                    windSpeed: typeof sudData.windSpeed === 'number' ? sudData.windSpeed : beach.weatherInfo.windSpeed,
                    waveHeight: typeof sudData.waveHeight === 'string' ? sudData.waveHeight : beach.weatherInfo.waveHeight,
                    uvIndex: typeof sudData.uvIndex === 'number' ? sudData.uvIndex : beach.weatherInfo.uvIndex,
                    visibility: typeof sudData.visibility === 'string' ? sudData.visibility : beach.weatherInfo.visibility
                  }
                };
              }
              if (beach.name === "Lungomare Nord" && result.data.lungomareNord) {
                const nordData = result.data.lungomareNord;
                return {
                  ...beach,
                  weatherInfo: {
                    ...beach.weatherInfo,
                    temperature: typeof nordData.temperature === 'number' ? nordData.temperature : beach.weatherInfo.temperature,
                    windSpeed: typeof nordData.windSpeed === 'number' ? nordData.windSpeed : beach.weatherInfo.windSpeed,
                    waveHeight: typeof nordData.waveHeight === 'string' ? nordData.waveHeight : beach.weatherInfo.waveHeight,
                    uvIndex: typeof nordData.uvIndex === 'number' ? nordData.uvIndex : beach.weatherInfo.uvIndex,
                    visibility: typeof nordData.visibility === 'string' ? nordData.visibility : beach.weatherInfo.visibility
                  }
                };
              }
              return beach;
            });
            setBeachesWithLiveData(updatedBeaches);
            
            // Mantieni la selezione corrente dell'utente se esiste
            setSelectedBeach(prev => {
              const currentSelectedBeach = updatedBeaches.find(beach => beach.id === prev.id);
              if (currentSelectedBeach) {
                return currentSelectedBeach;
              }
              return updatedBeaches[0];
            });
          }
        }
      } catch (error) {
        console.error('Error fetching live beach data:', error);
      }
    };

    fetchLiveBeachData();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUVIndexColor = (uvIndex: number) => {
    if (uvIndex <= 2) return 'text-green-400';
    if (uvIndex <= 5) return 'text-yellow-400';
    if (uvIndex <= 7) return 'text-orange-400';
    return 'text-red-400';
  };

  const getUVIndexLabel = (uvIndex: number) => {
    if (uvIndex <= 2) return 'Basso';
    if (uvIndex <= 5) return 'Moderato';
    if (uvIndex <= 7) return 'Alto';
    return 'Molto Alto';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <StatusBar />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between p-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Spiagge di Civitanova</h1>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Beach Selection Tabs */}
      <div className="px-4 py-4">
        <div className="flex space-x-2">
          {beachesWithLiveData.map((beach) => (
            <button
              key={beach.id}
              onClick={() => setSelectedBeach(beach)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedBeach.id === beach.id
                  ? 'bg-accent text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {beach.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        {/* Beach Image */}
        <div className="relative h-64 rounded-xl overflow-hidden mb-6">
          <Image
            src={selectedBeach.image}
            alt={selectedBeach.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Beach Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedBeach.name}</h2>
                <div className="flex items-center text-white/80">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{selectedBeach.distance} dal centro</span>
                </div>
              </div>
              <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-white font-medium">{selectedBeach.rating}</span>
                <span className="text-white/60 text-sm ml-1">({selectedBeach.reviews})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Info Card */}
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-4 mb-6 border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Sun className="w-5 h-5 text-yellow-400 mr-2" />
              Condizioni Meteo Marine
            </h3>
            <span className="text-sm text-white/60">{isMounted ? formatTime(currentTime) : '--:--'}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <Thermometer className="w-5 h-5 text-red-400 mr-2" />
              <div>
                <div className="text-sm text-white/60">Temperatura</div>
                <div className="font-semibold">{selectedBeach.weatherInfo.temperature}°C</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Wind className="w-5 h-5 text-blue-400 mr-2" />
              <div>
                <div className="text-sm text-white/60">Vento</div>
                <div className="font-semibold">{selectedBeach.weatherInfo.windSpeed} km/h</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-green-400 mr-2" />
              <div>
                <div className="text-sm text-white/60">Visibilità</div>
                <div className="font-semibold">{selectedBeach.weatherInfo.visibility}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Waves className="w-5 h-5 text-cyan-400 mr-2" />
              <div>
                <div className="text-sm text-white/60">Onde</div>
                <div className="font-semibold">{selectedBeach.weatherInfo.waveHeight}</div>
              </div>
            </div>
          </div>
          
          {/* UV Index */}
          <div className="mt-4 p-3 bg-black/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Indice UV</span>
              <div className="flex items-center">
                <span className={`font-semibold ${getUVIndexColor(selectedBeach.weatherInfo.uvIndex)}`}>
                  {selectedBeach.weatherInfo.uvIndex}
                </span>
                <span className={`text-sm ml-2 ${getUVIndexColor(selectedBeach.weatherInfo.uvIndex)}`}>
                  {getUVIndexLabel(selectedBeach.weatherInfo.uvIndex)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Descrizione</h3>
          <p className="text-white/80 leading-relaxed">{selectedBeach.description}</p>
        </div>

        {/* Features */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Caratteristiche</h3>
          <div className="flex flex-wrap gap-2">
            {selectedBeach.features.map((feature, index) => (
              <span
                key={index}
                className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Servizi Disponibili</h3>
          <div className="grid grid-cols-2 gap-4">
            {selectedBeach.services.map((service, index) => {
              const IconComponent = iconMap[service.icon];
              
              return (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-lg ${
                    service.available 
                      ? 'bg-green-500/20 border border-green-500/30' 
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}
                >
                  {IconComponent && (
                    <IconComponent 
                      className={`w-5 h-5 mr-3 ${
                        service.available ? 'text-green-400' : 'text-red-400'
                      }`} 
                    />
                  )}
                  <span className={service.available ? 'text-white' : 'text-white/60'}>
                    {service.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-accent text-black font-semibold py-3 px-6 rounded-xl hover:bg-accent/90 transition-colors">
            Indicazioni
          </button>
          <button className="bg-white/10 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
            Condividi
          </button>
        </div>
      </div>
    </div>
  );
}