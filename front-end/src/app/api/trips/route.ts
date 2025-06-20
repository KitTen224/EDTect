import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase';
import { SaveTripRequest } from '@/types/travel';
import { getUserIdFromSession } from '@/lib/user-utils';
import { ensureUserProfile } from '@/lib/user-profile';

// GET /api/trips - Get user's saved trips
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = getUserIdFromSession(session);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized - No user identifier' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Get trips for the user
        const { data: trips, error, count } = await supabaseServer
            .from('saved_trips')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching trips:', error);
            return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
        }

        return NextResponse.json({
            trips: trips || [],
            total: count || 0,
            page,
            limit
        });
    } catch (error) {
        console.error('Error in GET /api/trips:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/trips - Save a new trip
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        console.log('🔍 Trip save attempt - Session info:', {
            hasSession: !!session,
            hasUser: !!session?.user,
            userId: session?.user?.id,
            userEmail: session?.user?.email,
            userName: session?.user?.name
        });

        if (!session?.user) {
            console.error('❌ No session or user found');
            return NextResponse.json({ error: 'Unauthorized - Please sign in again' }, { status: 401 });
        }

        // Log user info before profile check
        const userId = getUserIdFromSession(session);
        console.log('📝 Checking user profile with ID:', userId);

        // Ensure user profile exists before proceeding
        try {
            const userProfile = await ensureUserProfile(session.user);
            console.log('✅ User profile verified:', userProfile);
        } catch (profileError) {
            console.error('❌ User profile operation failed:', profileError);
            if (profileError instanceof Error) {
                console.error('Error stack:', profileError.stack);
            }
            const errorMessage = profileError instanceof Error ? profileError.message : 'Could not ensure user profile.';
            return NextResponse.json({
                error: `User profile error: ${errorMessage}`,
                details: profileError instanceof Error ? profileError.stack : undefined
            }, { status: 500 });
        }

        if (!userId) {
            console.error('❌ No user identifier found');
            return NextResponse.json({ error: 'Unauthorized - No user identifier' }, { status: 401 });
        }

        console.log('🔑 Generated UUID for user:', session.user.id || session.user.email, '→', userId);

        const body: SaveTripRequest = await request.json();

        // Validate required fields
        if (!body.title || !body.form_data || !body.timeline_data) {
            return NextResponse.json({
                error: 'Missing required fields: title, form_data, and timeline_data are required'
            }, { status: 400 });
        }

        // Calculate total estimated cost from timeline
        const totalCost = body.timeline_data.days.reduce((sum, day) => sum + day.totalCost, 0);

        // Generate share token if public
        const shareToken = body.is_public ? crypto.randomUUID() : null;

        // Insert the trip
        console.log('💾 Saving trip with user ID:', userId);
        const { data: trip, error } = await supabaseServer
            .from('saved_trips')
            .insert({
                user_id: userId,
                title: body.title,
                description: body.description || null,
                form_data: body.form_data,
                timeline_data: body.timeline_data,
                total_duration: body.timeline_data.totalDuration,
                total_estimated_cost: totalCost,
                regions: body.timeline_data.regions,
                travel_styles: body.timeline_data.travelStyles,
                seasons: body.timeline_data.season?.name || null,
                is_public: body.is_public || false,
                share_token: shareToken,
                status: 'draft'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase insert error:', error);
            return NextResponse.json({ error: `Failed to save trip to database: ${error.message}` }, { status: 500 });
        }

        console.log('✅ Trip saved successfully:', trip);

        return NextResponse.json(trip, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/trips:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
    }
}