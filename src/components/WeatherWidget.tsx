"use client";

import React, { useEffect, useState } from "react";
import { Sun, CloudRain, Cloud, CloudSnow, Wind } from "lucide-react";

interface WeatherData {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  humidity?: number;
  condition: string;
  emoji: string;
  lastUpdated: string;
}

interface ForecastData {
  day: string;
  emoji: string;
  temp: string;
}

function getSeaCondition(windSpeed: number): string {
  if (windSpeed < 5) return "Mare: calmo";
  if (windSpeed < 15) return "Mare: mosso";
  return "Mare: agitato";
}

function getUVIndex(temperature: number): string {
  const hour = new Date().getHours();
  if (hour < 8 || hour > 18) return "UV: 1 (Basso)";
  if (hour < 10 || hour > 16) return "UV: 4 (Medio)";
  if (temperature > 25) return "UV: 8 (Molto Alto)";
  if (temperature > 20) return "UV: 6 (Alto)";
  return "UV: 4 (Medio)";
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);

  useEffect(() => {
    // Temporary static data; replace with real API in future
    const now = new Date();
    setWeather({
      temperature: 26,
      windSpeed: 8,
      precipitation: 0,
      humidity: 60,
      condition: "Sereno",
      emoji: "☀️",
      lastUpdated: now.toLocaleTimeString("it-IT")
    });

    const days = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
    const sampleForecast: ForecastData[] = Array.from({ length: 5 }).map((_, i) => ({
      day: days[(now.getDay() + i) % 7],
      emoji: ["☀️", "🌤", "🌧", "⛅", "❄️"][i % 5],
      temp: `${23 + i}°`
    }));
    setForecast(sampleForecast);
  }, []);

  if (!weather) return null;

  return (
    <div className="bg-dark-300 rounded-xl p-5 card-glow border border-dark-100 text-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-heading font-medium mb-1 flex items-center gap-2">
            {weather.emoji} {weather.condition}
          </h2>
          <p className="text-4xl font-bold">{weather.temperature}°C</p>
          <p className="text-textSecondary text-xs">Aggiornato alle {weather.lastUpdated}</p>
        </div>
        <div className="flex flex-col items-end text-sm">
          <span className="flex items-center gap-1">
            <Wind size={14} /> {weather.windSpeed} km/h
          </span>
          <span>{getSeaCondition(weather.windSpeed)}</span>
          <span>{getUVIndex(weather.temperature)}</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {forecast.map((f) => (
          <div key={f.day} className="flex flex-col items-center">
            <span className="text-textSecondary text-xs mb-1">{f.day}</span>
            <span className="text-lg">{f.emoji}</span>
            <span className="text-sm font-medium">{f.temp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}