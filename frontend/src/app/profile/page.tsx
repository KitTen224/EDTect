'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/ui/Header';
import { User, Save, ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Profile data - simplified to just essentials
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [language, setLanguage] = useState<'en' | 'ja'>('en');
    
    // Get return URL from query params
    const returnUrl = searchParams.get('returnUrl') || '/';

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=/profile');
            return;
        }

        if (status === 'authenticated' && session?.user) {
            // Initialize form with user data
            setName(session.user.name || '');
            setEmail(session.user.email || '');
            
            // Load user preferences from localStorage or API
            loadUserProfile();
        }
    }, [status, session, router]);

    const loadUserProfile = async () => {
        setIsLoading(true);
        try {
            // Load language preference from localStorage
            const savedLanguage = localStorage.getItem('user-language') as 'en' | 'ja';
            if (savedLanguage) {
                setLanguage(savedLanguage);
            }
            
            // TODO: Implement API call to load user profile data from database
            // For now, we just use the data from session and localStorage
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveProfile = async () => {
        setIsSaving(true);
        try {
            // Save language preference to localStorage
            localStorage.setItem('user-language', language);
            
            // TODO: Implement API call to save user profile name changes
            // For now, just simulate the API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // After successful save, redirect back to where user came from
            router.push(returnUrl);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
            setIsSaving(false);
        }
        // Note: We don't set isSaving to false here because we're redirecting
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
                    onClick={() => router.push(returnUrl)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                <Header 
                    title="Profile Settings"
                    subtitle="Update your account information"
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
                                    placeholder="Enter your display name"
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
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-center">
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
                            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}