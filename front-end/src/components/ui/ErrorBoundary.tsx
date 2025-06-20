'use client';

import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log the error to an error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto text-center"
                    >
                        <div className="mb-6">
                            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-light text-gray-800 mb-2">
                                Something went wrong
                            </h2>
                            <p className="text-gray-600 mb-4">
                                We encountered an unexpected error. This could be due to a temporary issue with the application.
                            </p>
                            
                            {/* Show error details in development */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="text-left mb-4 p-3 bg-gray-100 rounded-lg">
                                    <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                                        Error Details (Development)
                                    </summary>
                                    <pre className="text-xs text-gray-600 overflow-auto">
                                        {this.state.error.message}
                                        {'\n\n'}
                                        {this.state.error.stack}
                                    </pre>
                                </details>
                            )}
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={this.handleRetry}
                                className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                                <span>Try Again</span>
                            </button>
                            
                            <button
                                onClick={this.handleGoHome}
                                className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <Home className="w-5 h-5" />
                                <span>Go to Home</span>
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-6">
                            If this problem persists, please refresh the page or try again later.
                        </p>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Convenience wrapper for common use cases
interface SimpleErrorBoundaryProps {
    children: ReactNode;
    message?: string;
}

export function SimpleErrorBoundary({ children, message }: SimpleErrorBoundaryProps) {
    return (
        <ErrorBoundary
            fallback={
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-700">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">Error</span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">
                        {message || 'Something went wrong loading this component.'}
                    </p>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    );
}

// Hook for manually triggering error boundary in functional components
export function useErrorHandler() {
    return (error: Error, errorInfo?: string) => {
        // This will trigger the nearest error boundary
        throw error;
    };
}