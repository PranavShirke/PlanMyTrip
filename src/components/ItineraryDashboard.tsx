import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Star, 
  Download, 
  Calendar,
  Map
} from 'lucide-react';
import { TripData, ItineraryDay } from '../pages/Index';
import InteractiveMap from './InteractiveMap';
import { usePDF } from 'react-to-pdf';

interface ItineraryDashboardProps {
  tripData: TripData;
  itinerary: ItineraryDay[];
  onBack: () => void;
}

const ItineraryDashboard: React.FC<ItineraryDashboardProps> = ({ 
  tripData, 
  itinerary, 
  onBack 
}) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [activeTab, setActiveTab] = useState('timeline');
  const { toPDF, targetRef } = usePDF({
    filename: `trip-itinerary-${tripData.destination}.pdf`,
    page: { format: 'a4', orientation: 'portrait' }
  });

  const formatTime = (time: string) => {
    return time;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'sightseeing': 'bg-sky-100 text-sky-700',
      'food': 'bg-coral-100 text-coral-700',
      'nature': 'bg-green-100 text-green-700',
      'shopping': 'bg-purple-100 text-purple-700',
      'culture': 'bg-amber-100 text-amber-700'
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-coral-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {tripData.destination}
                </h1>
                <p className="text-slate-600">
                  {new Date(tripData.startDate).toLocaleDateString()} - {new Date(tripData.endDate).toLocaleDateString()} • {tripData.days} days
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={toPDF} className="rounded-xl bg-gradient-to-r from-sky-500 to-coral-500">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PDF content for export */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }} aria-hidden="true">
        <div ref={targetRef} className="p-8 max-w-[800px] mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-sky-600 mb-2">
              Trip Itinerary: {tripData.destination}
            </h1>
            <p className="text-slate-600">
              {formatDate(tripData.startDate)} - {formatDate(tripData.endDate)}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Trip Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-600">Destination</p>
                <p className="font-medium">{tripData.destination}</p>
              </div>
              <div>
                <p className="text-slate-600">Travel Style</p>
                <p className="font-medium capitalize">{tripData.travelStyle}</p>
              </div>
              <div>
                <p className="text-slate-600">Interests</p>
                <p className="font-medium capitalize">
                  {tripData.interests.join(', ')}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Duration</p>
                <p className="font-medium">{tripData.days} days</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Daily Schedule</h2>
            {itinerary.map((day) => (
              <div key={day.day} className="mb-6 border-b border-slate-200 pb-6">
                <h3 className="text-lg font-semibold text-sky-600 mb-3">
                  Day {day.day} - {formatDate(day.date)}
                </h3>
                <div className="space-y-4">
                  {day.activities.map((activity) => (
                    <div key={activity.id} className="bg-slate-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-800">{activity.name}</h4>
                          <p className="text-sm text-slate-600">{activity.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-sky-600">{activity.time}</p>
                          <p className="text-sm text-slate-500">{activity.duration}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {activity.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-sky-100 text-sky-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>Generated by PlanMyTrip</p>
            <p>© {new Date().getFullYear()} All rights reserved</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="timeline" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <Map className="w-4 h-4" />
              <span>Map View</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            {/* Day selector */}
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {itinerary.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(day.day)}
                  className={`flex-shrink-0 px-6 py-3 rounded-xl transition-all duration-200 ${
                    selectedDay === day.day
                      ? 'bg-sky-500 text-white shadow-lg'
                      : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  <div className="font-semibold">Day {day.day}</div>
                  <div className="text-sm opacity-80">{day.date}</div>
                </button>
              ))}
            </div>

            {/* Activities for selected day */}
            {itinerary.find(day => day.day === selectedDay) && (
              <div className="space-y-4">
                {itinerary.find(day => day.day === selectedDay)!.activities.map((activity, index) => (
                  <Card key={activity.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src={activity.imageUrl}
                            alt={activity.name}
                            className="w-24 h-24 rounded-xl object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-slate-800">{activity.name}</h3>
                              <p className="text-slate-600">{activity.description}</p>
                            </div>
                            <div className="flex items-center space-x-1 text-amber-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm font-medium">{activity.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(activity.time)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{activity.duration}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Badge className={getTypeColor(activity.type)}>
                              {activity.type}
                            </Badge>
                            {activity.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-0">
                <InteractiveMap 
                  itinerary={itinerary}
                  selectedDay={selectedDay}
                  onDaySelect={setSelectedDay}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ItineraryDashboard;
