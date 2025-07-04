<?php

namespace App\Http\Controllers;

use App\Models\Itinerary;
use App\Models\ItineraryPlace;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AIController extends Controller
{
    public function saveItinerary(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'days' => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            $itinerary = Itinerary::create([
                'user_id' => $data['user_id'],
                'title' => $data['title'],
                'description' => $data['description'] ?? '',
                'start_date' => now(),
                'end_date' => now()->addDays(count($data['days'])),
            ]);

            foreach ($data['days'] as $day) {
                $activityIndex = 0;
                foreach ($day['activities'] as $activity) {
                    $place = Place::firstOrCreate([
                        'name' => $activity['title'],
                        'address' => $activity['location'],
                        'owner_id' => $data['user_id'],
                    ], [
                        'description' => $activity['description'],
                        'genre_name' => $activity['type'],
                        'tags' => json_encode([$activity['icon']]),
                    ]);

                    ItineraryPlace::create([
                        'itinerary_id' => $itinerary->id,
                        'place_id' => $place->id,
                        'visit_date' => now()->addDays($day['dayNumber'] - 1),
                        'start_time' => $activity['time'],
                        'notes' => $activity['description'],
                         'order' => $activityIndex++,
                    ]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Itinerary saved successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("❌ AI itinerary save failed: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        };

    }

}
