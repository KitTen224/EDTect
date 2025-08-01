'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAdminToken } from '@/lib/admin-auth';

interface Review {
    id: number;
    user_id: number;
    place_id?: number;
    rating: number;
    comment: string;
    status: string;
    created_at: string;
    updated_at: string;
    user?: {
        name: string;
        email: string;
    };
    place?: {
        name: string;
    };
}

export default function ReviewManagement() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const getAuthToken = () => getAdminToken();

    const fetchReviews = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/reviews', {
                headers: {
                    'Accept': 'application/json',
                    //'Authorization': `Bearer ${getAuthToken()}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setReviews(data.data || data);
            }
        } catch (error) {
            console.error('レビューの取得に失敗しました:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchReviews();
            setIsLoading(false);
        };
        loadData();
    }, []);

    const updateReviewStatus = async (reviewId: number, status: string) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/reviews/${reviewId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                await fetchReviews();
            }
        } catch (error) {
            console.error('ステータス更新に失敗しました:', error);
        }
    };

    const deleteReview = async (reviewId: number) => {
        if (confirm('このレビューを削除しますか？')) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/reviews/${reviewId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (response.ok) {
                    await fetchReviews();
                }
            } catch (error) {
                console.error('削除に失敗しました:', error);
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">承認済み</span>;
            case 'pending':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">承認待ち</span>;
            case 'rejected':
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">却下</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">{status}</span>;
        }
    };

    const renderStars = (rating: number) => {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const filteredReviews = reviews.filter(review => {
        if (filter === 'all') return true;
        return review.status === filter;
    });

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
                        <h2 className="text-2xl font-light text-gray-800">レビュー管理</h2>
                        <p className="text-gray-600">レビューの承認、却下、削除</p>
                    </div>

                    {/* Filter */}
                    <div className="flex gap-2">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="all">すべて</option>
                            <option value="pending">承認待ち</option>
                            <option value="approved">承認済み</option>
                            <option value="rejected">却下</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-gray-800">
                        {reviews.length}
                    </div>
                    <div className="text-sm text-gray-600">総レビュー数</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">
                        {reviews.filter(r => r.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600">承認待ち</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                        {reviews.filter(r => r.status === 'approved').length}
                    </div>
                    <div className="text-sm text-gray-600">承認済み</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-red-600">
                        {reviews.filter(r => r.status === 'rejected').length}
                    </div>
                    <div className="text-sm text-gray-600">却下</div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-xl shadow-sm">
                <div className="space-y-4 p-6">
                    {filteredReviews.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-200 rounded-lg p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="text-lg">
                                            {renderStars(review.rating)}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            評価: {review.rating}/5
                                        </div>
                                        {getStatusBadge(review.status)}
                                    </div>

                                    <div className="mb-3">
                                        <div className="font-medium text-gray-800 mb-1">
                                            {review.place?.name || '場所情報なし'}
                                        </div>
                                        <div className="text-gray-600">
                                            {review.comment}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>
                                            投稿者: {review.user?.name || '匿名'}
                                        </span>
                                        <span>
                                            投稿日: {new Date(review.created_at).toLocaleDateString('ja-JP')}
                                        </span>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 ml-4">
                                    {review.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateReviewStatus(review.id, 'approved')}
                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                            >
                                                承認
                                            </button>
                                            <button
                                                onClick={() => updateReviewStatus(review.id, 'rejected')}
                                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                            >
                                                却下
                                            </button>
                                        </>
                                    )}
                                    {review.status === 'approved' && (
                                        <button
                                            onClick={() => updateReviewStatus(review.id, 'rejected')}
                                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                        >
                                            却下
                                        </button>
                                    )}
                                    {review.status === 'rejected' && (
                                        <button
                                            onClick={() => updateReviewStatus(review.id, 'approved')}
                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                        >
                                            承認
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteReview(review.id)}
                                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                                    >
                                        削除
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredReviews.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        {filter === 'all'
                            ? 'レビューが投稿されていません'
                            : `${filter === 'pending' ? '承認待ち' : filter === 'approved' ? '承認済み' : '却下'}のレビューがありません`
                        }
                    </div>
                )}
            </div>
        </div>
    );
}
