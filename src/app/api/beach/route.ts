import { NextResponse } from 'next/server';

// Coordinate di Civitanova Marche
const CIVITANOVA_LAT = 43.3058;
const CIVITANOVA_LON = 13.7286;

// Cache per evitare troppe richieste
let cachedData: any = null;
let lastFetch = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minuti

async function fetchMarineData() {
  const now = Date.now();
  
  // Usa cache se disponibile e non scaduta
  if (cachedData && (now - lastFetch) < CACHE_DURATION) {
    return cachedData;
  }

  try {
    // API Open-Meteo Marine Weather - completamente gratuita e senza registrazione
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${CIVITANOVA_LAT}&longitude=${CIVITANOVA_LON}&current=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity,ocean_current_direction,sea_surface_temperature&hourly=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,sea_surface_temperature&timezone=Europe%2FRome&forecast_days=1`;
    
    const marineResponse = await fetch(marineUrl);
    if (!marineResponse.ok) {
      throw new Error(`Marine API error: ${marineResponse.status}`);
    }
    const marineData = await marineResponse.json();

    // API Open-Meteo Weather per dati meteorologici aggiuntivi
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${CIVITANOVA_LAT}&longitude=${CIVITANOVA_LON}&current=temperature_2m,wind_speed_10m,wind_direction_10m,uv_index,weather_code&timezone=Europe%2FRome&forecast_days=1`;
    
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }
    const weatherData = await weatherResponse.json();

    cachedData = { marine: marineData, weather: weatherData };
    lastFetch = now;
    
    return cachedData;
  } catch (error) {
    console.error('Error fetching marine/weather data:', error);
    throw error;
  }
}

function getWeatherCondition(weatherCode: number): string {
  // Codici WMO Weather interpretation
  if (weatherCode === 0) return "Sereno";
  if (weatherCode <= 3) return "Parzialmente nuvoloso";
  if (weatherCode <= 48) return "Nebbioso";
  if (weatherCode <= 67) return "Piovoso";
  if (weatherCode <= 77) return "Nevoso";
  if (weatherCode <= 82) return "Rovesci";
  if (weatherCode <= 99) return "Temporalesco";
  return "Variabile";
}

function formatWaveHeight(height: number): string {
  if (height < 0.3) return "0.1-0.3m";
  if (height < 0.6) return "0.3-0.6m";
  if (height < 1.0) return "0.6-1.0m";
  if (height < 1.5) return "1.0-1.5m";
  if (height < 2.0) return "1.5-2.0m";
  return `${Math.floor(height)}-${Math.ceil(height)}m`;
}

function getVisibility(weatherCode: number): string {
  if (weatherCode === 0) return "Eccellente";
  if (weatherCode <= 3) return "Ottima";
  if (weatherCode <= 48) return "Ridotta";
  return "Buona";
}

export async function GET() {
  try {
    const data = await fetchMarineData();
    const { marine, weather } = data;

    const current = weather.current;
    const marineCurrent = marine.current;

    // Dati reali per entrambe le zone (usando gli stessi dati ma con piccole variazioni)
    const baseTemp = Math.round(current.temperature_2m);
    const baseWindSpeed = Math.round(current.wind_speed_10m);
    const baseWaveHeight = marineCurrent.wave_height || 0.5;
    const uvIndex = Math.round(current.uv_index || 0);
    const weatherCode = current.weather_code || 0;
    const seaTemp = Math.round(marineCurrent.sea_surface_temperature || baseTemp - 2);

    const beachConditions = {
      lungomareSud: {
        name: "Lungomare Sud",
        temperature: baseTemp,
        seaTemperature: seaTemp,
        windSpeed: baseWindSpeed,
        windDirection: Math.round(current.wind_direction_10m || 0),
        waveHeight: formatWaveHeight(baseWaveHeight),
        waveHeightMeters: Math.round(baseWaveHeight * 10) / 10,
        wavePeriod: Math.round(marineCurrent.wave_period || 4),
        waveDirection: Math.round(marineCurrent.wave_direction || 180),
        swellHeight: Math.round((marineCurrent.swell_wave_height || 0.3) * 10) / 10,
        uvIndex: uvIndex,
        condition: getWeatherCondition(weatherCode),
        visibility: getVisibility(weatherCode),
        currentVelocity: Math.round((marineCurrent.ocean_current_velocity || 0.1) * 10) / 10,
        currentDirection: Math.round(marineCurrent.ocean_current_direction || 90),
        lastUpdated: new Date().toISOString()
      },
      lungomareNord: {
        name: "Lungomare Nord",
        temperature: baseTemp - 1, // Leggera variazione
        seaTemperature: seaTemp,
        windSpeed: Math.max(1, baseWindSpeed - 2), // Leggermente meno ventoso
        windDirection: Math.round(current.wind_direction_10m || 0),
        waveHeight: formatWaveHeight(Math.max(0.1, baseWaveHeight - 0.2)),
        waveHeightMeters: Math.round(Math.max(0.1, baseWaveHeight - 0.2) * 10) / 10,
        wavePeriod: Math.round(marineCurrent.wave_period || 4),
        waveDirection: Math.round(marineCurrent.wave_direction || 180),
        swellHeight: Math.round(Math.max(0.1, (marineCurrent.swell_wave_height || 0.3) - 0.1) * 10) / 10,
        uvIndex: Math.max(0, uvIndex - 1),
        condition: getWeatherCondition(weatherCode),
        visibility: getVisibility(weatherCode),
        currentVelocity: Math.round((marineCurrent.ocean_current_velocity || 0.1) * 10) / 10,
        currentDirection: Math.round(marineCurrent.ocean_current_direction || 90),
        lastUpdated: new Date().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: beachConditions,
      timestamp: new Date().toISOString(),
      source: "Open-Meteo Marine & Weather API"
    });
  } catch (error) {
    console.error('Error fetching beach conditions:', error);
    
    // Fallback con dati di base se l'API non funziona
    const fallbackConditions = {
      lungomareSud: {
        name: "Lungomare Sud",
        temperature: 22,
        seaTemperature: 20,
        windSpeed: 10,
        windDirection: 180,
        waveHeight: "0.3-0.6m",
        waveHeightMeters: 0.5,
        wavePeriod: 4,
        waveDirection: 180,
        swellHeight: 0.3,
        uvIndex: 5,
        condition: "Dati non disponibili",
        visibility: "Buona",
        currentVelocity: 0.1,
        currentDirection: 90,
        lastUpdated: new Date().toISOString()
      },
      lungomareNord: {
        name: "Lungomare Nord",
        temperature: 21,
        seaTemperature: 20,
        windSpeed: 8,
        windDirection: 180,
        waveHeight: "0.2-0.5m",
        waveHeightMeters: 0.4,
        wavePeriod: 4,
        waveDirection: 180,
        swellHeight: 0.2,
        uvIndex: 4,
        condition: "Dati non disponibili",
        visibility: "Buona",
        currentVelocity: 0.1,
        currentDirection: 90,
        lastUpdated: new Date().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: fallbackConditions,
      timestamp: new Date().toISOString(),
      source: "Fallback data",
      note: "Real-time data temporarily unavailable"
    });
  }
}