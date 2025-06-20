'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { setAdminToken } from '@/lib/admin-auth';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Mock authentication for testing - replace with real API call later
            if (username === 'admin' && password === 'admin123') {
                // Simulate successful login
                const mockToken = 'mock_admin_token_' + Date.now();
                setAdminToken(mockToken);
                router.push('/admin/dashboard');
                return;
            }

            // Try real API call (will fail if backend API not ready)
            const response = await fetch('http://127.0.0.1:8000/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'ログインに失敗しました');
            }            // Store token in localStorage
            if (result.token) {
                setAdminToken(result.token);
                router.push('/admin/dashboard');
            } else {
                throw new Error('認証トークンを取得できませんでした');
            }
        } catch (err) {
            // If it's a network error or API not available, try mock login
            if (username === 'admin' && password === 'admin123') {
                const mockToken = 'mock_admin_token_' + Date.now();
                setAdminToken(mockToken);
                router.push('/admin/dashboard');
            } else {
                setError(err instanceof Error ? err.message : 'ログインエラーが発生しました');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
            {/* Back to main button */}
            <div className="absolute top-6 left-6">
                <motion.button
                    onClick={() => router.push('/')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-300"
                >
                    <span>🏠</span>
                    <span className="font-medium">メイン画面に戻る</span>
                </motion.button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-light text-gray-800 mb-2">
                        管理者<span className="text-red-600">ログイン</span>
                    </h1>
                    <p className="text-gray-600 font-light">
                        システム管理画面へのアクセス
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            ユーザー名
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            placeholder="管理者ユーザー名を入力"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            パスワード
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            placeholder="パスワードを入力"
                            required
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? 'ログイン中...' : 'ログイン'}
                    </motion.button>
                </form>                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        © 2025 日本 Journey 管理システム
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
