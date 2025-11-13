import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, ZoomIn, ZoomOut, Search, MapPin } from 'lucide-react';
import { ItineraryDay } from '../pages/Index';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';

// Fix for default marker icons in Leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for searched locations
const searchIcon = L.divIcon({
  className: 'custom-search-marker',
  html: `<div class="w-8 h-8 bg-sky-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
           <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
             <circle cx="12" cy="10" r="3"></circle>
           </svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Component to handle map view updates
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

interface InteractiveMapProps {
  itinerary: ItineraryDay[];
  selectedDay: number;
  onDaySelect: (day: number) => void;
}

interface SearchSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  itinerary, 
  selectedDay, 
  onDaySelect 
}) => {
  const [zoom, setZoom] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([40, -74.5]);
  const [searchMarker, setSearchMarker] = useState<L.Marker | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const mapRef = useRef<L.Map | null>(null);
  const selectedDayActivities = itinerary.find(day => day.day === selectedDay)?.activities || [];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'sightseeing': '#0EA5E9', // sky-500
      'food': '#F97316', // coral-500
      'nature': '#22C55E', // green-500
      'shopping': '#A855F7', // purple-500
      'culture': '#F59E0B' // amber-500
    };
    return colors[type] || '#64748B'; // slate-500
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 1));
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(async () => {
      if (value.trim().length > 2) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&accept-language=en&limit=5`
          );
          const data = await response.json();
          setSuggestions(data);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 300); // 300ms delay
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    const newCenter: [number, number] = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
    setMapCenter(newCenter);
    setZoom(14);

    // Remove previous search marker if it exists
    if (searchMarker) {
      searchMarker.remove();
    }

    // Create a new marker for the searched location with custom icon
    const marker = L.marker(newCenter, { icon: searchIcon });
    setSearchMarker(marker);

    // Add popup to the marker with formatted English name
    const displayName = suggestion.display_name.split(',')[0];
    marker.bindPopup(`<div class="p-2">
      <h3 class="font-bold">${displayName}</h3>
      <p class="text-sm text-gray-600">${suggestion.display_name}</p>
    </div>`).openPopup();

    // Add the marker to the map
    if (mapRef.current) {
      marker.addTo(mapRef.current);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&accept-language=en`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
        setZoom(14);

        // Remove previous search marker if it exists
        if (searchMarker) {
          searchMarker.remove();
        }

        // Create a new marker for the searched location with custom icon
        const marker = L.marker(newCenter, { icon: searchIcon });
        setSearchMarker(marker);

        // Add popup to the marker with formatted English name
        const displayName = data[0].display_name.split(',')[0];
        const fullAddress = data[0].display_name;
        marker.bindPopup(`<div class="p-2">
          <h3 class="font-bold">${displayName}</h3>
          <p class="text-sm text-gray-600">${fullAddress}</p>
        </div>`).openPopup();

        // Add the marker to the map
        if (mapRef.current) {
          marker.addTo(mapRef.current);
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="map-container">
      {/* Search bar with suggestions */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-96 search-container">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search location in English..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="bg-white/90 backdrop-blur-sm shadow-lg border-slate-200"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
                    <div className="text-xs text-slate-500 truncate">{suggestion.display_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button 
            type="submit"
            className="bg-white text-slate-700 hover:bg-slate-50 shadow-lg border border-slate-200"
          >
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Map container */}
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?lang=en"
        />
        
        {selectedDayActivities.map((activity, index) => (
          <Marker
            key={activity.id}
            position={activity.coordinates}
            icon={defaultIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{activity.name}</h3>
                <p className="text-sm text-gray-600">{activity.time}</p>
                <div className="flex items-center mt-1">
                  <span className="text-amber-500">★</span>
                  <span className="text-sm ml-1">{activity.rating}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedDayActivities.length > 1 && (
          <Polyline
            positions={selectedDayActivities.map(activity => activity.coordinates)}
            color="#3B82F6"
            weight={3}
            opacity={0.7}
            dashArray="5, 5"
          />
        )}

        <MapController center={mapCenter} zoom={zoom} />
      </MapContainer>

      {/* Day selector sidebar */}
      <div className="absolute left-4 top-4 bottom-4 w-80 bg-white/95 backdrop-blur-md rounded-xl shadow-xl overflow-hidden z-[1000] border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-white/50">
          <h3 className="font-semibold text-slate-800">Your Itinerary</h3>
          <p className="text-sm text-slate-600">Click a day to view details</p>
        </div>
        
        <div className="overflow-y-auto h-full pb-20 bg-white/50">
          {itinerary.map((day) => (
            <div key={day.day} className="border-b border-slate-100 last:border-b-0">
              <button
                onClick={() => onDaySelect(day.day)}
                className={`w-full p-4 text-left hover:bg-slate-50/80 transition-colors ${
                  selectedDay === day.day ? 'bg-sky-50/90 border-l-4 border-sky-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-800">Day {day.day}</h4>
                  <span className="text-xs text-slate-500">{day.date}</span>
                </div>
                <div className="text-sm text-slate-600">
                  {day.activities.length} activities planned
                </div>
              </button>
              
              {selectedDay === day.day && (
                <div className="px-4 pb-4 space-y-3">
                  {day.activities.map((activity) => (
                    <Card key={activity.id} className="bg-white/90 border border-slate-200 shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex space-x-3">
                          <img
                            src={activity.imageUrl}
                            alt={activity.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm text-slate-800 truncate">
                              {activity.name}
                            </h5>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center space-x-1 text-xs text-slate-600">
                                <Clock className="w-3 h-3" />
                                <span>{activity.time}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-amber-500">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{activity.rating}</span>
                              </div>
                            </div>
                            <Badge 
                              className={`mt-2 text-xs ${getTypeColor(activity.type)} text-white`}
                            >
                              {activity.type}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute bottom-4 right-4 space-y-2 z-[1000]">
        <Button 
          size="sm" 
          className="bg-white text-slate-700 hover:bg-slate-50 shadow-lg border border-slate-200"
          onClick={handleZoomIn}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          className="bg-white text-slate-700 hover:bg-slate-50 shadow-lg border border-slate-200"
          onClick={handleZoomOut}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
        <Card className="bg-white/95 backdrop-blur-md border border-slate-200">
          <CardContent className="p-3">
            <div className="flex space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                <span>Sightseeing</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-coral-500 rounded-full"></div>
                <span>Food</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Nature</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveMap;
