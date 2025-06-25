'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';

export function AdminLink() {
    return (
        <Link
            href="/admin"
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors text-sm"
        >
            <Settings className="w-4 h-4" />
            <span>管理</span>
        </Link>
    );
}
