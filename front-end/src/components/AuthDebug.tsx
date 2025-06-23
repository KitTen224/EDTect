'use client';

import { useAuth } from '@/contexts/AuthContext';

export function AuthDebug() {
  const { user, isLoading } = useAuth();

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-3 rounded text-xs max-w-xs">
      <div><strong>Auth Status:</strong> {isLoading ? 'loading' : user ? 'authenticated' : 'unauthenticated'}</div>
      <div><strong>User ID:</strong> {user?.id || 'None'}</div>
      <div><strong>Email:</strong> {user?.email || 'None'}</div>
      <div><strong>Name:</strong> {user?.name || 'None'}</div>
    </div>
  );
}