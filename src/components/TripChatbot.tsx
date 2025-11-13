import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Loader2, MapPin, Calendar, Heart, Plane, Globe, Clock, Star } from 'lucide-react';
import { generateResponse } from '../services/gemini';
import ItineraryDisplay from './ItineraryDisplay';
import '../styles/chatbot.css';

interface Message {
  type: 'user' | 'bot';
  content: string;
  options?: { label: string; value: string }[];
}

interface TripData {
  destination: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  interests: string[];
  travelStyle: string;
  generatedItinerary: string;
}

const formatItinerary = (itinerary: string): string => {
  // Split into days
  const days = itinerary.split(/\n(?=Day \d+:)/);
  
  return days.map(day => {
    // Extract day number and content
    const dayMatch = day.match(/Day (\d+):/);
    const dayNumber = dayMatch ? dayMatch[1] : '';
    const content = day.replace(/Day \d+:/, '').trim();
    
    // Split content into sections
    const sections = content.split(/\n(?=- )/);
    
    // Format each section
    const formattedSections = sections.map(section => {
      const [title, ...details] = section.split('\n');
      const cleanTitle = title.replace('- ', '').trim();
      
      // Format details with proper indentation and bullet points
      const formattedDetails = details
        .map(detail => detail.trim())
        .filter(detail => detail)
        .map(detail => `  • ${detail}`)
        .join('\n');
      
      return `- ${cleanTitle}\n${formattedDetails}`;
    }).join('\n\n');
    
    return `Day ${dayNumber}:\n${formattedSections}`;
  }).join('\n\n');
};

const TripChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: "Hi! I'm your AI travel assistant. Let's plan your perfect trip! 🌍\n\nWhere would you like to travel?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tripData, setTripData] = useState<Partial<TripData>>({});
  const [currentStep, setCurrentStep] = useState<'destination' | 'days' | 'dates' | 'interests' | 'style' | 'itinerary'>('destination');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showItinerary, setShowItinerary] = useState(false);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOptionSelect = async (option: { label: string; value: string }) => {
    if (option.value === 'view_itinerary') {
      setShowItinerary(true);
      return;
    }
    if (option.value === 'restart') {
      setMessages([{
        type: 'bot',
        content: "Hi! I'm your AI travel assistant. Let's plan your perfect trip! 🌍\n\nWhere would you like to travel?",
      }]);
      setTripData({});
      setCurrentStep('destination');
      return;
    }
    if (option.value === 'retry') {
      setCurrentStep('itinerary');
      await handleSendMessage();
      return;
    }

    setInput(option.label);
    await handleSendMessage();
  };

  const generateBotResponse = async (userInput: string) => {
    let response: Message;
    let nextStep = currentStep;

    switch (currentStep) {
      case 'destination':
        setTripData({ ...tripData, destination: userInput });
        response = {
          type: 'bot',
          content: "How many days would you like to stay? 📅",
          options: [
            { label: '3 days', value: '3' },
            { label: '5 days', value: '5' },
            { label: '7 days', value: '7' },
            { label: '10 days', value: '10' },
          ],
        };
        nextStep = 'days';
        break;

      case 'days':
        setTripData({ ...tripData, numberOfDays: parseInt(userInput) });
        response = {
          type: 'bot',
          content: "When would you like to visit? 📅",
          options: [
            { label: 'Next month', value: 'next_month' },
            { label: 'In 3 months', value: '3_months' },
            { label: 'In 6 months', value: '6_months' },
          ],
        };
        nextStep = 'dates';
        break;

      case 'dates':
        const dates = userInput.split(' to ');
        setTripData({
          ...tripData,
          startDate: dates[0],
          endDate: dates[1],
        });
        response = {
          type: 'bot',
          content: "What kind of experiences are you interested in? 🎯",
          options: interests.map(interest => ({
            label: `${interest.emoji} ${interest.label}`,
            value: interest.id
          })),
        };
        nextStep = 'interests';
        break;

      case 'interests':
        setTripData({
          ...tripData,
          interests: [...(tripData.interests || []), userInput],
        });
        response = {
          type: 'bot',
          content: "What's your preferred travel style? 🎭",
          options: travelStyles.map(style => ({
            label: `${style.emoji} ${style.label}`,
            value: style.id
          })),
        };
        nextStep = 'style';
        break;

      case 'style':
        setTripData({
          ...tripData,
          travelStyle: userInput,
        });
        response = {
          type: 'bot',
          content: "Perfect! I'm crafting your personalized itinerary... ✨",
        };
        nextStep = 'itinerary';
        break;

      case 'itinerary':
        try {
          const basePrompt = `Create a detailed ${tripData.numberOfDays}-day travel itinerary for a trip to ${tripData.destination} from ${tripData.startDate} to ${tripData.endDate}.
          Travel style: ${tripData.travelStyle}
          Interests: ${tripData.interests?.join(', ')}
          
          Format the itinerary exactly as follows:
          Destination: ${tripData.destination}
          Number of Days: ${tripData.numberOfDays}
          Travel Dates: ${tripData.startDate} to ${tripData.endDate}
          
          Day 1:
          - Morning:
            • Activity 1
            • Activity 2
          - Afternoon:
            • Activity 1
            • Activity 2
          - Evening:
            • Activity 1
            • Activity 2
          
          Include for each day:
          - Morning, afternoon, and evening activities
          - Transportation details
          - Restaurant recommendations
          - Estimated costs
          - Important tips or notes
          
          Make each day unique and creative, matching the traveler's interests and style.
          Ensure the activities are properly spaced throughout the day and consider travel time between locations.
          Format each day exactly as shown above, with proper indentation and bullet points.`;

          const strictDaysRequirement = `\n\nIMPORTANT: Output exactly ${tripData.numberOfDays} days with headings for each day in the form 'Day X:' for X = 1 to ${tripData.numberOfDays}. Do not omit any day. Do not include any content before the Destination/Number of Days/Travel Dates header.`;

          const prompt = basePrompt + strictDaysRequirement;

          console.log('Generating itinerary with prompt:', prompt);
          let itinerary = await generateResponse(prompt);
          console.log('Raw itinerary response:', itinerary);
          
          let formattedItinerary = formatItinerary(itinerary);
          console.log('Formatted itinerary:', formattedItinerary);

          // Validate number of days; if insufficient, try once more with an even stricter instruction
          const dayCount = (formattedItinerary.match(/^Day \d+:/gm) || []).length;
          const expectedDays = Number(tripData.numberOfDays) || 0;

          if (expectedDays > 0 && dayCount < expectedDays) {
            const retryPrompt = basePrompt + `\n\nSTRICT REQUIREMENTS:\n- You MUST include headings for every day from Day 1 to Day ${tripData.numberOfDays}.\n- Provide all ${tripData.numberOfDays} days.\n- Use the exact heading format: 'Day X:' on its own line for each day.`;
            console.log('Retrying itinerary generation due to insufficient days. Day count:', dayCount, 'Expected:', expectedDays);
            itinerary = await generateResponse(retryPrompt);
            formattedItinerary = formatItinerary(itinerary);
          }
          
          const header = `Destination: ${tripData.destination}\nNumber of Days: ${tripData.numberOfDays}\nTravel Dates: ${tripData.startDate} to ${tripData.endDate}`;
          const finalItinerary = `${header}\n\n${formattedItinerary}`;
          
          setTripData({
            ...tripData,
            generatedItinerary: finalItinerary,
          });

          response = {
            type: 'bot',
            content: "Here's your personalized itinerary! Would you like to view it in detail?",
            options: [
              { label: 'View Full Itinerary', value: 'view_itinerary' },
              { label: 'Start Over', value: 'restart' },
            ],
          };
        } catch (error) {
          console.error('Error generating itinerary:', error);
          response = {
            type: 'bot',
            content: "I apologize, but I encountered an error while generating your itinerary. Would you like to try again?",
            options: [
              { label: 'Try Again', value: 'retry' },
              { label: 'Start Over', value: 'restart' },
            ],
          };
        }
        break;

      default:
        response = {
          type: 'bot',
          content: "I'm not sure how to help with that. Let's start over! Where would you like to travel?",
        };
        nextStep = 'destination';
    }

    setCurrentStep(nextStep);
    return response;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateBotResponse(input);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          content: "I apologize, but I encountered an error. Please try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (showItinerary && tripData.generatedItinerary) {
    console.log('Rendering ItineraryDisplay with:', tripData.generatedItinerary);
    return (
      <ItineraryDisplay
        itinerary={tripData.generatedItinerary}
        onBack={() => setShowItinerary(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 via-white to-coral-50">
      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm shadow-2xl border-0">
        <CardContent className="p-6">
          <div className="h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-sky-500 to-coral-500 rounded-lg">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Travel Assistant</h1>
                  <p className="text-sm text-slate-500">Let's plan your perfect trip!</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-500">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  } animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-sky-500 to-coral-500 text-white'
                        : 'bg-white shadow-md'
                    }`}
                  >
                    {message.type === 'bot' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-1 bg-sky-100 rounded-full">
                          <Globe className="w-4 h-4 text-sky-500" />
                        </div>
                        <span className="text-xs text-slate-500">Travel Assistant</span>
                      </div>
                    )}
                    <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
                    {message.options && (
                      <div className="mt-3 space-y-2">
                        {message.options.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleOptionSelect(option)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                              message.type === 'user'
                                ? 'bg-white/10 hover:bg-white/20'
                                : 'bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-white shadow-md rounded-2xl p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
                      <span className="text-sm text-slate-500">Planning your trip...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Star className="w-5 h-5 text-slate-400" />
              </div>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="pl-10 rounded-xl border-2 border-slate-200 focus:border-sky-400 transition-colors duration-200"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className={`absolute right-1 top-1 rounded-lg transition-all duration-200 ${
                  !input.trim() || isLoading
                    ? 'bg-slate-200 text-slate-400'
                    : 'bg-gradient-to-r from-sky-500 to-coral-500 hover:from-sky-600 hover:to-coral-600 text-white'
                }`}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripChatbot; 