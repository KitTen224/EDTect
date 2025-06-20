import { createHash } from 'crypto';

/**
 * Generate a consistent UUID from a user identifier (Google ID or email)
 * This ensures that the same user always gets the same UUID, which is required
 * for the Supabase database where user_id is a UUID field.
 */
export function generateConsistentUUID(identifier: string): string {
    // Create a hash of the identifier with a salt specific to EDTect
    const hash = createHash('sha256').update(`edtect-user-${identifier}`).digest('hex');
    
    // Format as UUID v4 style (8-4-4-4-12)
    const uuid = [
        hash.substring(0, 8),
        hash.substring(8, 12),
        hash.substring(12, 16),
        hash.substring(16, 20),
        hash.substring(20, 32)
    ].join('-');
    
    return uuid;
}

/**
 * Get a consistent user ID from a NextAuth session
 * Returns a UUID that can be used as a database primary key
 */
export function getUserIdFromSession(session: any): string | null {
    if (!session?.user) return null;
    
    const userIdentifier = session.user.id || session.user.email;
    if (!userIdentifier) return null;
    
    return generateConsistentUUID(userIdentifier);
}