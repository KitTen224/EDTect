'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export default function AdminPage() {
    const router = useRouter(); useEffect(() => {
        // Check if user is already logged in
        if (isAdminAuthenticated()) {
            router.push('/admin/dashboard');
        } else {
            router.push('/admin/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">リダイレクト中...</p>
            </div>
        </div>
    );
}
