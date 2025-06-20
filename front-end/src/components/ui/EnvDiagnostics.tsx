'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle, Settings, Eye, EyeOff } from 'lucide-react';

interface EnvironmentCheck {
    name: string;
    value: string | undefined;
    required: boolean;
    description: string;
}

export function EnvDiagnostics() {
    const { data: session, status } = useSession();
    const [isVisible, setIsVisible] = useState(false);
    const [showValues, setShowValues] = useState(false);

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    const envChecks: EnvironmentCheck[] = [
        {
            name: 'NEXTAUTH_URL',
            value: process.env.NEXTAUTH_URL,
            required: true,
            description: 'Base URL for NextAuth callbacks'
        },
        {
            name: 'NEXTAUTH_SECRET',
            value: process.env.NEXTAUTH_SECRET,
            required: true,
            description: 'Secret for encrypting JWT tokens'
        },
        {
            name: 'GOOGLE_CLIENT_ID',
            value: process.env.GOOGLE_CLIENT_ID,
            required: false,
            description: 'Google OAuth client ID'
        },
        {
            name: 'GOOGLE_CLIENT_SECRET',
            value: process.env.GOOGLE_CLIENT_SECRET,
            required: false,
            description: 'Google OAuth client secret'
        },
        {
            name: 'NEXT_PUBLIC_SUPABASE_URL',
            value: process.env.NEXT_PUBLIC_SUPABASE_URL,
            required: false,
            description: 'Supabase project URL'
        },
        {
            name: 'SUPABASE_SERVICE_ROLE_KEY',
            value: process.env.SUPABASE_SERVICE_ROLE_KEY,
            required: false,
            description: 'Supabase service role key'
        },
        {
            name: 'GEMINI_API_KEY',
            value: process.env.GEMINI_API_KEY,
            required: false,
            description: 'Google Gemini AI API key'
        }
    ];

    const getStatus = (check: EnvironmentCheck) => {
        if (check.required && !check.value) {
            return 'error';
        }
        if (check.value) {
            return 'success';
        }
        return 'warning';
    };

    const formatValue = (value: string | undefined) => {
        if (!value) return 'Not set';
        if (!showValues) {
            return `Set (${value.length} chars)`;
        }
        return value.length > 50 ? `${value.substring(0, 47)}...` : value;
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                title="Environment Diagnostics (Development Only)"
            >
                <Settings className="w-4 h-4" />
                <span className="text-sm">ENV</span>
            </button>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-12 left-0 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-h-96 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-800">Environment Diagnostics</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowValues(!showValues)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    title={showValues ? 'Hide values' : 'Show values'}
                                >
                                    {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Authentication Status */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Authentication Status</h4>
                            <div className="flex items-center space-x-2">
                                {status === 'loading' ? (
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : status === 'authenticated' ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-sm text-gray-600">
                                    {status === 'loading' ? 'Loading...' : 
                                     status === 'authenticated' ? `Signed in as ${session?.user?.email || 'Unknown'}` :
                                     'Not signed in'}
                                </span>
                            </div>
                        </div>

                        {/* Environment Variables */}
                        <div className="space-y-2">
                            {envChecks.map((check) => {
                                const statusType = getStatus(check);
                                return (
                                    <div key={check.name} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50">
                                        <div className="mt-1">
                                            {statusType === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                            {statusType === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                                            {statusType === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <code className="text-xs font-mono text-gray-700">{check.name}</code>
                                                {check.required && (
                                                    <span className="text-xs text-red-500 font-medium">Required</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 mb-1">{check.description}</div>
                                            <div className="text-xs font-mono text-gray-600 break-all">
                                                {formatValue(check.value)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 text-xs text-gray-500 border-t pt-3">
                            <div className="mb-1">💡 This panel only shows in development mode</div>
                            <div>🔧 Check your .env.local file for missing required variables</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}