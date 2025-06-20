'use client';

import { SessionProvider } from "@/components/providers/SessionProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface RootProvidersProps {
    children: React.ReactNode;
}

export function RootProviders({ children }: RootProvidersProps) {
    return (
        <ErrorBoundary
            onError={(error, errorInfo) => {
                console.error('Application-level error:', error, errorInfo);
                // You could also send this to an error reporting service here
            }}
        >
            <SessionProvider>
                {children}
            </SessionProvider>
        </ErrorBoundary>
    );
}