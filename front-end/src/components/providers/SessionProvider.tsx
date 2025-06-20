'use client';

import { useState, useEffect } from 'react';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

interface SessionProviderProps {
    children: React.ReactNode;
    session?: Session | null;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // On server-side, render immediately
    if (!isClient) {
        return (
            <NextAuthSessionProvider session={session}>
                {children}
            </NextAuthSessionProvider>
        );
    }

    // On client-side, ensure hydration is complete
    return (
        <NextAuthSessionProvider 
            session={session}
            // Reduce automatic refetch interval to prevent unnecessary requests
            refetchInterval={5 * 60} // 5 minutes
            refetchOnWindowFocus={false}
        >
            {children}
        </NextAuthSessionProvider>
    );
}