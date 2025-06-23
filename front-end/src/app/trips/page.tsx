'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/ui/Header';
import { SavedTrip } from '@/types/travel';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, MapPin, Clock, Trash2, Eye, Edit, Share } from 'lucide-react';

export default function TripsPage() {
    const { user, isLoading: authLoading, token } = useAuth();
    const router = useRouter();
    const [trips, setTrips] = useState<SavedTrip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingTrip, setDeletingTrip] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth');
            return;
        }

        if (user && token) {
            fetchTrips();
        }
    }, [user, authLoading, token, router]);

    const fetchTrips = async () => {
        try {
            const response = await fetch('/api/trips', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTrips(data.trips);
            }
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteTrip = async (tripId: string) => {
        if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
            return;
        }

        setDeletingTrip(tripId);
        try {
            const response = await fetch(`/api/trips/${tripId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setTrips(trips.filter(trip => trip.id !== tripId));
            } else {
                alert('Failed to delete trip. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting trip:', error);
            alert('Failed to delete trip. Please try again.');
        } finally {
            setDeletingTrip(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <Header subtitle="Your saved Japan travel plans" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <Header subtitle="Your saved Japan travel plans" />

                {trips.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="text-6xl mb-6">🎌</div>
                        <h3 className="text-2xl font-light text-gray-800 mb-4">
                            No trips saved yet
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Start planning your perfect Japan journey and save your itineraries to access them anytime.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-8 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                            Plan Your First Trip
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {trips.map((trip) => (
                                <motion.div
                                    key={trip.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                                >
                                    {/* Trip Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-medium text-gray-800 mb-2 line-clamp-2">
                                                {trip.title}
                                            </h3>
                                            {trip.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {trip.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-1 ml-2">
                                            {trip.travel_styles?.slice(0, 2).map((style) => (
                                                <span key={style.id} className="text-lg">
                                                    {style.icon}
                                                </span>
                                            )) || <span className="text-lg">🎌</span>}
                                        </div>
                                    </div>

                                    {/* Trip Details */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>{trip.total_duration} days</span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span className="line-clamp-1">
                                                {trip.regions?.map(r => r.region.name).join(', ') || 'Japan'}
                                            </span>
                                        </div>

                                        {trip.total_estimated_cost && (
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <span className="text-lg">¥</span>
                                                <span>{trip.total_estimated_cost.toLocaleString()}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Created {formatDate(trip.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => router.push(`/trips/${trip.id}`)}
                                            className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>View Trip</span>
                                        </button>
                                        
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => router.push(`/trips/${trip.id}/edit`)}
                                                className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
                                            >
                                                <Edit className="w-3 h-3" />
                                                <span>Edit</span>
                                            </button>
                                            
                                            {trip.is_public && trip.share_token && (
                                                <button
                                                    onClick={() => {
                                                        const shareUrl = `${window.location.origin}/shared/${trip.share_token}`;
                                                        navigator.clipboard.writeText(shareUrl);
                                                        alert('Share link copied to clipboard!');
                                                    }}
                                                    className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm"
                                                >
                                                    <Share className="w-3 h-3" />
                                                    <span>Share</span>
                                                </button>
                                            )}
                                            
                                            <button
                                                onClick={() => deleteTrip(trip.id)}
                                                disabled={deletingTrip === trip.id}
                                                className="flex items-center justify-center py-2 px-3 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50 text-sm"
                                            >
                                                {deletingTrip === trip.id ? (
                                                    <div className="w-3 h-3 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Trash2 className="w-3 h-3" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Create New Trip Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="fixed bottom-8 right-8"
                >
                    <button
                        onClick={() => router.push('/')}
                        className="w-14 h-14 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                        <span className="text-2xl">+</span>
                    </button>
                </motion.div>
            </div>
        </div>
    );
}