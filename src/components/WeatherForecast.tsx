import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeatherData {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  icon: string;
}

interface WeatherForecastProps {
  destination: string;
  startDate: string;
  endDate: string;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ destination, startDate, endDate }) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, get coordinates for the destination
        const geoResponse = await fetch(
          `https://api.weatherapi.com/v1/search.json?key=1512a7d1f57d422ab3d65035250106&q=${encodeURIComponent(destination)}`
        );
        const geoData = await geoResponse.json();
        
        if (!geoData.length) {
          throw new Error('Location not found');
        }

        const { lat, lon } = geoData[0];

        // Calculate the number of days between start and end date
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Then fetch weather forecast
        const weatherResponse = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=1512a7d1f57d422ab3d65035250106&q=${lat},${lon}&days=14&aqi=no&alerts=no`
        );
        const weatherData = await weatherResponse.json();

        if (weatherData.error) {
          throw new Error(weatherData.error.message);
        }

        // Normalize dates to midnight UTC for comparison
        const normalizeDate = (date: Date) => {
          const normalized = new Date(date);
          normalized.setHours(0, 0, 0, 0);
          return normalized;
        };

        const normalizedStart = normalizeDate(start);
        const normalizedEnd = normalizeDate(end);

        // Filter the forecast to only include dates within the user's trip range
        const filteredForecast = weatherData.forecast.forecastday
          .filter((day: any) => {
            const forecastDate = normalizeDate(new Date(day.date));
            return forecastDate >= normalizedStart && forecastDate <= normalizedEnd;
          })
          .map((day: any) => ({
            date: day.date,
            maxTemp: day.day.maxtemp_c,
            minTemp: day.day.mintemp_c,
            condition: day.day.condition.text,
            icon: day.day.condition.icon
          }));

        if (filteredForecast.length === 0) {
          throw new Error('No weather data available for the selected dates');
        }

        setWeatherData(filteredForecast);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        console.error('Weather API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (destination && startDate && endDate) {
      fetchWeatherData();
    }
  }, [destination, startDate, endDate]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-12 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-red-500">Error: {error}</div>
          <div className="mt-2 text-sm text-slate-600">
            Please try selecting different dates or check if the location is correct.
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Weather Forecast for {destination}</CardTitle>
        <p className="text-sm text-slate-500">
          {formatDate(startDate)} - {formatDate(endDate)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weatherData.map((day) => (
            <div key={day.date} className="text-center p-4 rounded-lg bg-sky-50">
              <div className="font-medium text-slate-700">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-sm text-slate-500 mb-2">
                {formatDate(day.date)}
              </div>
              <img 
                src={`https:${day.icon}`} 
                alt={day.condition} 
                className="w-12 h-12 mx-auto my-2"
              />
              <div className="text-sm text-slate-600">{day.condition}</div>
              <div className="mt-2">
                <span className="text-sky-600 font-medium">{Math.round(day.maxTemp)}°</span>
                <span className="text-slate-400 mx-1">/</span>
                <span className="text-slate-500">{Math.round(day.minTemp)}°</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherForecast; 