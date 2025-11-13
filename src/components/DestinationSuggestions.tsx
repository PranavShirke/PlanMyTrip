
import React from 'react';
import { MapPin, Utensils, Hotel, Camera, TreePine, ShoppingBag } from 'lucide-react';

interface Suggestion {
  id: string;
  name: string;
  type: 'restaurant' | 'hotel' | 'attraction' | 'activity';
  rating: number;
  description: string;
  icon: React.ReactNode;
}

interface DestinationSuggestionsProps {
  destination: string;
}

const DestinationSuggestions: React.FC<DestinationSuggestionsProps> = ({ destination }) => {
  // Mock suggestions based on destination
  const getSuggestions = (dest: string): Suggestion[] => {
    const suggestions: Suggestion[] = [
      {
        id: '1',
        name: `${dest} Grand Hotel`,
        type: 'hotel',
        rating: 4.5,
        description: 'Luxury accommodation in the heart of the city',
        icon: <Hotel className="w-5 h-5" />
      },
      {
        id: '2',
        name: `Local Delights Restaurant`,
        type: 'restaurant',
        rating: 4.8,
        description: 'Authentic local cuisine and traditional dishes',
        icon: <Utensils className="w-5 h-5" />
      },
      {
        id: '3',
        name: `${dest} Historic Center`,
        type: 'attraction',
        rating: 4.7,
        description: 'Must-see historical landmarks and architecture',
        icon: <Camera className="w-5 h-5" />
      },
      {
        id: '4',
        name: `Central Park Area`,
        type: 'activity',
        rating: 4.6,
        description: 'Beautiful green spaces for relaxation and walks',
        icon: <TreePine className="w-5 h-5" />
      },
      {
        id: '5',
        name: `${dest} Shopping District`,
        type: 'activity',
        rating: 4.4,
        description: 'Local markets and shopping areas',
        icon: <ShoppingBag className="w-5 h-5" />
      }
    ];
    return suggestions;
  };

  const suggestions = getSuggestions(destination);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'bg-blue-500';
      case 'restaurant':
        return 'bg-green-500';
      case 'attraction':
        return 'bg-purple-500';
      case 'activity':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'Hotel';
      case 'restaurant':
        return 'Restaurant';
      case 'attraction':
        return 'Attraction';
      case 'activity':
        return 'Activity';
      default:
        return 'Other';
    }
  };

  if (!destination.trim()) return null;

  return (
    <div className="mt-6 p-6 bg-sky-50 rounded-xl border border-sky-200">
      <div className="flex items-center mb-4">
        <MapPin className="w-5 h-5 text-sky-600 mr-2" />
        <h3 className="text-lg font-semibold text-sky-800">
          Popular in {destination}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="bg-white p-4 rounded-lg border border-sky-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`${getTypeColor(suggestion.type)} p-2 rounded-full text-white`}>
                  {suggestion.icon}
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">{suggestion.name}</h4>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {getTypeLabel(suggestion.type)}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-amber-500">
                <span className="text-sm font-medium">{suggestion.rating}</span>
                <span className="ml-1">★</span>
              </div>
            </div>
            <p className="text-sm text-slate-600">{suggestion.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DestinationSuggestions;
