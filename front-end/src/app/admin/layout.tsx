import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '管理システム - 日本 Journey',
    description: '日本 Journey 管理システムへのアクセス',
};

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}
