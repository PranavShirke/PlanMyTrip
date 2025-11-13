import React, { useState } from 'react';
import LandingHero from '../components/LandingHero';
import TripChatbot from '../components/TripChatbot';
import ItineraryDashboard from '../components/ItineraryDashboard';
import WeatherForecast from '../components/WeatherForecast';
import BackButton from '../components/BackButton';
import ItineraryPDF from '../components/ItineraryPDF';

export interface TripData {
  destination: string;
  startDate: string;
  endDate: string;
  interests: string[];
  travelStyle: string;
  days: number;
}

export interface ItineraryDay {
  day: number;
  date: string;
  activities: Activity[];
}

export interface Activity {
  id: string;
  name: string;
  type: string;
  time: string;
  duration: string;
  description: string;
  coordinates: [number, number];
  rating: number;
  tags: string[];
  imageUrl: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'landing' | 'wizard' | 'itinerary'>('landing');
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  const handleStartPlanning = () => {
    setCurrentStep('wizard');
  };

  const handleTripSubmit = (data: TripData) => {
    setTripData(data);
    setCurrentStep('itinerary');
    generateItinerary(data);
  };

  const generateItinerary = async (data: TripData) => {
    // Simulate AI-generated itinerary
    const mockItinerary: ItineraryDay[] = [];
    const startDate = new Date(data.startDate);
    
    for (let i = 0; i < data.days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const activities: Activity[] = [
        {
          id: `${i}-morning`,
          name: `Explore ${data.destination} Historic Center`,
          type: 'sightseeing',
          time: '9:00 AM',
          duration: '2 hours',
          description: 'Discover the rich history and architecture of the old town',
          coordinates: [0, 0], // These would be real coordinates
          rating: 4.5,
          tags: ['culture', 'walking', 'photography'],
          imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400'
        },
        {
          id: `${i}-lunch`,
          name: 'Local Cuisine Experience',
          type: 'food',
          time: '12:30 PM',
          duration: '1.5 hours',
          description: 'Authentic local dishes at a highly-rated restaurant',
          coordinates: [0.001, 0.001],
          rating: 4.7,
          tags: ['food', 'local', 'authentic'],
          imageUrl: 'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=400'
        },
        {
          id: `${i}-afternoon`,
          name: 'Nature Walk & Scenic Views',
          type: 'nature',
          time: '3:00 PM',
          duration: '2.5 hours',
          description: 'Beautiful trails with panoramic city views',
          coordinates: [0.002, 0.002],
          rating: 4.8,
          tags: ['nature', 'hiking', 'views'],
          imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400'
        }
      ];

      mockItinerary.push({
        day: i + 1,
        date: currentDate.toLocaleDateString(),
        activities
      });
    }
    
    setItinerary(mockItinerary);
  };

  const handleBackToLanding = () => {
    setCurrentStep('landing');
    setTripData(null);
    setItinerary([]);
  };

  const handleBackToWizard = () => {
    setCurrentStep('wizard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-coral-50">
      {currentStep === 'landing' && (
        <LandingHero onStartPlanning={handleStartPlanning} />
      )}
      
      {currentStep === 'wizard' && (
        <>
          <BackButton onClick={handleBackToLanding} />
          <TripChatbot onSubmit={handleTripSubmit} />
        </>
      )}
      
      {currentStep === 'itinerary' && tripData && (
        <div className="container mx-auto px-4 py-8">
          <BackButton onClick={handleBackToWizard} />
          <WeatherForecast
            destination={tripData.destination}
            startDate={tripData.startDate}
            endDate={tripData.endDate}
          />
          <div className="mt-8">
            <ItineraryDashboard 
              tripData={tripData}
              itinerary={itinerary}
              onBack={handleBackToWizard}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
