import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

interface RouteParams {
    params: {
        token: string;
    };
}

// GET /api/trips/shared/[token] - Get a shared trip by share token (no authentication required)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { token } = params;

        if (!token) {
            return NextResponse.json({ error: 'Share token is required' }, { status: 400 });
        }

        // Fetch the trip by share token, but only if it's public
        const { data: trip, error } = await supabaseServer
            .from('saved_trips')
            .select('*')
            .eq('share_token', token)
            .eq('is_public', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ 
                    error: 'This trip link is no longer valid or has been made private' 
                }, { status: 404 });
            }
            console.error('Error fetching shared trip:', error);
            return NextResponse.json({ error: 'Failed to fetch shared trip' }, { status: 500 });
        }

        if (!trip) {
            return NextResponse.json({ 
                error: 'This trip link is no longer valid or has been made private' 
            }, { status: 404 });
        }

        // Return the trip data but remove sensitive information
        const publicTripData = {
            ...trip,
            user_id: undefined, // Don't expose the original user ID for privacy
        };

        return NextResponse.json(publicTripData);
    } catch (error) {
        console.error('Error in GET /api/trips/shared/[token]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}