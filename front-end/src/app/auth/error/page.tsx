'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AuthError() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const error = searchParams.get('error');

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'Configuration':
                return {
                    title: 'Server Configuration Error',
                    message: 'There was a problem with the server configuration. Please try again later.',
                    icon: '⚙️'
                };
            case 'AccessDenied':
                return {
                    title: 'Access Denied',
                    message: 'You do not have permission to sign in with this account.',
                    icon: '🚫'
                };
            case 'Verification':
                return {
                    title: 'Email Verification Failed',
                    message: 'The sign in link was invalid. It may have been used already or expired.',
                    icon: '📧'
                };
            case 'Default':
            default:
                return {
                    title: 'Authentication Error',
                    message: 'An error occurred during sign in. Please try again.',
                    icon: '❌'
                };
        }
    };

    const errorInfo = getErrorMessage(error);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md text-center"
            >
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
                        <span className="text-red-600">日</span>本 Journey
                    </h1>
                </div>

                {/* Error Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-6">
                    <div className="text-6xl mb-4">{errorInfo.icon}</div>
                    <h2 className="text-2xl font-light text-gray-800 mb-4">
                        {errorInfo.title}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {errorInfo.message}
                    </p>
                    
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/auth/signin')}
                            className="w-full py-3 px-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>

                {/* Help Text */}
                <p className="text-sm text-gray-500">
                    If you continue to experience issues, please try a different browser or contact support.
                </p>
            </motion.div>
        </div>
    );
}