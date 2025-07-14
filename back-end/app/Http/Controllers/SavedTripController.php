<?php

namespace App\Http\Controllers;

use App\Models\SavedTrip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SavedTripController extends Controller
{
    /**
     * GET /api/trips
     * Return all trips belonging to the authenticated user.
     */
    public function index(Request $request)
    {
        $trips = SavedTrip::where('user_id', $request->user()->id)
                          ->orderBy('updated_at', 'desc')
                          ->get();

        return response()->json($trips);
    }

    /**
     * POST /api/trips
     * Validate and persist a new trip.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'          => 'required|string',
            'description'    => 'nullable|string',
            'form_data'      => 'required|array',
            'timeline_data'  => 'required|array',
            'total_duration' => 'required|integer',
        ]);

        $trip = SavedTrip::create([
            'user_id'        => Auth::id(),
            'title'          => $validated['title'],
            'description'    => $validated['description'] ?? null,
            'form_data'      => json_encode($validated['form_data']),
            'timeline_data'  => json_encode($validated['timeline_data']),
            'total_duration' => $validated['total_duration'],
        ]);

        return response()->json($trip, 201);
    }

    /**
     * DELETE /api/trips/{id}
     * Delete a trip owned by the authenticated user.
     */
    public function destroy($id)
    {
        $deleted = SavedTrip::where('id', $id)
                            ->where('user_id', Auth::id())
                            ->delete();

        if (! $deleted) {
            return response()->json(['error' => 'Not Found or Forbidden'], 404);
        }

        // 204 No Content is a common RESTful response on success
        return response()->json(null, 204);
    }
}
