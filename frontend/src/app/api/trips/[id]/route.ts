import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { UpdateTripRequest } from '@/types/travel';
import jwt from 'jsonwebtoken';

interface RouteParams {
    params: {
        id: string;
    };
}

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

// GET /api/trips/[id] - Get a specific trip
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        console.log('🔍 GET /api/trips/[id] called with ID:', params.id);
        
        // Get user from JWT token
        const user = await getUserFromToken(request);
        
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        console.log('👤 Using authenticated user:', user.id);

        console.log('🗄️ Querying database for trip ID:', params.id);
        
        // Simplified query that works with our basic table structure
        const { data: trip, error } = await supabaseServer
            .from('saved_trips')
            .select('*')
            .eq('id', params.id)
            .eq('user_id', user.id) // Only get user's own trips for now
            .single();

        if (error) {
            console.error('❌ Database error:', error);
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
            }
            return NextResponse.json({ 
                error: 'Failed to fetch trip',
                details: error.message,
                code: error.code
            }, { status: 500 });
        }

        if (!trip) {
            console.log('❌ No trip found with ID:', params.id);
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        console.log('✅ Trip found:', {
            id: trip.id,
            title: trip.title,
            hasTimelineData: !!trip.timeline_data
        });

        return NextResponse.json(trip);
    } catch (error) {
        console.error('❌ Error in GET /api/trips/[id]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ 
            error: 'Internal server error',
            details: errorMessage
        }, { status: 500 });
    }
}

// PUT /api/trips/[id] - Update a trip
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        // Get user from JWT token
        const user = await getUserFromToken(request);
        
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: Partial<UpdateTripRequest> = await request.json();
        
        // Check if user owns the trip
        const { data: existingTrip, error: checkError } = await supabaseServer
            .from('saved_trips')
            .select('user_id, share_token')
            .eq('id', params.id)
            .single();

        if (checkError || !existingTrip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        if (existingTrip.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Prepare update data
        const updateData: any = {};
        
        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.form_data !== undefined) updateData.form_data = body.form_data;
        if (body.timeline_data !== undefined) {
            updateData.timeline_data = body.timeline_data;
            updateData.total_duration = body.timeline_data.totalDuration;
            updateData.total_estimated_cost = body.timeline_data.days.reduce((sum, day) => sum + day.totalCost, 0);
            updateData.regions = body.timeline_data.regions;
            updateData.travel_styles = body.timeline_data.travelStyles;
            updateData.season = body.timeline_data.season?.name || null;
        }
        if (body.is_public !== undefined) {
            updateData.is_public = body.is_public;
            // Generate or remove share token based on public status
            if (body.is_public && !existingTrip.share_token) {
                updateData.share_token = crypto.randomUUID();
            } else if (!body.is_public) {
                updateData.share_token = null;
            }
        }

        // Update the trip
        const { data: trip, error } = await supabaseServer
            .from('saved_trips')
            .update(updateData)
            .eq('id', params.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating trip:', error);
            return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
        }

        return NextResponse.json(trip);
    } catch (error) {
        console.error('Error in PUT /api/trips/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/trips/[id] - Delete a trip
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        // Get user from JWT token
        const user = await getUserFromToken(request);
        
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user owns the trip and delete
        const { error } = await supabaseServer
            .from('saved_trips')
            .delete()
            .eq('id', params.id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting trip:', error);
            return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error in DELETE /api/trips/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}