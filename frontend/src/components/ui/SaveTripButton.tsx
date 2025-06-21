'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Save, Bookmark, Check } from 'lucide-react';
import { JapanTravelFormData, JapanTimeline } from '@/types/travel';

interface SaveTripButtonProps {
    formData: JapanTravelFormData;
    timeline: JapanTimeline;
    onSaved?: (tripId: string) => void;
}

export function SaveTripButton({ formData, timeline, onSaved }: SaveTripButtonProps) {
    const { data: session, status } = useSession();
    const [isLoading, setSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showTitleInput, setShowTitleInput] = useState(false);
    const [title, setTitle] = useState('');

    if (status === 'loading') {
        return (
            <div className="w-full h-12 bg-gray-200 rounded-full animate-pulse"></div>
        );
    }

    if (!session) {
        return (
            <button
                onClick={() => window.location.href = '/auth/signin'}
                className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors border border-red-200"
            >
                <Bookmark className="w-5 h-5" />
                <span>Sign in to save this trip</span>
            </button>
        );
    }

    const handleSave = async () => {
        if (!title.trim()) return;
        
        setSaving(true);
        try {
            const response = await fetch('/api/trips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: `${timeline.totalDuration}-day journey through ${formData.regions.map(r => r.region.name).join(', ')}`,
                    form_data: formData,
                    timeline_data: timeline,
                    is_public: false
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save trip');
            }

            const savedTrip = await response.json();
            setIsSaved(true);
            setShowTitleInput(false);
            onSaved?.(savedTrip.id);
            
            // Reset after showing success
            setTimeout(() => {
                setIsSaved(false);
                setTitle('');
            }, 3000);
        } catch (error) {
            console.error('Error saving trip:', error);
            alert('Failed to save trip. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (isSaved) {
        return (
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-green-100 text-green-700 rounded-full border border-green-200"
            >
                <Check className="w-5 h-5" />
                <span>Trip saved successfully!</span>
            </motion.div>
        );
    }

    if (showTitleInput) {
        return (
            <div className="w-full space-y-3">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your trip a name..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                    autoFocus
                />
                <div className="flex space-x-2">
                    <button
                        onClick={handleSave}
                        disabled={!title.trim() || isLoading}
                        className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>{isLoading ? 'Saving...' : 'Save Trip'}</span>
                    </button>
                    <button
                        onClick={() => setShowTitleInput(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowTitleInput(true)}
            className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
        >
            <Bookmark className="w-5 h-5" />
            <span>Save this trip</span>
        </button>
    );
}