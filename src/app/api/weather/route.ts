import { NextResponse } from 'next/server';

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

// Civitanova Marche coordinates
const LAT = 43.3062;
const LON = 13.7231;

function mapWeatherCodeToCondition(code: number): { condition: string; emoji: string } {
  // WMO weather codes mapping
  // https://open-meteo.com/en/docs
  if (code === 0) return { condition: 'Sereno', emoji: '☀️' };
  if (code === 1) return { condition: 'Poco nuvoloso', emoji: '🌤️' };
  if (code === 2) return { condition: 'Parzialmente nuvoloso', emoji: '⛅' };
  if (code === 3) return { condition: 'Coperto', emoji: '☁️' };
  if (code === 45 || code === 48) return { condition: 'Nebbia', emoji: '🌫️' };
  if ([51, 53, 55].includes(code)) return { condition: 'Pioviggine', emoji: '🌦️' };
  if ([56, 57].includes(code)) return { condition: 'Pioggia gelata', emoji: '🌧️' };
  if ([61, 63, 65].includes(code)) return { condition: 'Pioggia', emoji: '🌧️' };
  if ([66, 67].includes(code)) return { condition: 'Pioggia gelata', emoji: '🌧️' };
  if ([71, 73, 75].includes(code)) return { condition: 'Neve', emoji: '❄️' };
  if (code === 77) return { condition: 'Nevischio', emoji: '🌨️' };
  if ([80, 81, 82].includes(code)) return { condition: 'Rovesci', emoji: '🌧️' };
  if ([85, 86].includes(code)) return { condition: 'Rovesci di neve', emoji: '🌨️' };
  if (code === 95) return { condition: 'Temporale', emoji: '⛈️' };
  if ([96, 99].includes(code)) return { condition: 'Temporale con grandine', emoji: '⛈️' };
  return { condition: 'Variabile', emoji: '🌤️' };
}

function toItWeekday(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('it-IT', { weekday: 'short' });
}

export async function GET() {
  try {
    // Open‑Meteo: no API key required
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&hourly=relativehumidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,weathercode&forecast_days=5&timezone=Europe/Rome`;

    const response = await fetch(url, { next: { revalidate: 600 } }); // cache for 10 minutes on the server
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();

    const cw = data.current_weather;
    const hourlyTimes: string[] | undefined = data.hourly?.time;
    const idx = hourlyTimes ? hourlyTimes.indexOf(cw.time) : -1;
    const humidity = idx >= 0 && data.hourly?.relativehumidity_2m ? Math.round(data.hourly.relativehumidity_2m[idx]) : undefined;
    const precipitation = idx >= 0 && data.hourly?.precipitation ? Number(data.hourly.precipitation[idx]) : 0;

    const { condition, emoji } = mapWeatherCodeToCondition(cw.weathercode);

    const currentWeather: WeatherData = {
      temperature: Math.round(cw.temperature),
      windSpeed: Math.round(cw.windspeed), // already in km/h
      precipitation,
      humidity,
      condition,
      emoji,
      lastUpdated: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    };

    const forecast: ForecastData[] = [];
    const days: string[] = data.daily?.time || [];
    const weathercodes: number[] = data.daily?.weathercode || [];
    const maxTemps: number[] = data.daily?.temperature_2m_max || [];

    for (let i = 0; i < Math.min(5, days.length); i++) {
      const { condition: fcCond, emoji: fcEmoji } = mapWeatherCodeToCondition(weathercodes[i]);
      forecast.push({
        day: toItWeekday(days[i]),
        emoji: fcEmoji,
        temp: `${Math.round(maxTemps[i])}°`,
        condition: fcCond,
      });
    }

    return NextResponse.json({ current: currentWeather, forecast });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
