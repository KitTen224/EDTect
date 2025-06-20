<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Place;
use App\Models\Itinerary;
use App\Models\AiInteractionLog;

class AiInteractionLogsSeeder extends Seeder
{
    public function run()
    {
        $users = User::all();
        $places = Place::all();
        $itineraries = Itinerary::all();

        $actions = [
            'search_place' => fn() => ['search_term' => fake()->word()],
            'like_place' => fn() => ['liked' => true],
            'add_to_itinerary' => fn() => ['notes' => fake()->sentence()],
            'view_place' => fn() => ['duration_seconds' => rand(10, 600)],
        ];

        foreach ($users as $user) {
            for ($i = 0; $i < rand(5, 15); $i++) {
                $actionType = array_rand($actions);
                $place = $places->random();
                $itinerary = $itineraries->random();

                AiInteractionLog::create([
                    'user_id' => $user->id,
                    'place_id' => $place->id,
                    'itinerary_id' => rand(0, 1) ? $itinerary->id : null,
                    'action_type' => $actionType,
                    'prompt_text' => 'Create 5-day spring itinerary for Tokyo and Kyoto.',
                    'response_text' => 'Generated itinerary with temple visits and food experiences.',
                    'model_used' => 'gemini-1.5-flash',
                    'metadata' => json_encode(['regions' => ['Tokyo', 'Kyoto'], 'season' => 'Spring']),
                    'timestamp' => now()->subDays(rand(0, 30))->addMinutes(rand(0, 1440)),
                ]);
            }
        }
    }
}
