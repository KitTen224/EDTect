'use client';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Bookmark, Check } from 'lucide-react';
import { JapanTravelFormData, JapanTimeline } from '@/types/travel';
import { useAuth } from '@/contexts/AuthContext';

interface SaveTripButtonProps {
    formData: JapanTravelFormData;
    timeline: JapanTimeline;
    onSaved?: (tripId: string) => void;
}

export function SaveTripButton({ formData, timeline, onSaved }: SaveTripButtonProps) {
    const { user, isLoading: authLoading, token } = useAuth();
    const [isLoading, setSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showTitleInput, setShowTitleInput] = useState(false);
    const [title, setTitle] = useState('');

    if (authLoading) {
        return <div className="w-full h-12 bg-gray-200 rounded-full animate-pulse"></div>;
    }

    if (!user) {
        return (
            <button
                onClick={() => window.location.href = '/auth'}
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
    const requestBody = {
      title: title.trim(),
      description: `${timeline.totalDuration}-day journey through ${formData.regions.map(r => r.region.name).join(', ')}`,
      form_data: formData,
      timeline_data: timeline,
      total_duration: timeline.totalDuration,
    };

    // ✅ Get CSRF token first
    await fetch('http://localhost:8000/sanctum/csrf-cookie', {
      credentials: 'include',
    });

    const xsrfToken = Cookies.get('XSRF-TOKEN');


   const response = await fetch('http://localhost:8000/api/trips', {
  method: 'POST',
  credentials: 'include',        // send the Laravel session cookie
  headers: {
    'Content-Type': 'application/json',
    "Accept": "application/json",  
    'X-XSRF-TOKEN': xsrfToken || '',
  },
  body: JSON.stringify(requestBody),
});
    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = 'Failed to save trip';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorMessage;
        console.error('❌ Server error:', errorData);
      } catch (e) {
        console.error('❌ Response parsing error:', e);
        console.error('❌ Raw response:', responseText);
      }
      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const savedTrip = JSON.parse(responseText);
    console.log('✅ Trip saved successfully:', savedTrip.id);

    setIsSaved(true);
    setShowTitleInput(false);
    onSaved?.(savedTrip.id);

    setTimeout(() => {
      setIsSaved(false);
      setTitle('');
    }, 3000);
  } catch (error) {
    console.error('❌ Save trip error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    alert(`Failed to save trip: ${errorMessage}`);
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
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
