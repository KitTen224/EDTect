'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const error = searchParams.get('error');
    
    // Check if email provider is configured
    const emailProviderEnabled = process.env.NEXT_PUBLIC_EMAIL_PROVIDER_ENABLED === 'true';

    useEffect(() => {
        // Check if user is already signed in
        getSession().then((session) => {
            if (session) {
                router.push(callbackUrl);
            }
        });
    }, [router, callbackUrl]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('google', { callbackUrl });
        } catch (error) {
            console.error('Google sign in error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        
        setIsLoading(true);
        try {
            await signIn('email', { email, callbackUrl });
        } catch (error) {
            console.error('Email sign in error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
                        <span className="text-red-600">日</span>本 Journey
                    </h1>
                    <p className="text-lg text-gray-600 font-light mb-2">
                        Welcome back to your Japan adventure
                    </p>
                    <p className="text-sm text-gray-500">
                        Sign in to save and manage your travel plans
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                        <p className="text-red-700 text-sm">
                            {error === 'OAuthSignin' && 'Error occurred during sign in. Please try again.'}
                            {error === 'OAuthCallback' && 'Error occurred during sign in callback. Please try again.'}
                            {error === 'OAuthCreateAccount' && 'Could not create account. Please try again.'}
                            {error === 'EmailCreateAccount' && 'Could not create account with this email.'}
                            {error === 'Callback' && 'Error occurred during callback. Please try again.'}
                            {error === 'OAuthAccountNotLinked' && 'This email is already associated with another account.'}
                            {error === 'EmailSignin' && 'Could not send email. Please check your email address.'}
                            {error === 'CredentialsSignin' && 'Sign in failed. Please check your credentials.'}
                            {error === 'SessionRequired' && 'Please sign in to access this page.'}
                            {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'EmailCreateAccount', 'Callback', 'OAuthAccountNotLinked', 'EmailSignin', 'CredentialsSignin', 'SessionRequired'].includes(error) && 'An error occurred. Please try again.'}
                        </p>
                    </motion.div>
                )}

                {/* Sign in form */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                    {/* Development bypass button */}
                    {process.env.NODE_ENV === 'development' && (
                        <button
                            onClick={() => {
                                // Temporary bypass for development
                                document.cookie = 'next-auth.session-token=dev-bypass; path=/';
                                router.push(callbackUrl);
                            }}
                            className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-orange-300 rounded-full text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors mb-4"
                        >
                            <span>🚧</span>
                            <span>Development Bypass (Skip Auth)</span>
                        </button>
                    )}

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    {/* Email Sign In - Only show if email provider is configured */}
                    {emailProviderEnabled && (
                        <>
                            {/* Divider */}
                            <div className="flex items-center my-6">
                                <div className="flex-1 border-t border-gray-300"></div>
                                <span className="px-3 text-gray-500 text-sm">or</span>
                                <div className="flex-1 border-t border-gray-300"></div>
                            </div>

                            {/* Email Sign In */}
                            <form onSubmit={handleEmailSignIn} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                        required
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="w-full py-3 px-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Sending magic link...' : 'Send Magic Link'}
                                </button>
                            </form>

                            {/* Info */}
                            <p className="text-xs text-gray-500 text-center mt-6">
                                We&apos;ll send you a secure link to sign in without a password
                            </p>
                        </>
                    )}

                    {/* Alternative message when only Google is available */}
                    {!emailProviderEnabled && (
                        <p className="text-xs text-gray-500 text-center mt-6">
                            Use your Google account to get started with Japan Journey
                        </p>
                    )}
                </div>

                {/* Back to app */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => router.push('/')}
                        className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
                    >
                        ← Back to planning
                    </button>
                </div>
            </motion.div>
        </div>
    );
}