import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase';
import { SaveTripRequest } from '@/types/travel';

// GET /api/trips - Get user's saved trips
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Get trips for the user
        const { data: trips, error, count } = await supabaseServer
            .from('saved_trips')
            .select('*', { count: 'exact' })
            .eq('user_id', session.user.id)
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
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
        const { data: trip, error } = await supabaseServer
            .from('saved_trips')
            .insert({
                user_id: session.user.id,
                title: body.title,
                description: body.description || null,
                form_data: body.form_data,
                timeline_data: body.timeline_data,
                total_duration: body.timeline_data.totalDuration,
                total_estimated_cost: totalCost,
                regions: body.timeline_data.regions,
                travel_styles: body.timeline_data.travelStyles,
                season: body.timeline_data.season?.name || null,
                is_public: body.is_public || false,
                share_token: shareToken,
                status: 'draft'
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving trip:', error);
            return NextResponse.json({ error: 'Failed to save trip' }, { status: 500 });
        }

        return NextResponse.json(trip, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/trips:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}