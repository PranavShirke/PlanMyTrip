import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MapPin, Calendar, Heart, DollarSign, Clock, Cloud, Sun, CloudRain, Wind, ChevronRight, Search, Download } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ItineraryDisplayProps {
  itinerary: string;
  onBack: () => void;
}

interface WeatherData {
  date: string;
  temperature: number;
  condition: string;
  icon: string;
}

interface Location {
  name: string;
  coordinates: [number, number];
}

// Custom search control component
const SearchControl: React.FC<{ onSearch: (location: Location) => void }> = ({ onSearch }) => {
  const map = useMap();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white p-2 rounded-lg shadow-lg">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search locations..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-64 pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
      </div>
      {searchResults.length > 0 && (
        <div className="mt-2 max-h-48 overflow-y-auto">
          {searchResults.map((result) => (
            <div
              key={result.place_id}
              className="p-2 hover:bg-slate-100 cursor-pointer text-sm"
              onClick={() => {
                const location: Location = {
                  name: result.display_name,
                  coordinates: [parseFloat(result.lat), parseFloat(result.lon)]
                };
                onSearch(location);
                map.setView(location.coordinates, 13);
                setSearchResults([]);
              }}
            >
              {result.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onBack }) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [mapLocation, setMapLocation] = useState<[number, number] | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const itineraryRef = useRef<HTMLDivElement>(null);

  // Add debug logs
  console.log('Raw itinerary:', itinerary);

  // Extract trip details and days
  const [tripDetails, ...days] = itinerary.split(/\n(?=Day \d+:)/);
  console.log('Trip details:', tripDetails);
  console.log('Days:', days);

  const destinationMatch = tripDetails.match(/Destination: (.*)/);
  const daysMatch = tripDetails.match(/Number of Days: (\d+)/);
  const datesMatch = tripDetails.match(/Travel Dates: (.*)/);

  console.log('Matches:', {
    destination: destinationMatch?.[1],
    days: daysMatch?.[1],
    dates: datesMatch?.[1]
  });

  // Function to get weather icon
  const getWeatherIcon = (condition: string) => {
    if (condition.toLowerCase().includes('rain')) return <CloudRain className="w-6 h-6" />;
    if (condition.toLowerCase().includes('cloud')) return <Cloud className="w-6 h-6" />;
    if (condition.toLowerCase().includes('wind')) return <Wind className="w-6 h-6" />;
    return <Sun className="w-6 h-6" />;
  };

  // Mock weather data (replace with actual API call)
  useEffect(() => {
    const mockWeatherData: WeatherData[] = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      temperature: Math.floor(Math.random() * 15) + 15,
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Windy'][Math.floor(Math.random() * 4)],
      icon: 'sun'
    }));
    setWeatherData(mockWeatherData);
    setMapLocation([51.505, -0.09]); // Replace with actual coordinates
  }, []);

  const handleLocationSearch = (location: Location) => {
    setLocations(prev => [...prev, location]);
  };

  const handleDownloadPDF = async () => {
    if (!itineraryRef.current) return;

    try {
      // Create a new div for PDF content
      const pdfContent = document.createElement('div');
      pdfContent.style.padding = '20px';
      pdfContent.style.backgroundColor = 'white';
      pdfContent.style.width = '800px';
      pdfContent.style.position = 'absolute';
      pdfContent.style.left = '-9999px';
      document.body.appendChild(pdfContent);

      // Add trip details
      const tripDetailsHtml = `
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 24px; color: #1e293b; margin-bottom: 20px;">Your Travel Itinerary</h1>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px;">
            <div>
              <h3 style="font-size: 14px; color: #64748b;">Destination</h3>
              <p style="font-size: 18px; color: #1e293b; font-weight: 600;">${destinationMatch?.[1]}</p>
            </div>
            <div>
              <h3 style="font-size: 14px; color: #64748b;">Duration</h3>
              <p style="font-size: 18px; color: #1e293b; font-weight: 600;">${daysMatch?.[1]} Days</p>
            </div>
            <div>
              <h3 style="font-size: 14px; color: #64748b;">Travel Dates</h3>
              <p style="font-size: 18px; color: #1e293b; font-weight: 600;">${datesMatch?.[1]}</p>
            </div>
          </div>
        </div>
      `;
      pdfContent.innerHTML = tripDetailsHtml;

      // Add each day's content
      days.forEach((day, index) => {
        const dayMatch = day.match(/Day (\d+):/);
        const dayNumber = dayMatch ? parseInt(dayMatch[1]) : index + 1;
        const content = day.replace(/Day \d+:/, '').trim();
        const sections = content.split(/\n(?=- )/);

        const dayHtml = `
          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <h2 style="font-size: 20px; color: #1e293b; margin-bottom: 15px;">Day ${dayNumber}</h2>
            ${sections.map(section => {
              const [title, ...details] = section.split('\n');
              const cleanTitle = title.replace('- ', '').trim();
              return `
                <div style="margin-bottom: 15px;">
                  <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 10px;">${cleanTitle}</h3>
                  ${details.map(detail => `
                    <p style="font-size: 14px; color: #475569; margin: 5px 0;">${detail.trim()}</p>
                  `).join('')}
                </div>
              `;
            }).join('')}
          </div>
        `;
        pdfContent.innerHTML += dayHtml;
      });

      // Generate PDF
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Clean up
      document.body.removeChild(pdfContent);

      // Download PDF
      pdf.save(`${destinationMatch?.[1] || 'trip'}-itinerary.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-sky-50 via-white to-coral-50">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="hover:bg-sky-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleDownloadPDF}
              className="bg-gradient-to-r from-sky-500 to-coral-500 hover:from-sky-600 hover:to-coral-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <h1 className="text-3xl font-bold text-slate-800">Your Travel Itinerary</h1>
          </div>
        </div>

        <div ref={itineraryRef}>
          {/* Trip Details Card */}
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Destination</h3>
                  <p className="text-xl font-semibold text-slate-800">{destinationMatch?.[1]}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Duration</h3>
                  <p className="text-xl font-semibold text-slate-800">{daysMatch?.[1]} Days</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Travel Dates</h3>
                  <p className="text-xl font-semibold text-slate-800">{datesMatch?.[1]}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {weatherData.length > 0 && (
            <Card className="mb-8 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Weather Forecast</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {weatherData.map((weather, index) => (
                    <div key={index} className="text-center p-4 rounded-lg bg-white shadow-sm">
                      <p className="text-sm text-slate-600">{weather.date}</p>
                      <div className="my-2">{getWeatherIcon(weather.condition)}</div>
                      <p className="text-lg font-semibold text-sky-600">{weather.temperature}°C</p>
                      <p className="text-sm text-slate-600">{weather.condition}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Itinerary */}
            <div className="space-y-6">
              {days.map((day, index) => {
                const dayMatch = day.match(/Day (\d+):/);
                const dayNumber = dayMatch ? parseInt(dayMatch[1]) : index + 1;
                const content = day.replace(/Day \d+:/, '').trim();
                const sections = content.split(/\n(?=- )/);

                return (
                  <Card key={index} className="shadow-xl">
                    <div className="bg-gradient-to-r from-sky-500 to-coral-500 p-6">
                      <h2 className="text-3xl font-bold text-white tracking-tight">Day {dayNumber}</h2>
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {sections.map((section, sectionIndex) => {
                          const [title, ...details] = section.split('\n');
                          const cleanTitle = title.replace('- ', '').trim();
                          
                          let Icon = Clock;
                          if (cleanTitle.toLowerCase().includes('morning')) Icon = Clock;
                          else if (cleanTitle.toLowerCase().includes('afternoon')) Icon = Clock;
                          else if (cleanTitle.toLowerCase().includes('evening')) Icon = Clock;
                          else if (cleanTitle.toLowerCase().includes('restaurant')) Icon = Heart;
                          else if (cleanTitle.toLowerCase().includes('transportation')) Icon = MapPin;
                          else if (cleanTitle.toLowerCase().includes('cost')) Icon = DollarSign;

                          return (
                            <div key={sectionIndex} className="flex space-x-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                              <div className="flex-shrink-0">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <Icon className="w-6 h-6 text-sky-500" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-slate-800 mb-3">{cleanTitle}</h3>
                                <div className="space-y-2 text-slate-600">
                                  {details.map((detail, detailIndex) => (
                                    <p key={detailIndex} className="text-base leading-relaxed">
                                      {detail.trim()}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Right Column - Map */}
            {mapLocation && (
              <div className="sticky top-6">
                <Card className="shadow-xl h-[calc(100vh-12rem)]">
                  <CardContent className="p-0 h-full">
                    <div className="h-full w-full rounded-lg overflow-hidden relative">
                      <MapContainer
                        center={mapLocation}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <SearchControl onSearch={handleLocationSearch} />
                        {locations.map((location, index) => (
                          <Marker key={index} position={location.coordinates}>
                            <Popup>
                              <div>
                                <h3 className="font-semibold">{location.name}</h3>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDisplay; 