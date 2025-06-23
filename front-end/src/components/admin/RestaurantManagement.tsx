'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminToken } from '@/lib/admin-auth';

interface Restaurant {
    id: number;
    name: string;
    description: string;
    location: string;
    cuisine_type: string;
    price_range: string;
    image_url?: string;
    rating?: number;
    created_at: string;
    updated_at: string;
}

export default function RestaurantManagement() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        cuisine_type: '',
        price_range: '',
        image_url: '',
    });

    const getAuthToken = () => getAdminToken();

    const fetchRestaurants = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/restaurants', {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setRestaurants(data.data || data);
            }
        } catch (error) {
            console.error('レストランの取得に失敗しました:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchRestaurants();
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingRestaurant
                ? `http://127.0.0.1:8000/api/restaurants/${editingRestaurant.id}`
                : 'http://127.0.0.1:8000/api/restaurants';

            const method = editingRestaurant ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await fetchRestaurants();
                setShowForm(false);
                setEditingRestaurant(null);
                setFormData({
                    name: '',
                    description: '',
                    location: '',
                    cuisine_type: '',
                    price_range: '',
                    image_url: '',
                });
            }
        } catch (error) {
            console.error('保存に失敗しました:', error);
        }
    };

    const handleEdit = (restaurant: Restaurant) => {
        setEditingRestaurant(restaurant);
        setFormData({
            name: restaurant.name,
            description: restaurant.description,
            location: restaurant.location,
            cuisine_type: restaurant.cuisine_type,
            price_range: restaurant.price_range,
            image_url: restaurant.image_url || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('このレストランを削除しますか？')) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/restaurants/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (response.ok) {
                    await fetchRestaurants();
                }
            } catch (error) {
                console.error('削除に失敗しました:', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-2 text-gray-600">読み込み中...</span>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-light text-gray-800">レストラン管理</h2>
                        <p className="text-gray-600">レストランの追加、編集、削除</p>
                    </div>
                    <motion.button
                        onClick={() => setShowForm(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        + 追加
                    </motion.button>
                </div>
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl p-6 w-full max-w-md"
                        >
                            <h3 className="text-xl font-medium text-gray-800 mb-4">
                                {editingRestaurant ? 'レストラン編集' : '新しいレストラン'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        名前
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        説明
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        場所
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        料理ジャンル
                                    </label>
                                    <select
                                        value={formData.cuisine_type}
                                        onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">ジャンルを選択</option>
                                        <option value="日本料理">日本料理</option>
                                        <option value="寿司">寿司</option>
                                        <option value="ラーメン">ラーメン</option>
                                        <option value="焼肉">焼肉</option>
                                        <option value="天ぷら">天ぷら</option>
                                        <option value="うどん・そば">うどん・そば</option>
                                        <option value="居酒屋">居酒屋</option>
                                        <option value="洋食">洋食</option>
                                        <option value="中華料理">中華料理</option>
                                        <option value="その他">その他</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        価格帯
                                    </label>
                                    <select
                                        value={formData.price_range}
                                        onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">価格帯を選択</option>
                                        <option value="¥">¥ (1000円未満)</option>
                                        <option value="¥¥">¥¥ (1000-3000円)</option>
                                        <option value="¥¥¥">¥¥¥ (3000-8000円)</option>
                                        <option value="¥¥¥¥">¥¥¥¥ (8000円以上)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        画像URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        保存
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingRestaurant(null);
                                            setFormData({
                                                name: '',
                                                description: '',
                                                location: '',
                                                cuisine_type: '',
                                                price_range: '',
                                                image_url: '',
                                            });
                                        }}
                                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        戻る
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Restaurants List */}
            <div className="bg-white rounded-xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">名前</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">場所</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">ジャンル</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">価格帯</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">評価</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {restaurants.map((restaurant) => (
                                <tr key={restaurant.id} className="border-t border-gray-100">
                                    <td className="py-3 px-4">
                                        <div>
                                            <div className="font-medium text-gray-800">{restaurant.name}</div>
                                            <div className="text-sm text-gray-600 truncate max-w-xs">
                                                {restaurant.description}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">{restaurant.location}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                            {restaurant.cuisine_type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                                            {restaurant.price_range}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {restaurant.rating ? (
                                            <span className="flex items-center">
                                                ⭐ {restaurant.rating.toFixed(1)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">未評価</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(restaurant)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                編集
                                            </button>
                                            <button
                                                onClick={() => handleDelete(restaurant.id)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                削除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {restaurants.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        レストランが登録されていません
                    </div>
                )}
            </div>
        </div>
    );
}
