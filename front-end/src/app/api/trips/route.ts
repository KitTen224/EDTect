import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { SaveTripRequest } from '@/types/travel';
import jwt from 'jsonwebtoken';

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as { userId: string };
        return { id: decoded.userId };
    } catch (error) {
        return null;
    }
}

// GET /api/trips - Get user's saved trips
export async function GET(request: NextRequest) {
    try {
        // Get user from JWT token
        const user = await getUserFromToken(request);
        
        if (!user?.id) {
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
            .eq('user_id', user.id)
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
        console.log('🔄 POST /api/trips called');
        
        // Get user from JWT token
        const user = await getUserFromToken(request);
        
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        console.log('👤 Using authenticated user:', user.id);

        const body: SaveTripRequest = await request.json();
        console.log('📝 Request body received:', {
            hasTitle: !!body.title,
            hasFormData: !!body.form_data,
            hasTimelineData: !!body.timeline_data,
            title: body.title
        });
        
        // Validate required fields
        if (!body.title || !body.form_data || !body.timeline_data) {
            console.log('❌ Missing required fields');
            return NextResponse.json({ 
                error: 'Missing required fields: title, form_data, and timeline_data are required' 
            }, { status: 400 });
        }

        // Calculate total estimated cost from timeline
        const totalCost = body.timeline_data.days.reduce((sum, day) => sum + day.totalCost, 0);
        console.log('💰 Total cost calculated:', totalCost);

        // Generate share token if public
        const shareToken = body.is_public ? crypto.randomUUID() : null;

        const tripData = {
            user_id: user.id, // Use the user ID as-is
            title: body.title,
            description: body.description || null,
            form_data: body.form_data,
            timeline_data: body.timeline_data,
            total_duration: body.timeline_data.totalDuration
            // Temporarily remove fields that might not exist in table:
            // total_estimated_cost: totalCost,
            // regions: body.timeline_data.regions,
            // travel_styles: body.timeline_data.travelStyles,
            // season: body.timeline_data.season?.name || null,
            // is_public: body.is_public || false,
            // share_token: shareToken,
            // status: 'draft'
        };

        console.log('🗄️ Inserting trip data:', {
            user_id: tripData.user_id,
            title: tripData.title,
            total_duration: tripData.total_duration
        });

        // Insert the trip
        const { data: trip, error } = await supabaseServer
            .from('saved_trips')
            .insert(tripData)
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase error:', error);
            return NextResponse.json({ 
                error: 'Database error: Failed to save trip',
                details: error.message,
                code: error.code
            }, { status: 500 });
        }

        console.log('✅ Trip saved successfully:', trip.id);
        return NextResponse.json(trip, { status: 201 });
    } catch (error) {
        console.error('❌ Error in POST /api/trips:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ 
            error: 'Internal server error',
            details: errorMessage
        }, { status: 500 });
    }
}