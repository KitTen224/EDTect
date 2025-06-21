'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JapanTravelFormData, JapanRegion, JapanTravelStyle, JapanSeason, RegionWithDays } from '@/types/travel';
import { Header } from './ui/Header';

// Japan regions data
const japanRegions: JapanRegion[] = [
    {
        id: 'kanto',
        name: 'Kantō',
        nameJapanese: '関東',
        description: 'Tokyo, modern culture, and urban experiences',
        icon: '🏙️',
        prefecture: ['Tokyo', 'Kanagawa', 'Chiba', 'Saitama', 'Ibaraki', 'Tochigi', 'Gunma']
    },
    {
        id: 'kansai',
        name: 'Kansai',
        nameJapanese: '関西',
        description: 'Kyoto, Osaka, traditional culture and history',
        icon: '⛩️',
        prefecture: ['Osaka', 'Kyoto', 'Hyogo', 'Nara', 'Wakayama', 'Shiga']
    },
    {
        id: 'chubu',
        name: 'Chūbu',
        nameJapanese: '中部',
        description: 'Mount Fuji, Japanese Alps, and nature',
        icon: '🗻',
        prefecture: ['Aichi', 'Gifu', 'Shizuoka', 'Nagano', 'Yamanashi', 'Fukui', 'Ishikawa', 'Toyama', 'Niigata']
    },
    {
        id: 'tohoku',
        name: 'Tōhoku',
        nameJapanese: '東北',
        description: 'Northern beauty, hot springs, and festivals',
        icon: '🌸',
        prefecture: ['Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima']
    },
    {
        id: 'kyushu',
        name: 'Kyūshū',
        nameJapanese: '九州',
        description: 'Southern islands, hot springs, and unique culture',
        icon: '🌺',
        prefecture: ['Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima']
    },
    {
        id: 'hokkaido',
        name: 'Hokkaidō',
        nameJapanese: '北海道',
        description: 'Snow, skiing, fresh seafood, and wilderness',
        icon: '❄️',
        prefecture: ['Hokkaido']
    }
];

// Travel styles
const travelStyles: JapanTravelStyle[] = [
    {
        id: 'traditional',
        name: 'Traditional',
        nameJapanese: '伝統的',
        description: 'Temples, tea ceremonies, and classical culture',
        icon: '🏮'
    },
    {
        id: 'modern',
        name: 'Modern',
        nameJapanese: '現代的',
        description: 'Technology, pop culture, and urban exploration',
        icon: '🎌'
    },
    {
        id: 'nature',
        name: 'Nature',
        nameJapanese: '自然',
        description: 'Mountains, forests, and outdoor adventures',
        icon: '🍃'
    },
    {
        id: 'spiritual',
        name: 'Spiritual',
        nameJapanese: '精神的',
        description: 'Meditation, temples, and inner peace',
        icon: '🧘'
    },
    {
        id: 'foodie',
        name: 'Culinary',
        nameJapanese: '料理',
        description: 'Local cuisine, street food, and dining experiences',
        icon: '🍜'
    },
    {
        id: 'ryokan',
        name: 'Ryokan',
        nameJapanese: '旅館',
        description: 'Traditional inns, hot springs, and hospitality',
        icon: '🏯'
    }
];

// Seasons
const seasons: JapanSeason[] = [
    {
        id: 'spring',
        name: 'Spring',
        nameJapanese: '春',
        description: 'Cherry blossoms and mild weather',
        highlights: ['Sakura viewing', 'Hanami parties', 'Perfect temperatures']
    },
    {
        id: 'summer',
        name: 'Summer',
        nameJapanese: '夏',
        description: 'Festivals and beach season',
        highlights: ['Matsuri festivals', 'Fireworks', 'Beach activities']
    },
    {
        id: 'autumn',
        name: 'Autumn',
        nameJapanese: '秋',
        description: 'Fall foliage and comfortable weather',
        highlights: ['Koyo viewing', 'Harvest season', 'Clear skies']
    },
    {
        id: 'winter',
        name: 'Winter',
        nameJapanese: '冬',
        description: 'Snow festivals and hot springs',
        highlights: ['Snow festivals', 'Onsen season', 'Winter illuminations']
    }
];

interface JapanTravelFormProps {
    onSubmit: (data: JapanTravelFormData) => void;
    isLoading?: boolean;
}

export default function JapanTravelForm({ onSubmit, isLoading = false }: JapanTravelFormProps) {
    const [selectedRegions, setSelectedRegions] = useState<RegionWithDays[]>([]);
    const [selectedStyles, setSelectedStyles] = useState<JapanTravelStyle[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<JapanSeason | null>(null);
    const [step, setStep] = useState<'region' | 'ordering' | 'style' | 'season' | 'summary'>('region');

    const STORAGE_KEY = 'japan-travel-form-state';

    // Load state from localStorage on component mount
    useEffect(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                if (parsedState.selectedRegions && parsedState.selectedRegions.length > 0) {
                    setSelectedRegions(parsedState.selectedRegions);
                }
                if (parsedState.selectedStyles && parsedState.selectedStyles.length > 0) {
                    setSelectedStyles(parsedState.selectedStyles);
                }
                if (parsedState.selectedSeason) {
                    setSelectedSeason(parsedState.selectedSeason);
                }
                if (parsedState.step && parsedState.step !== 'region') {
                    setStep(parsedState.step);
                }
            }
        } catch (error) {
            console.error('Error loading form state from localStorage:', error);
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            const stateToSave = {
                selectedRegions,
                selectedStyles,
                selectedSeason,
                step
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Error saving form state to localStorage:', error);
        }
    }, [selectedRegions, selectedStyles, selectedSeason, step]);

    const totalDays = selectedRegions.reduce((sum, regionWithDays) => sum + regionWithDays.days, 0);
    const maxDays = 7;

    const handleRegionToggle = (region: JapanRegion) => {
        const existingIndex = selectedRegions.findIndex(rwd => rwd.region.id === region.id);
        
        if (existingIndex >= 0) {
            // Remove region
            setSelectedRegions(selectedRegions.filter((_, index) => index !== existingIndex));
        } else {
            // Add region with 1 day (if we have space)
            if (totalDays < maxDays) {
                setSelectedRegions([...selectedRegions, { region, days: 1 }]);
            }
        }
    };

    const updateRegionDays = (regionId: string, newDays: number) => {
        setSelectedRegions(selectedRegions.map(rwd => 
            rwd.region.id === regionId 
                ? { ...rwd, days: Math.max(1, Math.min(newDays, maxDays)) }
                : rwd
        ));
    };

    const handleStyleToggle = (style: JapanTravelStyle) => {
        const isSelected = selectedStyles.some(s => s.id === style.id);
        if (isSelected) {
            setSelectedStyles(selectedStyles.filter(s => s.id !== style.id));
        } else {
            setSelectedStyles([...selectedStyles, style]);
        }
    };

    const clearFormState = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing form state from localStorage:', error);
        }
    };

    const handleSubmit = () => {
        if (selectedRegions.length > 0 && totalDays > 0) {
            // Sort regions by their order before submitting
            const orderedRegions = [...selectedRegions].sort((a, b) => (a.order || 0) - (b.order || 0));
            
            const formData: JapanTravelFormData = {
                regions: orderedRegions,
                totalDuration: totalDays,
                travelStyles: selectedStyles,
                season: selectedSeason || undefined,
                interests: [] // We'll implement this later
            };
            
            onSubmit(formData);
            // Note: Form state will be cleared when user navigates to results page
        }
    };

    const canProceed = selectedRegions.length > 0 && totalDays > 0 && totalDays <= maxDays;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <Header />

                {/* Progress Indicator */}
                <div className="text-center mb-8">
                    <div className="flex justify-center space-x-2 mb-4">
                        {['region', 'ordering', 'style', 'season', 'summary'].map((stepName, index) => (
                            <div 
                                key={stepName}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    step === stepName ? 'bg-red-500 w-8' : 
                                    ['region', 'ordering', 'style', 'season'].indexOf(step) > index ? 'bg-red-300' : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                    
                    {/* Step Labels */}
                    <div className="text-sm text-gray-500 mb-2">
                        Step {['region', 'ordering', 'style', 'season', 'summary'].indexOf(step) + 1} of 5: {
                            step === 'region' ? 'Choose Regions' :
                            step === 'ordering' ? 'Order Regions' :
                            step === 'style' ? 'Travel Style' :
                            step === 'season' ? 'Select Season' :
                            'Review Journey'
                        }
                    </div>

                    {/* Start Over Button */}
                    {(selectedRegions.length > 0 || selectedStyles.length > 0 || selectedSeason || step !== 'region') && (
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to start over? This will clear all your selections.')) {
                                    setSelectedRegions([]);
                                    setSelectedStyles([]);
                                    setSelectedSeason(null);
                                    setStep('region');
                                    clearFormState();
                                }
                            }}
                            className="text-sm text-gray-400 hover:text-red-500 transition-colors underline"
                        >
                            Start Over
                        </button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Region Selection */}
                    {step === 'region' && (
                        <motion.div
                            key="region"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-light text-gray-800 mb-2">
                                    Which regions do you want to explore?
                                </h2>
                                <p className="text-gray-600">
                                    Select multiple regions for your journey (max 7 days total)
                                </p>
                                <div className="mt-3 text-sm text-gray-500">
                                    Total days: <span className="font-medium text-red-600">{totalDays}/{maxDays}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {japanRegions.map((region) => {
                                    const isSelected = selectedRegions.some(rwd => rwd.region.id === region.id);
                                    const canSelect = !isSelected && totalDays < maxDays;
                                    
                                    return (
                                        <motion.button
                                            key={region.id}
                                            onClick={() => handleRegionToggle(region)}
                                            disabled={!canSelect && !isSelected}
                                            className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left relative ${
                                                isSelected
                                                    ? 'border-red-400 bg-red-50 shadow-lg'
                                                    : canSelect
                                                    ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                                    : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                            }`}
                                            whileHover={canSelect || isSelected ? { scale: 1.02 } : {}}
                                            whileTap={canSelect || isSelected ? { scale: 0.98 } : {}}
                                        >
                                            <div className="text-3xl mb-3">{region.icon}</div>
                                            <h3 className="font-medium text-lg text-gray-800">
                                                {region.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-2">{region.nameJapanese}</p>
                                            <p className="text-sm text-gray-600">{region.description}</p>
                                            
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-medium"
                                                >
                                                    ✓
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Day Allocation Section */}
                            {selectedRegions.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 space-y-6"
                                >
                                    <div className="text-center">
                                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                                            How many days in each region?
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        {selectedRegions.map((regionWithDays) => (
                                            <motion.div
                                                key={regionWithDays.region.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-2xl">{regionWithDays.region.icon}</span>
                                                        <div>
                                                            <h4 className="font-medium text-gray-800">
                                                                {regionWithDays.region.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-500">
                                                                {regionWithDays.region.nameJapanese}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            onClick={() => updateRegionDays(regionWithDays.region.id, regionWithDays.days - 1)}
                                                            disabled={regionWithDays.days <= 1}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            -
                                                        </button>
                                                        
                                                        <span className="text-lg font-medium text-red-600 min-w-[3rem] text-center">
                                                            {regionWithDays.days} day{regionWithDays.days !== 1 ? 's' : ''}
                                                        </span>
                                                        
                                                        <button
                                                            onClick={() => updateRegionDays(regionWithDays.region.id, regionWithDays.days + 1)}
                                                            disabled={totalDays >= maxDays}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="text-center">
                                        <button
                                            onClick={() => {
                                                // Initialize order for selected regions
                                                const regionsWithOrder = selectedRegions.map((regionWithDays, index) => ({
                                                    ...regionWithDays,
                                                    order: index + 1
                                                }));
                                                setSelectedRegions(regionsWithOrder);
                                                setStep('ordering');
                                            }}
                                            disabled={totalDays === 0 || totalDays > maxDays}
                                            className={`px-8 py-3 rounded-full font-medium transition-colors ${
                                                totalDays > 0 && totalDays <= maxDays
                                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            Continue to Order Regions
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 2: Region Ordering */}
                    {step === 'ordering' && (
                        <motion.div
                            key="ordering"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <h2 className="text-2xl font-light text-gray-800 mb-2">
                                    Choose your journey order
                                </h2>
                                <p className="text-gray-600">
                                    Which region would you like to visit first?
                                </p>
                            </div>

                            <div className="max-w-2xl mx-auto space-y-4">
                                {selectedRegions
                                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                                    .map((regionWithDays, index) => (
                                    <motion.div
                                        key={regionWithDays.region.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                {/* Order Indicator */}
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                                                    index === 0 
                                                        ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-300' 
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {index === 0 ? '🥇' : index + 1}
                                                </div>
                                                
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-3xl">{regionWithDays.region.icon}</span>
                                                    <div>
                                                        <h3 className="font-medium text-lg text-gray-800">
                                                            {regionWithDays.region.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {regionWithDays.region.nameJapanese} • {regionWithDays.days} day{regionWithDays.days !== 1 ? 's' : ''}
                                                        </p>
                                                        {index === 0 && (
                                                            <p className="text-xs text-yellow-600 font-medium mt-1">
                                                                🌟 Start here
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Reorder Buttons */}
                                            <div className="flex flex-col space-y-1">
                                                <button
                                                    onClick={() => {
                                                        if (index > 0) {
                                                            const newRegions = [...selectedRegions];
                                                            const currentRegion = newRegions.find(r => r.region.id === regionWithDays.region.id);
                                                            const prevRegion = newRegions.find(r => r.order === (regionWithDays.order! - 1));
                                                            
                                                            if (currentRegion && prevRegion) {
                                                                const tempOrder = currentRegion.order;
                                                                currentRegion.order = prevRegion.order;
                                                                prevRegion.order = tempOrder;
                                                                setSelectedRegions(newRegions);
                                                            }
                                                        }
                                                    }}
                                                    disabled={index === 0}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                                        index === 0 
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                    }`}
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (index < selectedRegions.length - 1) {
                                                            const newRegions = [...selectedRegions];
                                                            const currentRegion = newRegions.find(r => r.region.id === regionWithDays.region.id);
                                                            const nextRegion = newRegions.find(r => r.order === (regionWithDays.order! + 1));
                                                            
                                                            if (currentRegion && nextRegion) {
                                                                const tempOrder = currentRegion.order;
                                                                currentRegion.order = nextRegion.order;
                                                                nextRegion.order = tempOrder;
                                                                setSelectedRegions(newRegions);
                                                            }
                                                        }
                                                    }}
                                                    disabled={index === selectedRegions.length - 1}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                                        index === selectedRegions.length - 1 
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                    }`}
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="text-center space-x-4">
                                <button
                                    onClick={() => setStep('region')}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep('style')}
                                    className="px-8 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-medium"
                                >
                                    Continue to Travel Style
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Travel Style */}
                    {step === 'style' && (
                        <motion.div
                            key="style"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <h2 className="text-2xl font-light text-gray-800 mb-2">
                                    What are your travel styles?
                                </h2>
                                <p className="text-gray-600">Select multiple styles that resonate with your spirit</p>
                                {selectedStyles.length > 0 && (
                                    <p className="text-sm text-red-600 mt-2">
                                        {selectedStyles.length} style{selectedStyles.length !== 1 ? 's' : ''} selected
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {travelStyles.map((style) => {
                                    const isSelected = selectedStyles.some(s => s.id === style.id);
                                    return (
                                        <motion.button
                                            key={style.id}
                                            onClick={() => handleStyleToggle(style)}
                                            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left relative ${
                                                isSelected
                                                    ? 'border-red-400 bg-red-50 shadow-lg'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                            }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="text-2xl mb-2">{style.icon}</div>
                                            <h3 className="font-medium text-gray-800">{style.name}</h3>
                                            <p className="text-xs text-gray-500 mb-1">{style.nameJapanese}</p>
                                            <p className="text-sm text-gray-600">{style.description}</p>
                                            
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium"
                                                >
                                                    ✓
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <div className="text-center space-x-4">
                                <button
                                    onClick={() => setStep('ordering')}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep('season')}
                                    className="px-8 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-medium"
                                >
                                    Continue to Season
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Season */}
                    {step === 'season' && (
                        <motion.div
                            key="season"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <h2 className="text-2xl font-light text-gray-800 mb-2">
                                    When will you visit?
                                </h2>
                                <p className="text-gray-600">Each season offers unique beauty</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {seasons.map((season) => (
                                    <motion.button
                                        key={season.id}
                                        onClick={() => setSelectedSeason(season)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                                            selectedSeason?.id === season.id
                                                ? 'border-red-400 bg-red-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <h3 className="font-medium text-gray-800 mb-1">{season.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{season.nameJapanese}</p>
                                        <p className="text-xs text-gray-600 mb-2">{season.description}</p>
                                        <div className="space-y-1">
                                            {season.highlights.map((highlight, index) => (
                                                <p key={index} className="text-xs text-gray-500">• {highlight}</p>
                                            ))}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="text-center space-x-4">
                                <button
                                    onClick={() => setStep('style')}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep('summary')}
                                    className="px-8 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-medium"
                                >
                                    Review Journey
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Summary & Submit */}
                    {step === 'summary' && canProceed && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <h2 className="text-2xl font-light text-gray-800 mb-2">
                                    Your Japan Journey
                                </h2>
                                <p className="text-gray-600">Ready to create your perfect itinerary?</p>
                            </div>

                            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                                <div className="space-y-6">
                                    {/* Multiple Regions Display */}
                                    <div>
                                        <h3 className="font-medium text-gray-800 mb-3">
                                            Regions & Duration ({totalDays} days total):
                                        </h3>
                                        <div className="space-y-3">
                                            {selectedRegions.map((regionWithDays) => (
                                                <div key={regionWithDays.region.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                                                        {regionWithDays.days} day{regionWithDays.days !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Travel Styles & Season */}
                                    <div className="space-y-4">
                                        {selectedStyles.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-600 mb-2">Travel Styles:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedStyles.map((style) => (
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
                                        {selectedSeason && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Season:</span>
                                                <span className="font-medium">{selectedSeason.name} ({selectedSeason.nameJapanese})</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-center space-x-4">
                                <button
                                    onClick={() => setStep('season')}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className={`px-8 py-3 rounded-full font-medium transition-all duration-200 ${
                                        isLoading
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transform hover:scale-105 shadow-lg'
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Creating Your Journey...</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center space-x-2">
                                            <span>🌸</span>
                                            <span>Create My Japan Journey</span>
                                        </span>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}