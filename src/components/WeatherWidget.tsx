"use client";

import React, { useState, useEffect } from 'react';

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
  condition: string;
}

interface ForecastItemProps {
  day: string;
  emoji: string;
  temp: string;
}

function ForecastItem({ day, emoji, temp }: ForecastItemProps) { 
  return (
    <div className="flex flex-col items-center">
      <span className="text-textSecondary text-xs mb-1">{day}</span>
      <div className="text-white mb-1 text-xl">{emoji}</div>
      <span className="text-white text-sm font-medium">{temp}</span>
    </div>
  );
}

// Function to get sea condition based on wind speed
function getSeaCondition(windSpeed: number): string {
  if (windSpeed < 5) return "Mare: calmo";
  if (windSpeed < 15) return "Mare: mosso";
  return "Mare: agitato";
}

// Function to get UV index based on temperature and time
function getUVIndex(temperature: number): string {
  const hour = new Date().getHours();
  
  // UV is lower in morning/evening and higher midday
  if (hour < 8 || hour > 18) return "UV: 1 (Basso)";
  if (hour < 10 || hour > 16) return "UV: 4 (Medio)";
  
  // Peak hours with temperature consideration
  if (temperature > 25) return "UV: 8 (Molto Alto)";
  if (temperature > 20) return "UV: 6 (Alto)";
  return "UV: 4 (Medio)";
}

export function WeatherWidget() {
  return null;
};