'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimelineActivity } from '@/types/travel';
import { photoService, PhotoResult } from '@/lib/photoService';

interface ActivityDetailModalProps {
    activity: TimelineActivity | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updates: Partial<TimelineActivity>) => void;
}

export default function ActivityDetailModal({ activity, isOpen, onClose }: ActivityDetailModalProps) {
    const [photo, setPhoto] = useState<PhotoResult | null>(null);
    const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState(false);

    // Load photo when activity changes
    useEffect(() => {
        if (!activity || !isOpen) return;

        // If activity already has imageUrl, use it
        if (activity.imageUrl) {
            setPhoto({
                url: activity.imageUrl,
                width: 800,
                height: 600,
                source: 'cached'
            });
            return;
        }

        // If we have photoSearchTerms, fetch photo
        if (activity.photoSearchTerms) {
            setIsLoadingPhoto(true);
            setPhotoError(false);
            
            photoService.getActivityPhoto({
                searchTerms: activity.photoSearchTerms,
                location: activity.location,
                type: activity.type,
                placeId: activity.placeId
            }).then((result) => {
                setPhoto(result);
                setIsLoadingPhoto(false);
            }).catch((error) => {
                console.error('Failed to load photo:', error);
                setPhotoError(true);
                setIsLoadingPhoto(false);
                // Set fallback photo
                setPhoto({
                    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
                    width: 800,
                    height: 600,
                    source: 'fallback'
                });
            });
        }
    }, [activity, isOpen]);

    if (!activity) return null;

    const getActivityTypeColor = (type: TimelineActivity['type']) => {
        switch (type) {
            case 'attraction':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'meal':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'transport':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'accommodation':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'experience':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${mins}m`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Minimalist Blur Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        <div 
                            className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-3xl">{activity.icon}</span>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800">
                                                {activity.name}
                                            </h2>
                                            {activity.nameJapanese && (
                                                <p className="text-sm text-gray-500 mt-1">{activity.nameJapanese}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Hero Photo Section */}
                            {(photo || isLoadingPhoto) && (
                                <div className="relative h-64 bg-gray-100 overflow-hidden">
                                    {isLoadingPhoto && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                            <div className="flex flex-col items-center space-y-3">
                                                <div className="w-8 h-8 border-3 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                                                <p className="text-sm text-gray-500">Loading photo...</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {photo && !isLoadingPhoto && (
                                        <>
                                            <img
                                                src={photo.url}
                                                alt={activity.name}
                                                className="w-full h-full object-cover"
                                                onError={() => setPhotoError(true)}
                                            />
                                            
                                            {/* Photo overlay with source attribution */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                                                <div className="flex items-center justify-between text-white text-xs">
                                                    <span className="opacity-75">
                                                        {photo.source === 'unsplash' && '📸 Unsplash'}
                                                        {photo.source === 'fallback' && '🌸 Stock Photo'}
                                                        {photo.source === 'cached' && '💾 Cached'}
                                                    </span>
                                                    {photo.attribution && (
                                                        <span className="opacity-60 max-w-48 truncate">
                                                            {photo.attribution}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {photoError && !isLoadingPhoto && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                            <div className="flex flex-col items-center space-y-2 text-gray-400">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm">Photo unavailable</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Activity Type Badge */}
                                <div className="flex justify-center">
                                    <div className={`px-4 py-2 rounded-full border font-medium ${getActivityTypeColor(activity.type)}`}>
                                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Description</h3>
                                    <p className="text-gray-600 leading-relaxed">{activity.description}</p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-800">Duration</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900">{formatDuration(activity.duration)}</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-800">Start Time</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900">{activity.startTime}</p>
                                    </div>

                                    {activity.estimatedCost && (
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                                <span className="text-sm font-medium text-green-800">Cost</span>
                                            </div>
                                            <p className="text-lg font-semibold text-green-900">¥{activity.estimatedCost.toLocaleString()}</p>
                                        </div>
                                    )}

                                    {activity.location && (
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-sm font-medium text-blue-800">Location</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const searchQuery = encodeURIComponent(`${activity.location}, Japan`);
                                                    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
                                                    window.open(googleMapsUrl, '_blank');
                                                }}
                                                className="text-left w-full group hover:bg-blue-100 rounded-md p-1 transition-colors"
                                            >
                                                <p className="text-sm text-blue-900 group-hover:text-blue-700 group-hover:underline flex items-center">
                                                    {activity.location}
                                                    <svg className="w-3 h-3 ml-1 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </p>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                {activity.notes && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">Notes</h3>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <p className="text-yellow-800 italic">{activity.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => {
                                            // TODO: Implement edit functionality
                                            onClose();
                                        }}
                                        className="flex-1 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Edit Activity
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}