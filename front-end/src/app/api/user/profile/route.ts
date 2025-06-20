import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase';

// GET /api/user/profile - Get user profile data
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🔍 Getting profile for user:', session.user.email);

        // Get user profile from database
        const { data: profile, error } = await supabaseServer
            .from('user_profiles')
            .select('*')
            .eq('email', session.user.email)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error fetching user profile:', error);
            return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
        }

        // If no profile exists, return defaults
        if (!profile) {
            return NextResponse.json({
                name: session.user.name || '',
                email: session.user.email,
                language: 'en',
                experience_level: 'beginner',
                budget_preference: 'moderate',
                notifications_enabled: true,
                preferred_regions: [],
                preferred_styles: [],
                preferred_seasons: []
            });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Error in GET /api/user/profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        
        console.log('💾 Updating profile for user:', session.user.email, 'with data:', body);

        // Validate required fields
        if (!body.name?.trim()) {
            return NextResponse.json({ 
                error: 'Name is required' 
            }, { status: 400 });
        }

        const profileData = {
            email: session.user.email,
            name: body.name.trim(),
            language: body.language || 'en',
            experience_level: body.experienceLevel || 'beginner',
            budget_preference: body.budgetPreference || 'moderate',
            notifications_enabled: body.notificationsEnabled ?? true,
            preferred_regions: body.preferredRegions || [],
            preferred_styles: body.preferredStyles || [],
            preferred_seasons: body.preferredSeasons || [],
            updated_at: new Date().toISOString()
        };

        // Try to update first, then insert if doesn't exist (upsert)
        const { data: profile, error } = await supabaseServer
            .from('user_profiles')
            .upsert(profileData, { 
                onConflict: 'email',
                ignoreDuplicates: false 
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving user profile:', error);
            return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
        }

        console.log('✅ Profile saved successfully:', profile);
        return NextResponse.json(profile);
    } catch (error) {
        console.error('Error in PUT /api/user/profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}