'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { isAdminAuthenticated, clearAdminAuth } from '@/lib/admin-auth';
import PlaceManagement from '@/components/admin/PlaceManagement';
import RestaurantManagement from '@/components/admin/RestaurantManagement';
import HotelManagement from '@/components/admin/HotelManagement';
import ReviewManagement from '@/components/admin/ReviewManagement';
import Statistics from '@/components/admin/Statistics';

const tabs = [
    { id: 'places', label: '観光地管理', icon: '🏯' },
    { id: 'restaurants', label: 'レストラン管理', icon: '🍜' },
    { id: 'hotels', label: '宿泊施設管理', icon: '🏨' },
    { id: 'reviews', label: 'レビュー管理', icon: '⭐' },
    { id: 'statistics', label: '統計・ダッシュボード', icon: '📊' },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('statistics');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter(); useEffect(() => {
        if (!isAdminAuthenticated()) {
            router.push('/admin/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    const handleLogout = () => {
        clearAdminAuth();
        router.push('/admin/login');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">認証確認中...</p>
                </div>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'places':
                return <PlaceManagement />;
            case 'restaurants':
                return <RestaurantManagement />;
            case 'hotels':
                return <HotelManagement />;
            case 'reviews':
                return <ReviewManagement />;
            case 'statistics':
                return <Statistics />;
            default:
                return <Statistics />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-light text-gray-800">
                                管理<span className="text-red-600">ダッシュボード</span>
                            </h1>
                            <p className="text-sm text-gray-600">日本 Journey 管理システム</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                        >
                            ログアウト
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <nav className="w-64 bg-white shadow-sm h-screen sticky top-0">
                    <div className="p-6">
                        <div className="space-y-2">
                            {tabs.map((tab) => (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all ${activeTab === tab.id
                                            ? 'bg-red-50 text-red-700 border border-red-200'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-lg mr-3">{tab.icon}</span>
                                    <span className="font-medium">{tab.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Main content */}
                <main className="flex-1 p-6">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderTabContent()}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
