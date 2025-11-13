import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, MapPin, Calendar, Heart, Sparkles } from 'lucide-react';
import { TripData } from '../pages/Index';
import DestinationSuggestions from './DestinationSuggestions';

interface TripWizardProps {
  onSubmit: (data: TripData) => void;
}

const TripWizard: React.FC<TripWizardProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    interests: [] as string[],
    travelStyle: ''
  });

  const interests = [
    { id: 'culture', label: 'Culture & History', emoji: '🏛️' },
    { id: 'food', label: 'Food & Dining', emoji: '🍜' },
    { id: 'nature', label: 'Nature & Outdoors', emoji: '🌲' },
    { id: 'adventure', label: 'Adventure Sports', emoji: '🏄' },
    { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
    { id: 'nightlife', label: 'Nightlife', emoji: '🌙' },
    { id: 'art', label: 'Art & Museums', emoji: '🎨' },
    { id: 'wellness', label: 'Wellness & Relaxation', emoji: '🧘' }
  ];

  const travelStyles = [
    { id: 'relaxed', label: 'Relaxed Explorer', description: 'Take it slow, enjoy the moments', emoji: '☕' },
    { id: 'balanced', label: 'Balanced Adventurer', description: 'Mix of must-sees and downtime', emoji: '⚖️' },
    { id: 'packed', label: 'Packed Itinerary', description: 'See everything, maximize your time', emoji: '⚡' }
  ];

  const handleInterestToggle = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const handleSubmit = () => {
    const days = calculateDays();
    onSubmit({
      ...formData,
      days
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.destination.trim() !== '';
      case 2:
        return formData.startDate && formData.endDate;
      case 3:
        return formData.interests.length > 0;
      case 4:
        return formData.travelStyle !== '';
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i <= step ? 'bg-sky-500' : 'bg-slate-200'
                  } ${i === step ? 'scale-125' : ''}`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-3xl bg-gradient-to-r from-sky-600 to-coral-500 bg-clip-text text-transparent">
            {step === 1 && 'Where to?'}
            {step === 2 && 'When are you traveling?'}
            {step === 3 && 'What interests you?'}
            {step === 4 && 'Your travel style?'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                <Input
                  placeholder="Enter destination (e.g., Tokyo, Japan)"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  className="pl-12 py-6 text-lg rounded-xl border-2 border-slate-200 focus:border-sky-400"
                />
              </div>
              <p className="text-slate-600 text-center">Tell us where you'd like to explore</p>
              
              <DestinationSuggestions destination={formData.destination} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="pl-12 py-4 rounded-xl border-2 border-slate-200 focus:border-sky-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500 w-5 h-5" />
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="pl-12 py-4 rounded-xl border-2 border-slate-200 focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>
              {formData.startDate && formData.endDate && (
                <div className="text-center p-4 bg-sky-50 rounded-xl">
                  <p className="text-sky-700 font-medium">
                    {calculateDays()} days of adventure awaits! ✨
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => handleInterestToggle(interest.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105 ${
                      formData.interests.includes(interest.id)
                        ? 'border-sky-400 bg-sky-50 text-sky-700'
                        : 'border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{interest.emoji}</div>
                    <div className="text-sm font-medium">{interest.label}</div>
                  </button>
                ))}
              </div>
              <p className="text-slate-600 text-center">Select all that apply</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {travelStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setFormData(prev => ({ ...prev, travelStyle: style.id }))}
                  className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left hover:scale-102 ${
                    formData.travelStyle === style.id
                      ? 'border-sky-400 bg-sky-50'
                      : 'border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{style.emoji}</div>
                    <div>
                      <div className="font-semibold text-slate-800">{style.label}</div>
                      <div className="text-slate-600">{style.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              className="px-6 py-3 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-coral-500 hover:from-sky-600 hover:to-coral-600"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-coral-500 hover:from-sky-600 hover:to-coral-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create My Trip
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripWizard;
