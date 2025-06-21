<?php

namespace Database\Seeders;

use App\Models\Itinerary;
use App\Models\ItineraryPlace;
use App\Models\Place;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ItineraryPlacesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run() {
        $itineraries = Itinerary::all();
        $places = Place::all();
        foreach ($itineraries as $itinerary) {
            ItineraryPlace::create([
                'itinerary_id' => $itinerary->id,
                'place_id' => $places->random()->id,
                'visit_date' => now()->addDays(3)->format('Y-m-d'),
                'start_time' => '09:00:00',
                'end_time' => '12:00:00',
                'notes' => 'Morning visit',
                'order' => 1
            ]);
        }
    }
}
