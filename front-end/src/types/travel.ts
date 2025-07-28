export interface JapanTravelFormData {
    regions: RegionWithDays[]; // Multiple regions with day allocation
    totalDuration: number; // Total days (max 7)
    travelStyles: JapanTravelStyle[]; // Multiple travel styles
    season?: JapanSeason | null ;
    interests: JapanInterest[];
}

export interface RegionWithDays {
    region: JapanRegion;
    days: number; // Days allocated to this region
    order?: number; // Order in which region should appear in itinerary (1 = first, 2 = second, etc.)
}

export interface JapanRegion {
    id: string;
    name: string;
    nameJapanese: string;
    description: string;
    icon: string;
    prefecture?: string[];
}

export interface JapanTravelStyle {
    id: 'traditional' | 'modern' | 'nature' | 'urban' | 'spiritual' | 'foodie' | 'otaku' | 'ryokan';
    name: string;
    nameJapanese: string;
    description: string;
    icon: string;
}

export interface JapanSeason {
    id: 'spring' | 'summer' | 'autumn' | 'winter' | 'any';
    name: string;
    nameJapanese: string;
    description: string;
    highlights: string[];
}

export interface JapanInterest {
    id: string;
    name: string;
    nameJapanese: string;
    category: 'culture' | 'food' | 'nature' | 'entertainment' | 'spiritual' | 'modern';
    icon: string;
}

export interface Location {
    lat: number;
    lng: number;
    address: string;
}

export interface DayItinerary {
    day: number;
    places: Place[];
    accommodation: Place[];
    restaurants: Place[];
}

export interface Place {
    name: string;
    description: string;
    location: Location;
    estimatedCost: number;
    rating?: number;
}

// Timeline-specific interfaces for drag-and-drop functionality
export interface TimelineActivity {
    id: string;
    name: string;
    nameJapanese?: string;
    description: string;
    startTime: string; // e.g., "09:00"
    duration: number; // in minutes
    type: 'attraction' | 'meal' | 'transport' | 'accommodation' | 'experience';
    icon: string;
    estimatedCost?: number;
    location?: string;
    notes?: string;
    // Transport tracking
    currentLocation?: TransportLocation;
    nextLocation?: TransportLocation;
    transportMethod?: TransportMethod;
}

export interface TransportLocation {
    name: string;
    nameJapanese?: string;
    area: string; // e.g., "Shibuya", "Asakusa", "Ginza"
    ward?: string; // e.g., "Shibuya-ku", "Taito-ku"
    station?: string; // Nearest major station
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface TransportMethod {
    type: 'walk' | 'train' | 'subway' | 'bus' | 'taxi' | 'shinkansen' | 'ferry';
    line?: string; // e.g., "JR Yamanote Line", "Tokyo Metro Ginza Line"
    duration: number; // minutes
    cost: number; // yen
    instructions?: string; // e.g., "Take JR Yamanote Line from Shibuya to Ueno (29 min)"
}

export interface TimelineDay {
    dayNumber: number;
    date?: string;
    region: JapanRegion;
    activities: TimelineActivity[];
    totalCost: number;
}

export interface JapanTimeline {
    days: TimelineDay[];
    totalDuration: number;
    regions: RegionWithDays[];
    travelStyles: JapanTravelStyle[];
    season?: JapanSeason | null;
}

// Database and Authentication Types
export interface UserProfile {
    id: string;
    email?: string;
    name?: string;
    image?: string;
    created_at: string;
    updated_at: string;
    
    // Travel preferences
    preferred_travel_styles: JapanTravelStyle[];
    preferred_seasons: JapanSeason[];
    preferred_regions: JapanRegion[];
    travel_experience_level: 'beginner' | 'intermediate' | 'expert';
    budget_preference: 'budget' | 'moderate' | 'luxury';
    
    // User settings
    language: 'en' | 'ja';
    timezone: string;
    notifications_enabled: boolean;
}

export interface SavedTrip {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    
    // Trip data
    form_data: JapanTravelFormData;
    timeline_data: JapanTimeline;
    
    // Trip metadata
    total_duration: number;
    total_estimated_cost?: number;
    regions: RegionWithDays[];
    travel_styles: JapanTravelStyle[];
    season?: string | null;
    
    // Sharing and collaboration
    is_public: boolean;
    share_token?: string;
    
    // Timestamps
    created_at: string;
    updated_at: string;
    
    // Trip status
    status: 'draft' | 'confirmed' | 'completed' | 'cancelled';
}

export interface TripCollaborator {
    id: string;
    trip_id: string;
    user_id: string;
    role: 'owner' | 'editor' | 'viewer';
    invited_by?: string;
    invited_at: string;
    accepted_at?: string;
}

// API Response types
export interface SaveTripRequest {
    title: string;
    description?: string;
    form_data: JapanTravelFormData;
    timeline_data: JapanTimeline;
    is_public?: boolean;
}

export interface UpdateTripRequest extends Partial<SaveTripRequest> {
    id: string;
}

export interface GetTripsResponse {
    trips: SavedTrip[];
    total: number;
    page: number;
    limit: number;
}