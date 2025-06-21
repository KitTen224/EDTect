'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Bookmark, Settings } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export function AuthButton() {
    const { data: session, status } = useSession();
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Temporarily hide auth button for frontend development
    const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';
    
    if (!authEnabled) {
        // Show demo auth button for frontend development
        return (
            <button
                onClick={() => alert('Authentication is temporarily disabled for frontend development')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition-colors text-sm cursor-not-allowed"
            >
                <User className="w-4 h-4" />
                <span>Sign In (Demo)</span>
            </button>
        );
    }

    if (status === 'loading') {
        return (
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        );
    }

    if (!session) {
        return (
            <button
                onClick={() => signIn()}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm"
            >
                <User className="w-4 h-4" />
                <span>Sign In</span>
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                {session.user?.image ? (
                    <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                )}
                <span className="text-sm text-gray-700 hidden md:inline">
                    {session.user?.name || session.user?.email || 'User'}
                </span>
            </button>

            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                        onMouseLeave={() => setShowMenu(false)}
                    >
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">
                                {session.user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {session.user?.email}
                            </p>
                        </div>
                        
                        <button
                            onClick={() => {
                                setShowMenu(false);
                                router.push('/trips');
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Bookmark className="w-4 h-4" />
                            <span>My Trips</span>
                        </button>
                        
                        <button
                            onClick={() => {
                                setShowMenu(false);
                                // Pass current URL as returnUrl so user comes back here after saving
                                const returnUrl = encodeURIComponent(pathname);
                                router.push(`/profile?returnUrl=${returnUrl}`);
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </button>
                        
                        <hr className="my-2 border-gray-100" />
                        
                        <button
                            onClick={() => {
                                setShowMenu(false);
                                signOut({ callbackUrl: '/' });
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}