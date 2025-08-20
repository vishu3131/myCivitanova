"use client";

import React, { useState, useEffect } from 'react';
import { Waves, Thermometer, Wind, Sun, MapPin, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface BeachData {
  name: string;
  image: string;
  temperature: number;
  seaTemperature?: number;
  windSpeed: number;
  windDirection?: number;
  waveHeight: string;
  waveHeightMeters?: number;
  wavePeriod?: number;
  waveDirection?: number;
  swellHeight?: number;
  uvIndex: number;
  condition: string;
  visibility?: string;
  currentVelocity?: number;
  currentDirection?: number;
}

const defaultBeachData: BeachData = {
  name: "Lungomare Sud",
  image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=200&fit=crop",
  temperature: 28,
  seaTemperature: 26,
  windSpeed: 12,
  windDirection: 180,
  waveHeight: "0.5-1m",
  waveHeightMeters: 0.7,
  wavePeriod: 4,
  waveDirection: 180,
  swellHeight: 0.3,
  uvIndex: 7,
  condition: "Soleggiato",
  visibility: "Ottima",
  currentVelocity: 0.2,
  currentDirection: 90
};

export function BeachWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [beachData, setBeachData] = useState<BeachData>(defaultBeachData);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBeachData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/beach');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.lungomareSud) {
            setBeachData({
              ...defaultBeachData,
              ...result.data.lungomareSud
            });
          }
        }
      } catch (error) {
        console.error('Error fetching beach data:', error);
        // Keep default data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchBeachData();
    
    // Refresh data every 10 minutes
    const dataTimer = setInterval(fetchBeachData, 10 * 60 * 1000);
    
    return () => clearInterval(dataTimer);
  }, []);

  const getUVIndexColor = (uvIndex: number) => {
    if (uvIndex <= 2) return 'text-green-400';
    if (uvIndex <= 5) return 'text-yellow-400';
    if (uvIndex <= 7) return 'text-orange-400';
    return 'text-red-400';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Link href="/spiaggia">
      <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl overflow-hidden border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 cursor-pointer group">
        {/* Header */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Waves className="w-5 h-5 text-cyan-400 mr-2" />
              <h3 className="text-white font-semibold">Spiagge</h3>
            </div>
            <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-white/60">{isMounted ? formatTime(currentTime) : '--:--'} • {beachData.condition}</p>
        </div>

        {/* Beach Image */}
        <div className="relative h-24 mx-4 rounded-lg overflow-hidden mb-3">
          <Image
            src={beachData.image}
            alt={beachData.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          <div className="absolute bottom-2 left-2">
            <p className="text-white text-sm font-medium">{beachData.name}</p>
          </div>
        </div>

        {/* Weather Info */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-4 gap-2">
            {/* Air Temperature */}
            <div className="text-center">
              <Thermometer className="w-4 h-4 text-red-400 mx-auto mb-1" />
              <div className="text-xs text-white/60">Aria</div>
              <div className="text-sm font-semibold text-white">{beachData.temperature}°</div>
            </div>

            {/* Sea Temperature */}
            <div className="text-center">
              <Waves className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-xs text-white/60">Mare</div>
              <div className="text-sm font-semibold text-white">{beachData.seaTemperature || '--'}°</div>
            </div>

            {/* Wind */}
            <div className="text-center">
              <Wind className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <div className="text-xs text-white/60">Vento</div>
              <div className="text-sm font-semibold text-white">{beachData.windSpeed}km/h</div>
            </div>

            {/* UV Index */}
            <div className="text-center">
              <Sun className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-xs text-white/60">UV</div>
              <div className={`text-sm font-semibold ${getUVIndexColor(beachData.uvIndex)}`}>
                {beachData.uvIndex}
              </div>
            </div>
          </div>

          {/* Wave Info */}
          <div className="mt-3 space-y-2">
            {/* Wave Height */}
            <div className="p-2 bg-black/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Waves className="w-4 h-4 text-cyan-400 mr-2" />
                  <span className="text-xs text-white/60">Altezza onde</span>
                </div>
                <span className="text-sm font-medium text-white">{beachData.waveHeight}</span>
              </div>
            </div>

            {/* Additional Marine Info */}
            {(beachData.wavePeriod || beachData.swellHeight) && (
              <div className="grid grid-cols-2 gap-2">
                {beachData.wavePeriod && (
                  <div className="p-2 bg-black/10 rounded text-center">
                    <div className="text-xs text-white/60">Periodo</div>
                    <div className="text-sm font-medium text-white">{beachData.wavePeriod}s</div>
                  </div>
                )}
                {beachData.swellHeight && (
                  <div className="p-2 bg-black/10 rounded text-center">
                    <div className="text-xs text-white/60">Swell</div>
                    <div className="text-sm font-medium text-white">{beachData.swellHeight}m</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}