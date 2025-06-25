'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminToken } from '@/lib/admin-auth';

interface Place {
    id: number;
    name: string;
    description: string;
    category_id: number;
    location: string;
    image_url?: string;
    rating?: number;
    created_at: string;
    updated_at: string;
}

interface Category {
    id: number;
    name: string;
}

export default function PlaceManagement() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPlace, setEditingPlace] = useState<Place | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        location: '',
        image_url: '',
    });

    const getAuthToken = () => getAdminToken();

    const fetchPlaces = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/places', {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setPlaces(data.data || data);
            }
        } catch (error) {
            console.error('観光地の取得に失敗しました:', error);
            // Mock data for testing when backend is not available
            setPlaces([
                {
                    id: 1,
                    name: '東京タワー',
                    description: '東京のシンボルタワー',
                    category_id: 1,
                    location: '東京都港区',
                    image_url: 'https://example.com/tokyo-tower.jpg',
                    rating: 4.5,
                    created_at: '2023-01-01',
                    updated_at: '2023-01-01'
                },
                {
                    id: 2,
                    name: '浅草寺',
                    description: '東京最古の寺院',
                    category_id: 2,
                    location: '東京都台東区',
                    image_url: 'https://example.com/sensoji.jpg',
                    rating: 4.7,
                    created_at: '2023-01-01',
                    updated_at: '2023-01-01'
                }
            ]);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/categories', {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setCategories(data.data || data);
            }
        } catch (error) {
            console.error('カテゴリの取得に失敗しました:', error);
            // Mock categories for testing
            setCategories([
                { id: 1, name: '観光地' },
                { id: 2, name: '寺院・神社' },
                { id: 3, name: '博物館' },
                { id: 4, name: '公園' },
                { id: 5, name: 'ショッピング' }
            ]);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchPlaces(), fetchCategories()]);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingPlace
                ? `http://127.0.0.1:8000/api/places/${editingPlace.id}`
                : 'http://127.0.0.1:8000/api/places';

            const method = editingPlace ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({
                    ...formData,
                    category_id: parseInt(formData.category_id),
                }),
            });

            if (response.ok) {
                await fetchPlaces();
                setShowForm(false);
                setEditingPlace(null);
                setFormData({
                    name: '',
                    description: '',
                    category_id: '',
                    location: '',
                    image_url: '',
                });
            }
        } catch (error) {
            console.error('保存に失敗しました:', error);
        }
    };

    const handleEdit = (place: Place) => {
        setEditingPlace(place);
        setFormData({
            name: place.name,
            description: place.description,
            category_id: place.category_id.toString(),
            location: place.location,
            image_url: place.image_url || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('この観光地を削除しますか？')) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/places/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (response.ok) {
                    await fetchPlaces();
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
                        <h2 className="text-2xl font-light text-gray-800">観光地管理</h2>
                        <p className="text-gray-600">観光地の追加、編集、削除</p>
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
                                {editingPlace ? '観光地編集' : '新しい観光地'}
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
                                        カテゴリ
                                    </label>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">カテゴリを選択</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
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
                                            setEditingPlace(null);
                                            setFormData({
                                                name: '',
                                                description: '',
                                                category_id: '',
                                                location: '',
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

            {/* Places List */}
            <div className="bg-white rounded-xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">名前</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">場所</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">カテゴリ</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">評価</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {places.map((place) => (
                                <tr key={place.id} className="border-t border-gray-100">
                                    <td className="py-3 px-4">
                                        <div>
                                            <div className="font-medium text-gray-800">{place.name}</div>
                                            <div className="text-sm text-gray-600 truncate max-w-xs">
                                                {place.description}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">{place.location}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                            {categories.find(c => c.id === place.category_id)?.name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {place.rating ? (
                                            <span className="flex items-center">
                                                ⭐ {place.rating.toFixed(1)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">未評価</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(place)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                編集
                                            </button>
                                            <button
                                                onClick={() => handleDelete(place.id)}
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

                {places.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        観光地が登録されていません
                    </div>
                )}
            </div>
        </div>
    );
}
