'use client';
import { useState } from 'react';
import JapanTravelForm from '@/components/JapanTravelForm';
import TimelineView from '@/components/TimelineView';
import { Header } from '@/components/ui/Header';
import { SaveTripButton } from '@/components/ui/SaveTripButton';
import { AuthDebug } from '@/components/AuthDebug';
import { useLanguage } from '@/contexts/LanguageContext';
import { JapanTravelFormData, JapanTimeline } from '@/types/travel';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [tripData, setTripData] = useState<JapanTravelFormData | null>(null);
    const [itinerary, setItinerary] = useState<string | null>(null);
    const [timeline, setTimeline] = useState<JapanTimeline | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showRawOutput, setShowRawOutput] = useState(false);
    const [lastPrompt, setLastPrompt] = useState<string | null>(null);

    const handleJapanTravelFormSubmit = async (data: JapanTravelFormData) => {
        console.log('🇯🇵 Japan journey submitted:', data);
        setIsLoading(true);
        setTripData(data);
        setError(null);

        try {
            const response = await fetch('/api/generate-japan-itinerary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result.error || 'Failed to generate Japan itinerary';
                const errorDetails = result.details || '';
                throw new Error(`${errorMessage}${errorDetails ? ` (${errorDetails})` : ''}`);
            }

            // Store raw AI response and prompt for testing
            setItinerary(result.itinerary);
            setLastPrompt(result.prompt || null);
            
            // Parse JSON response directly into timeline
            let timelineData: JapanTimeline;
            try {
                // Clean up response - remove markdown backticks if present
                let cleanResponse = result.itinerary.trim();
                if (cleanResponse.startsWith('```json')) {
                    cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (cleanResponse.startsWith('```')) {
                    cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }
                
                console.log('🔍 Attempting to parse JSON response...');
                console.log('📄 Clean response (first 500 chars):', cleanResponse.substring(0, 500));
                
                const jsonData = JSON.parse(cleanResponse);
                
                if (!jsonData.days || !Array.isArray(jsonData.days)) {
                    throw new Error('Invalid JSON structure: missing days array');
                }
                
                timelineData = {
                    days: jsonData.days.map((day: any, index: number) => {
                        // Better region matching logic
                        const dayNumber = day.dayNumber || (index + 1);
                        let assignedRegion = data.regions[0].region; // fallback
                        
                        // Calculate which region this day should belong to based on day allocation
                        // Regions are already sorted by user's chosen order in form submission
                        let totalDaysProcessed = 0;
                        for (let i = 0; i < data.regions.length; i++) {
                            if (dayNumber <= totalDaysProcessed + data.regions[i].days) {
                                assignedRegion = data.regions[i].region;
                                break;
                            }
                            totalDaysProcessed += data.regions[i].days;
                        }
                        
                        const dayActivities = (day.activities || []).map((activity: any, actIndex: number) => ({
                            id: activity.id || `day${day.dayNumber}-activity${actIndex + 1}`,
                            name: activity.title || 'Activity',
                            description: activity.description || 'No description available',
                            startTime: activity.time || '09:00',
                            duration: activity.duration || 120,
                            type: activity.type || 'attraction',
                            icon: activity.icon || '📍',
                            estimatedCost: activity.cost || 0,
                            location: activity.location || 'Japan'
                        }));
                        
                        // Debug logging for activity parsing
                        console.log(`📅 Day ${dayNumber} Activity Parsing:`, {
                            aiGeneratedCount: day.activities?.length || 0,
                            parsedCount: dayActivities.length,
                            activities: dayActivities.map(a => `${a.startTime}: ${a.name}`)
                        });
                        
                        return {
                            dayNumber,
                            region: assignedRegion,
                            activities: dayActivities,
                            totalCost: (day.activities || []).reduce((sum: number, activity: any) => sum + (activity.cost || 0), 0)
                        };
                    }),
                    totalDuration: data.totalDuration,
                    regions: data.regions,
                    travelStyles: data.travelStyles,
                    season: data.season
                };
                
                console.log('✅ Successfully parsed JSON response');
            } catch (error) {
                console.error('❌ Failed to parse JSON response:', error);
                console.error('📄 Raw response:', result.itinerary);
                throw new Error('AI returned invalid format. Please try again.');
            }
            
            setTimeline(timelineData);
            
            console.log('✅ Japan journey planning completed!');
        } catch (error) {
            console.error('❌ Error planning Japan journey:', error);
            setError(error instanceof Error ? error.message : 'Failed to generate Japan itinerary');
        } finally {
            setIsLoading(false);
        }
    };

    if (!tripData) {
        return (
            <JapanTravelForm
                onSubmit={handleJapanTravelFormSubmit}
                isLoading={isLoading}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
               <Header 
                subtitle={user ? `Welcome, ${user.name}!` : "Your personalized Japan experience"} 
                />


                {/* Trip Summary */}
                <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
                    <h2 className="text-2xl font-light text-gray-800 mb-6 text-center">
                        {t('result.yourJourney')}
                    </h2>
                    
                    <div className="space-y-6">
                        {/* Multiple Regions Display */}
                        <div>
                            <h3 className="font-medium text-gray-800 mb-3">
                                {t('result.yourJourney')} ({tripData.totalDuration} {t('common.days')} {t('result.total')}):
                            </h3>
                            <div className="space-y-3">
                                {tripData.regions.map((regionWithDays) => (
                                    <div key={regionWithDays.region.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xl">{regionWithDays.region.icon}</span>
                                            <div>
                                                <span className="font-medium text-gray-800">
                                                    {regionWithDays.region.name}
                                                </span>
                                                <span className="text-sm text-gray-500 ml-2">
                                                    ({regionWithDays.region.nameJapanese})
                                                </span>
                                            </div>
                                        </div>
                                        <span className="font-medium text-red-600">
                                            {regionWithDays.days} {regionWithDays.days === 1 ? t('common.day') : t('common.days')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Travel Styles & Season */}
                        <div className="space-y-4">
                            {tripData.travelStyles.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">Travel Styles:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {tripData.travelStyles.map((style) => (
                                            <span 
                                                key={style.id}
                                                className="inline-flex items-center space-x-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm border border-red-200"
                                            >
                                                <span>{style.icon}</span>
                                                <span>{style.name}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {tripData.season && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Season:</span>
                                    <span className="font-medium">{tripData.season.name} ({tripData.season.nameJapanese})</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="text-center">
                    {isLoading ? (
                        <div className="space-y-6">
                            <div className="w-16 h-16 mx-auto border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            <div>
                                <h3 className="text-xl font-light text-gray-800 mb-2">
                                    {t('result.craftingExperience')}
                                </h3>
                                <p className="text-gray-600">
                                    {t('result.consideringDetails')}
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="space-y-6">
                            <div className="text-red-500 text-6xl">🚫</div>
                            <div className="max-w-md mx-auto">
                                <h3 className="text-xl font-light text-red-700 mb-4">
                                    AI Service Unavailable
                                </h3>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <p className="text-red-700 text-sm mb-2">{error}</p>
                                    <div className="text-xs text-red-600">
                                        <p className="mb-1">• The Gemini AI service may be temporarily down</p>
                                        <p className="mb-1">• Your API quota may have been exceeded</p>
                                        <p>• There may be a network connectivity issue</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => {
                                            setError(null);
                                            // Retry with same data
                                            if (tripData) {
                                                handleJapanTravelFormSubmit(tripData);
                                            }
                                        }}
                                        className="w-full px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        {t('common.tryAgain')}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setError(null);
                                            setTripData(null);
                                            // Clear the form state from localStorage
                                            try {
                                                localStorage.removeItem('japan-travel-form-state');
                                            } catch (error) {
                                                console.error('Error clearing form state:', error);
                                            }
                                        }}
                                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                        {t('common.startOver')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : itinerary ? (
                        <div className="space-y-6">
                            <div className="text-6xl mb-4">🌸</div>
                            <div>
                                <h3 className="text-2xl font-light text-gray-800 mb-4">
                                    {t('result.itineraryReady')}
                                </h3>
                                
                                {timeline ? (
                                    <div className="w-full">
                                        <TimelineView 
                                            timeline={timeline} 
                                            onTimelineUpdate={(updatedTimeline) => setTimeline(updatedTimeline)}
                                        />
                                    </div>
                                ) : null}
                                
                                {/* Raw AI Output for Testing */}
                                {showRawOutput && (itinerary || lastPrompt) && (
                                    <div className="mt-6 max-w-4xl mx-auto">
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-lg font-medium text-gray-800">AI Debugging (Testing)</h4>
                                                <button
                                                    onClick={() => setShowRawOutput(false)}
                                                    className="text-gray-500 hover:text-gray-700 text-sm"
                                                >
                                                    ✕ Close
                                                </button>
                                            </div>
                                            
                                            {/* Prompt Section */}
                                            {lastPrompt && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">📝 Prompt Sent to AI:</h5>
                                                    <div className="bg-blue-50 border border-blue-200 rounded p-3 max-h-48 overflow-y-auto">
                                                        <pre className="text-xs text-blue-800 whitespace-pre-wrap font-mono">
                                                            {lastPrompt}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Response Section */}
                                            {itinerary && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">🤖 AI Response:</h5>
                                                    <div className="bg-white border rounded p-3 max-h-96 overflow-y-auto">
                                                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                                            {itinerary}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="mt-3 text-xs text-gray-500">
                                                💡 This shows both the prompt we send and the raw response from the AI for debugging.
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mt-6 space-y-4">
                                    {/* Save Trip Button */}
                                    {tripData && timeline && (
                                        <SaveTripButton 
                                            formData={tripData}
                                            timeline={timeline}
                                            onSaved={(tripId) => {
                                                console.log('Trip saved with ID:', tripId);
                                            }}
                                        />
                                    )}
                                    
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button 
                                            onClick={() => setShowRawOutput(!showRawOutput)}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm"
                                        >
                                            {showRawOutput ? 'Hide' : 'Show'} AI Debug Info
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setItinerary(null);
                                                setTimeline(null);
                                                setTripData(null);
                                                setShowRawOutput(false);
                                                setLastPrompt(null);
                                                // Clear the form state from localStorage
                                                try {
                                                    localStorage.removeItem('japan-travel-form-state');
                                                } catch (error) {
                                                    console.error('Error clearing form state:', error);
                                                }
                                            }}
                                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            {t('common.startOver')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-6xl">🎌</div>
                            <div>
                                <h3 className="text-xl font-light text-gray-800 mb-2">
                                    {t('result.readyToExplore')}
                                </h3>
                                <p className="text-gray-600">
                                    {t('result.journeyDetailsLookPerfect')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <AuthDebug />
        </div>
    );
}