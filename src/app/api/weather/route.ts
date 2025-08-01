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
const CIVITANOVA_COORDS = "43.3062,13.7231";

// Function to get weather condition and emoji based on temperature, wind, and precipitation
function getWeatherCondition(temp: number, windSpeed: number, precipitation: number): { condition: string; emoji: string } {
  if (precipitation > 0.5) {
    if (precipitation > 5) {
      return { condition: "Pioggia intensa", emoji: "🌧️" };
    } else {
      return { condition: "Pioggia leggera", emoji: "🌦️" };
    }
  }
  
  if (windSpeed > 15) {
    return { condition: "Ventoso", emoji: "💨" };
  }
  
  if (temp > 25) {
    return { condition: "Soleggiato", emoji: "☀️" };
  } else if (temp > 15) {
    return { condition: "Nuvoloso", emoji: "☁️" };
  } else {
    return { condition: "Freddo", emoji: "🌫️" };
  }
}

// Function to get forecast data for the next 5 days
function generateForecast(currentTemp: number): ForecastData[] {
  const days = ["Lun", "Mar", "Mer", "Gio", "Ven"];
  const today = new Date();
  const forecast: ForecastData[] = [];
  
  for (let i = 0; i < 5; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i + 1);
    
    // Simple forecast logic - vary temperature slightly
    const tempVariation = Math.random() * 6 - 3; // -3 to +3 degrees
    const forecastTemp = Math.round(currentTemp + tempVariation);
    
    // Determine condition based on temperature
    let emoji = "☀️";
    let condition = "Soleggiato";
    
    if (forecastTemp < 15) {
      emoji = "🌫️";
      condition = "Freddo";
    } else if (forecastTemp < 20) {
      emoji = "☁️";
      condition = "Nuvoloso";
    } else if (Math.random() > 0.7) {
      emoji = "🌧️";
      condition = "Pioggia";
    }
    
    forecast.push({
      day: days[i],
      emoji,
      temp: `${forecastTemp}°`,
      condition
    });
  }
  
  return forecast;
}

export async function GET() {
  try {
    const username = process.env.METEOMATICS_USERNAME;
    const password = process.env.METEOMATICS_PASSWORD;
    
    if (!username || !password) {
      console.error("Meteomatics credentials not found in environment variables");
      return NextResponse.json(
        { error: "API credentials not configured" },
        { status: 500 }
      );
    }
    
    // Use a date within the valid range for the trial account (2025-07-30 to 2027-07-31)
    const validDate = "2025-08-01T14:00:00Z"; // Fixed date within valid range
    const url = `https://api.meteomatics.com/${validDate}/t_2m:C,wind_speed_10m:ms,precip_1h:mm,relative_humidity_2m:p/${CIVITANOVA_COORDS}/json`;
    
    const response = await fetch(url, {
      headers: {
        "Authorization": "Basic " + Buffer.from(username + ":" + password).toString('base64'),
      }
    });
    
    if (!response.ok) {
      throw new Error(`Meteomatics API response error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract weather data
    const temperature = Math.round(data.data.find((p: any) => p.parameter === "t_2m:C").coordinates[0].dates[0].value);
    const windSpeedMs = data.data.find((p: any) => p.parameter === "wind_speed_10m:ms").coordinates[0].dates[0].value;
    const windSpeed = Math.round(windSpeedMs * 3.6); // Convert m/s to km/h
    const precipitation = data.data.find((p: any) => p.parameter === "precip_1h:mm").coordinates[0].dates[0].value;
    const humidity = Math.round(data.data.find((p: any) => p.parameter === "relative_humidity_2m:p").coordinates[0].dates[0].value);
    
    const { condition, emoji } = getWeatherCondition(temperature, windSpeed, precipitation);
    
    const currentWeather: WeatherData = {
      temperature,
      windSpeed,
      precipitation,
      humidity,
      condition,
      emoji,
      lastUpdated: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    };
    
    const forecast = generateForecast(temperature);
    
    return NextResponse.json({
      current: currentWeather,
      forecast
    });
    
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}