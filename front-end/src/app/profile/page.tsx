'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/ui/Header';
import { User, Save, ArrowLeft } from 'lucide-react';

// Import the travel data from JapanTravelForm
const japanRegions = [
    { id: 'kanto', name: 'Kantō', nameJapanese: '関東', icon: '🏙️' },
    { id: 'kansai', name: 'Kansai', nameJapanese: '関西', icon: '⛩️' },
    { id: 'chubu', name: 'Chūbu', nameJapanese: '中部', icon: '🗻' },
    { id: 'tohoku', name: 'Tōhoku', nameJapanese: '東北', icon: '🌸' },
    { id: 'kyushu', name: 'Kyūshū', nameJapanese: '九州', icon: '🌺' },
    { id: 'hokkaido', name: 'Hokkaidō', nameJapanese: '北海道', icon: '❄️' }
];

const travelStyles = [
    { id: 'traditional', name: 'Traditional', nameJapanese: '伝統的', icon: '⛩️' },
    { id: 'modern', name: 'Modern', nameJapanese: '現代的', icon: '🏙️' },
    { id: 'nature', name: 'Nature', nameJapanese: '自然', icon: '🌿' },
    { id: 'spiritual', name: 'Spiritual', nameJapanese: '精神的', icon: '🧘' },
    { id: 'foodie', name: 'Culinary', nameJapanese: '料理', icon: '🍜' },
    { id: 'ryokan', name: 'Ryokan', nameJapanese: '旅館', icon: '🏨' }
];

const seasons = [
    { id: 'spring', name: 'Spring', nameJapanese: '春', description: 'Cherry blossoms and mild weather' },
    { id: 'summer', name: 'Summer', nameJapanese: '夏', description: 'Festivals and vibrant energy' },
    { id: 'autumn', name: 'Autumn', nameJapanese: '秋', description: 'Fall foliage and comfortable temperatures' },
    { id: 'winter', name: 'Winter', nameJapanese: '冬', description: 'Snow, hot springs, and winter illuminations' }
];

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Profile data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [language, setLanguage] = useState<'en' | 'ja'>('en');
    const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');
    const [budgetPreference, setBudgetPreference] = useState<'budget' | 'moderate' | 'luxury'>('moderate');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    
    // Travel preferences
    const [preferredRegions, setPreferredRegions] = useState<string[]>([]);
    const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
    const [preferredSeasons, setPreferredSeasons] = useState<string[]>([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=/profile');
            return;
        }

        if (status === 'authenticated' && session?.user) {
            // Initialize form with user data
            setName(session.user.name || '');
            setEmail(session.user.email || '');
            
            // Load user preferences from database
            loadUserProfile();
        }
    }, [status, session, router]);

    const loadUserProfile = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/user/profile');
            if (!response.ok) {
                throw new Error('Failed to load profile');
            }
            
            const profile = await response.json();
            console.log('Loaded profile:', profile);
            
            // Update form fields with loaded data
            setName(profile.name || '');
            setEmail(profile.email || '');
            setLanguage(profile.language || 'en');
            setExperienceLevel(profile.experience_level || 'beginner');
            setBudgetPreference(profile.budget_preference || 'moderate');
            setNotificationsEnabled(profile.notifications_enabled ?? true);
            setPreferredRegions(profile.preferred_regions || []);
            setPreferredStyles(profile.preferred_styles || []);
            setPreferredSeasons(profile.preferred_seasons || []);
        } catch (error) {
            console.error('Error loading profile:', error);
            // Keep default values on error
        } finally {
            setIsLoading(false);
        }
    };

    const saveProfile = async () => {
        setIsSaving(true);
        try {
            const profileData = {
                name,
                language,
                experienceLevel,
                budgetPreference,
                notificationsEnabled,
                preferredRegions,
                preferredStyles,
                preferredSeasons
            };

            console.log('Saving profile:', profileData);

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to save profile');
            }

            const savedProfile = await response.json();
            console.log('Profile saved successfully:', savedProfile);
            alert('Profile saved successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save profile. Please try again.';
            alert(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleRegion = (regionId: string) => {
        setPreferredRegions(prev => 
            prev.includes(regionId) 
                ? prev.filter(id => id !== regionId)
                : [...prev, regionId]
        );
    };

    const toggleStyle = (styleId: string) => {
        setPreferredStyles(prev => 
            prev.includes(styleId) 
                ? prev.filter(id => id !== styleId)
                : [...prev, styleId]
        );
    };

    const toggleSeason = (seasonId: string) => {
        setPreferredSeasons(prev => 
            prev.includes(seasonId) 
                ? prev.filter(id => id !== seasonId)
                : [...prev, seasonId]
        );
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
                <div className="container mx-auto px-4 py-8 max-w-2xl">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
                        <div className="h-6 bg-gray-200 rounded mb-8 w-1/2"></div>
                        <div className="space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                <Header 
                    title="Profile Settings"
                    subtitle="Customize your Japan travel preferences"
                    showAuth={false}
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Account Information */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center space-x-2">
                            <User className="w-5 h-5" />
                            <span>Account Information</span>
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Email cannot be changed here. Contact support if needed.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Travel Preferences */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <h3 className="text-xl font-medium text-gray-800 mb-4">
                            Travel Preferences
                        </h3>
                        
                        <div className="space-y-6">
                            {/* Experience Level */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Japan Travel Experience
                                </label>
                                <select
                                    value={experienceLevel}
                                    onChange={(e) => setExperienceLevel(e.target.value as 'beginner' | 'intermediate' | 'expert')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                >
                                    <option value="beginner">Beginner - First time in Japan</option>
                                    <option value="intermediate">Intermediate - Been to Japan before</option>
                                    <option value="expert">Expert - Very familiar with Japan</option>
                                </select>
                            </div>

                            {/* Budget Preference */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Budget Preference
                                </label>
                                <select
                                    value={budgetPreference}
                                    onChange={(e) => setBudgetPreference(e.target.value as 'budget' | 'moderate' | 'luxury')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                >
                                    <option value="budget">Budget - Economical options</option>
                                    <option value="moderate">Moderate - Balanced comfort and cost</option>
                                    <option value="luxury">Luxury - Premium experiences</option>
                                </select>
                            </div>

                            {/* Language Preference */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Interface Language
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as 'en' | 'ja')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                >
                                    <option value="en">English</option>
                                    <option value="ja">日本語 (Japanese)</option>
                                </select>
                            </div>

                            {/* Preferred Regions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Preferred Regions
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {japanRegions.map((region) => (
                                        <button
                                            key={region.id}
                                            onClick={() => toggleRegion(region.id)}
                                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                                                preferredRegions.includes(region.id)
                                                    ? 'border-red-400 bg-red-50'
                                                    : 'border-gray-300 bg-white hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg">{region.icon}</span>
                                                <span className="font-medium">{region.name}</span>
                                            </div>
                                            <div className="text-sm text-gray-600">{region.nameJapanese}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preferred Travel Styles */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Preferred Travel Styles
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {travelStyles.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => toggleStyle(style.id)}
                                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                                                preferredStyles.includes(style.id)
                                                    ? 'border-red-400 bg-red-50'
                                                    : 'border-gray-300 bg-white hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg">{style.icon}</span>
                                                <span className="font-medium">{style.name}</span>
                                            </div>
                                            <div className="text-sm text-gray-600">{style.nameJapanese}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preferred Seasons */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Preferred Seasons
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {seasons.map((season) => (
                                        <button
                                            key={season.id}
                                            onClick={() => toggleSeason(season.id)}
                                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                                                preferredSeasons.includes(season.id)
                                                    ? 'border-red-400 bg-red-50'
                                                    : 'border-gray-300 bg-white hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="font-medium">{season.name}</div>
                                            <div className="text-sm text-gray-600">{season.nameJapanese}</div>
                                            <div className="text-xs text-gray-500 mt-1">{season.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <h3 className="text-xl font-medium text-gray-800 mb-4">
                            Notification Settings
                        </h3>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-800">Email Notifications</p>
                                <p className="text-sm text-gray-600">Receive updates about new features and travel tips</p>
                            </div>
                            <button
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    notificationsEnabled ? 'bg-red-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={saveProfile}
                            disabled={isSaving}
                            className="flex items-center space-x-2 px-8 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}