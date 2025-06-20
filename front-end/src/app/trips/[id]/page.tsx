'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import TimelineView from '@/components/TimelineView';
import { SavedTrip } from '@/types/travel';
import { ArrowLeft, Calendar, MapPin, Clock, Edit, Share, Trash2 } from 'lucide-react';

export default function TripDetailPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const tripId = params.id as string;
    
    const [trip, setTrip] = useState<SavedTrip | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchTrip = useCallback(async () => {
        try {
            const response = await fetch(`/api/trips/${tripId}`);
            if (response.ok) {
                const tripData = await response.json();
                setTrip(tripData);
            } else if (response.status === 404) {
                setError('Trip not found');
            } else {
                setError('Failed to load trip');
            }
        } catch (error) {
            console.error('Error fetching trip:', error);
            setError('Failed to load trip');
        } finally {
            setIsLoading(false);
        }
    }, [tripId]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=/trips');
            return;
        }

        if (status === 'authenticated' && tripId) {
            fetchTrip();
        }
    }, [status, router, tripId, fetchTrip]);

    const deleteTrip = async () => {
        if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/trips/${tripId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/trips');
            } else {
                alert('Failed to delete trip. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting trip:', error);
            alert('Failed to delete trip. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const shareTrip = async () => {
        if (!trip) return;

        if (trip.is_public && trip.share_token) {
            const shareUrl = `${window.location.origin}/shared/${trip.share_token}`;
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert('Share link copied to clipboard!');
            } catch {
                // Fallback for browsers that don't support clipboard API
                prompt('Copy this link to share your trip:', shareUrl);
            }
        } else {
            // Make trip public and generate share token
            try {
                const response = await fetch(`/api/trips/${tripId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ is_public: true }),
                });

                if (response.ok) {
                    const updatedTrip = await response.json();
                    setTrip(updatedTrip);
                    if (updatedTrip.share_token) {
                        const shareUrl = `${window.location.origin}/shared/${updatedTrip.share_token}`;
                        await navigator.clipboard.writeText(shareUrl);
                        alert('Trip made public and share link copied to clipboard!');
                    }
                } else {
                    alert('Failed to make trip public. Please try again.');
                }
            } catch (error) {
                console.error('Error sharing trip:', error);
                alert('Failed to share trip. Please try again.');
            }
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
                        <div className="h-6 bg-gray-200 rounded mb-8 w-1/2"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null; // Will redirect
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-light text-gray-800 mb-4">{error}</h2>
                    <button
                        onClick={() => router.push('/trips')}
                        className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                        Back to My Trips
                    </button>
                </div>
            </div>
        );
    }

    if (!trip) {
        return null;
    }

    const isOwner = session?.user?.id === trip.user_id;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                {/* Trip Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">
                                {trip.title}
                            </h1>
                            {trip.description && (
                                <p className="text-lg text-gray-600 mb-4">
                                    {trip.description}
                                </p>
                            )}
                        </div>
                        
                        {isOwner && (
                            <div className="flex space-x-2 mt-4 md:mt-0">
                                <button
                                    onClick={() => router.push(`/trips/${trip.id}/edit`)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                                
                                <button
                                    onClick={shareTrip}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                                >
                                    <Share className="w-4 h-4" />
                                    <span>{trip.is_public ? 'Copy Link' : 'Share'}</span>
                                </button>
                                
                                <button
                                    onClick={deleteTrip}
                                    disabled={isDeleting}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                                </button>
                            </div>
                        )}
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
                </motion.div>

                {/* Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <TimelineView 
                        timeline={trip.timeline_data}
                        onTimelineUpdate={(updatedTimeline) => {
                            if (isOwner) {
                                // Auto-save changes if user is owner
                                setTrip({ ...trip, timeline_data: updatedTimeline });
                                // TODO: Implement auto-save functionality
                            }
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
}