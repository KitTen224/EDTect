import { supabaseServer } from './supabase';
import { User } from 'next-auth';
import { getUserIdFromSession } from './user-utils';

/**
 * Ensures a user profile exists in the public.users table.
 * If the user doesn't exist, it creates a new profile.
 * @param user The user object from NextAuth session.
 * @returns The user's profile from the database.
 */
export async function ensureUserProfile(user: User) {
    try {
        const userId = getUserIdFromSession({ user });
        console.log('🔍 Ensuring user profile for:', {
            userId,
            email: user.email,
            name: user.name
        });

        if (!userId) {
            console.error('❌ No valid user ID generated');
            throw new Error('User must have an ID to ensure a profile.');
        }

        // Check if user profile already exists
        console.log('🔍 Checking for existing user profile...');
        const { data: existingUser, error: selectError } = await supabaseServer
            .from('users')
            .select('*')  // Select all fields to see what we get back
            .eq('id', userId)
            .single();

        if (selectError) {
            console.error('❌ Error checking for user profile:', {
                error: selectError,
                errorCode: selectError.code,
                details: selectError.details,
                hint: selectError.hint
            });

            if (selectError.code !== 'PGRST116') { // PGRST116: "object not found"
                throw new Error(`Database error: ${selectError.message}`);
            }
        }

        if (existingUser) {
            console.log('✅ Existing user profile found:', existingUser);
            return existingUser;
        }

        // If not, create a new user profile
        console.log('📝 Creating new user profile...');
        const { data: newUser, error: insertError } = await supabaseServer
            .from('users')
            .insert({
                id: userId,
                email: user.email,
                name: user.name,
                image: user.image,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            console.error('❌ Error creating user profile:', {
                error: insertError,
                errorCode: insertError.code,
                details: insertError.details,
                hint: insertError.hint
            });
            throw new Error(`Could not create user profile: ${insertError.message}`);
        }

        console.log('✅ New user profile created:', newUser);
        return newUser;
    } catch (error) {
        console.error('❌ Error in ensureUserProfile:', error);
        throw error;
    }
}
