'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import TimelineView from '@/components/TimelineView';
import { SavedTrip } from '@/types/travel';
import { ArrowLeft, Calendar, MapPin, Clock, Globe, Eye } from 'lucide-react';

export default function SharedTripPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;
    
    const [trip, setTrip] = useState<SavedTrip | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSharedTrip = async () => {
            if (!token) {
                setError('Invalid share link');
                setIsLoading(false);
                return;
            }

            try {
                // Create a custom API endpoint for shared trips that doesn't require authentication
                const response = await fetch(`/api/trips/shared/${token}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const tripData = await response.json();
                    setTrip(tripData);
                } else if (response.status === 404) {
                    setError('This trip link is no longer valid or has been made private');
                } else {
                    setError('Failed to load shared trip');
                }
            } catch (error) {
                console.error('Error fetching shared trip:', error);
                setError('Failed to load shared trip');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSharedTrip();
    }, [token]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading shared trip...</p>
                        <p className="text-xs text-gray-400 mt-2">This should only take a moment</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="text-6xl mb-6">🔗</div>
                    <h2 className="text-2xl font-light text-gray-800 mb-4">
                        {error}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        The trip you're looking for might have been removed or made private by its owner.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                            Plan Your Own Trip
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!trip) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>

                    {/* Shared Trip Indicator */}
                    <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        <Globe className="w-4 h-4" />
                        <span>Shared Trip</span>
                    </div>
                </div>

                {/* Trip Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">
                            {trip.title}
                        </h1>
                        {trip.description && (
                            <p className="text-lg text-gray-600 mb-4">
                                {trip.description}
                            </p>
                        )}
                        
                        {/* Attribution */}
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                            <Eye className="w-4 h-4" />
                            <span>Shared publicly • View only</span>
                        </div>
                    </div>

                    {/* Trip Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="w-5 h-5" />
                            <span>{trip.total_duration} days</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-600">
                            <MapPin className="w-5 h-5" />
                            <span>{trip.regions.map(r => r.region.name).join(', ')}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="w-5 h-5" />
                            <span>Created {formatDate(trip.created_at)}</span>
                        </div>
                    </div>

                    {/* Travel Styles */}
                    {trip.travel_styles.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Travel Styles:</h3>
                            <div className="flex flex-wrap gap-2">
                                {trip.travel_styles.map((style) => (
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

                    {/* Cost Information */}
                    {trip.total_estimated_cost && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-medium text-gray-600 mb-1">Estimated Total Cost:</h3>
                            <p className="text-2xl font-light text-gray-800">
                                ¥{trip.total_estimated_cost.toLocaleString()}
                            </p>
                        </div>
                    )}

                    {/* Call to Action for Visitors */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-red-800 mb-1">Like this itinerary?</h3>
                                <p className="text-sm text-red-700">Create your own personalized Japan journey</p>
                            </div>
                            <button
                                onClick={() => router.push('/')}
                                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors whitespace-nowrap"
                            >
                                Plan My Trip
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Timeline - Read Only */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <TimelineView 
                        timeline={trip.timeline_data}
                        onTimelineUpdate={() => {
                            // No-op for shared trips - they are read-only
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
}