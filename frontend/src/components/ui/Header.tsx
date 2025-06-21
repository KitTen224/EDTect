'use client';

import { motion } from 'framer-motion';
import { AuthButton } from './AuthButton';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    showAuth?: boolean;
}

export function Header({ 
    title = '日本 Journey', 
    subtitle = 'Discover the beauty of Japan, tailored to your journey',
    showAuth = true 
}: HeaderProps) {
    return (
        <div className="relative">
            {/* Auth Button - positioned absolute in top right */}
            {showAuth && (
                <div className="absolute top-0 right-0">
                    <AuthButton />
                </div>
            )}
            
            {/* Main Header Content */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-6xl font-light text-gray-800 mb-4">
                    <span className="text-red-600">日</span>本 Journey
                </h1>
                <p className="text-lg text-gray-600 font-light">
                    {subtitle}
                </p>
            </motion.div>
        </div>
    );
}