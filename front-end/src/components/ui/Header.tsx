'use client';

import { motion } from 'framer-motion';
import { AuthButton } from './AuthButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { AdminLink } from './AdminLink';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    showAuth?: boolean;
}

export function Header({ 
    title, 
    subtitle,
    showAuth = true 
}: HeaderProps) {
    const { t } = useLanguage();
    const router = useRouter();
    return (
        <div className="relative">
            {/* Auth Button - positioned absolute in top right */}
            {showAuth && (
                <div className="absolute top-0 right-0 z-50 flex items-center gap-2">
                    <AdminLink />
                    <AuthButton />
                </div>
            )}
            
            {/* Main Header Content */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 
                    onClick={() => router.push('/')}
                    className="text-4xl md:text-6xl font-light text-gray-800 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                >
                    {title || (
                        <>
                            <span className="text-red-600">日</span>本 Journey
                        </>
                    )}
                </h1>
                <p className="text-lg text-gray-600 font-light">
                    {subtitle ? subtitle : t('app.subtitle')}
                </p>
            </motion.div>
        </div>
    );
}