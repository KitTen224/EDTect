'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAdminToken } from '@/lib/admin-auth';

interface Statistics {
    totalPlaces: number;
    totalRestaurants: number;
    totalHotels: number;
    totalReviews: number;
    totalUsers: number;
    totalBookings: number;
    averageRating: number;
    popularPlaces: Array<{
        id: number;
        name: string;
        rating: number;
        reviewCount: number;
    }>;
    monthlyStats: Array<{
        month: string;
        bookings: number;
        reviews: number;
    }>;
}

export default function Statistics() {
    const [stats, setStats] = useState<Statistics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getAuthToken = () => getAdminToken();

    const fetchStatistics = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/statistics', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    // 'Authorization': `Bearer ${getAuthToken()}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                // Fallback data if API not available
                setStats({
                    totalPlaces: 0,
                    totalRestaurants: 0,
                    totalHotels: 0,
                    totalReviews: 0,
                    totalUsers: 0,
                    totalBookings: 0,
                    averageRating: 0,
                    popularPlaces: [],
                    monthlyStats: [],
                });
            }
        } catch (error) {
            console.error('統計の取得に失敗しました:', error);
            // Fallback data
            setStats({
                totalPlaces: 0,
                totalRestaurants: 0,
                totalHotels: 0,
                totalReviews: 0,
                totalUsers: 0,
                totalBookings: 0,
                averageRating: 0,
                popularPlaces: [],
                monthlyStats: [],
            });
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchStatistics();
            setIsLoading(false);
        };
        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-2 text-gray-600">読み込み中...</span>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12 text-gray-500">
                統計データの取得に失敗しました
            </div>
        );
    }

    const StatCard = ({
        title,
        value,
        icon,
        color = 'bg-blue-500'
    }: {
        title: string;
        value: string | number;
        icon: string;
        color?: string;
    }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`${color} rounded-full p-3`}>
                    <span className="text-2xl">{icon}</span>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-light text-gray-800">統計・ダッシュボード</h2>
                <p className="text-gray-600">システム全体の統計と分析</p>
            </div>

            {/* Main Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="総観光地数"
                    value={stats.totalPlaces}
                    icon="🏯"
                    color="bg-blue-500"
                />
                <StatCard
                    title="総レストラン数"
                    value={stats.totalRestaurants}
                    icon="🍜"
                    color="bg-green-500"
                />
                <StatCard
                    title="総宿泊施設数"
                    value={stats.totalHotels}
                    icon="🏨"
                    color="bg-purple-500"
                />
                <StatCard
                    title="総レビュー数"
                    value={stats.totalReviews}
                    icon="⭐"
                    color="bg-yellow-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="総ユーザー数"
                    value={stats.totalUsers}
                    icon="👥"
                    color="bg-indigo-500"
                />
                <StatCard
                    title="総予約数"
                    value={stats.totalBookings}
                    icon="📅"
                    color="bg-pink-500"
                />
                <StatCard
                    title="平均評価"
                    value={stats.averageRating ? `${stats.averageRating.toFixed(1)}/5` : 'N/A'}
                    icon="🌟"
                    color="bg-orange-500"
                />
            </div>

            {/* Detailed Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Places */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl p-6 shadow-sm"
                >
                    <h3 className="text-lg font-medium text-gray-800 mb-4">人気観光地トップ10</h3>
                    {stats.popularPlaces.length > 0 ? (
                        <div className="space-y-3">
                            {stats.popularPlaces.map((place, index) => (
                                <div key={place.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <div className="font-medium text-gray-800">{place.name}</div>
                                            <div className="text-sm text-gray-600">
                                                {place.reviewCount} レビュー
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-yellow-400">⭐</span>
                                        <span className="text-sm font-medium">{place.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            データがありません
                        </div>
                    )}
                </motion.div>

                {/* Monthly Statistics */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl p-6 shadow-sm"
                >
                    <h3 className="text-lg font-medium text-gray-800 mb-4">月次統計</h3>
                    {stats.monthlyStats.length > 0 ? (
                        <div className="space-y-4">
                            {stats.monthlyStats.map((stat, index) => (
                                <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-800">{stat.month}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">予約数</span>
                                            <span className="font-medium">{stat.bookings}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">レビュー数</span>
                                            <span className="font-medium">{stat.reviews}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            データがありません
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-white rounded-xl p-6 shadow-sm"
            >
                <h3 className="text-lg font-medium text-gray-800 mb-4">クイックアクション</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <span>📊</span>
                        <span>詳細レポート</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <span>📤</span>
                        <span>データエクスポート</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <span>🔄</span>
                        <span>データ更新</span>
                    </button>
                </div>
            </motion.div>

            {/* Last Updated */}
            <div className="mt-6 text-center text-sm text-gray-500">
                最終更新: {new Date().toLocaleString('ja-JP')}
            </div>
        </div>
    );
}
