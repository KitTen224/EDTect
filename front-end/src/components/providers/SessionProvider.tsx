'use client';

import { SessionProvider as NextAuthSessionProvider, Session } from 'next-auth/react';

interface SessionProviderProps {
    children: React.ReactNode;
    session?: Session | null;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
    return (
        <NextAuthSessionProvider session={session}>
            {children}
        </NextAuthSessionProvider>
    );
}