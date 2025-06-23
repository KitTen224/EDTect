<?php

namespace Database\Seeders;

use App\Models\AiInteractionLog;
use App\Models\AiSuggestion;
use App\Models\Itinerary;
use App\Models\Place;
use App\Models\User;
use Illuminate\Database\Seeder;

class AiSuggestionsSeeder extends Seeder
{
    public function run()
    {
        $users = User::all();
        $places = Place::all();
        $itineraries = Itinerary::all();

        foreach ($users as $user) {
            // 1. Lấy các tương tác gần đây của user
            $logs = AiInteractionLog::where('user_id', $user->id)
                ->orderByDesc('timestamp')
                ->take(5)
                ->get();

            foreach ($logs as $log) {
                // 2. Gợi ý các địa điểm khác cùng tags (nếu có)
                $place = $log->place;
                if (!$place || !$place->tags) continue;

                $tags = json_decode($place->tags, true);
                if (!$tags) continue;

                // 3. Lọc địa điểm mới có tags trùng
                $suggested = Place::where('id', '!=', $place->id)
                    ->whereJsonContains('tags', $tags[0]) // chỉ lấy tag đầu
                    ->inRandomOrder()
                    ->first();

                if (!$suggested) continue;

                AiSuggestion::create([
                    'user_id' => $user->id,
                    'place_id' => $suggested->id,
                    'itinerary_id' => $itineraries->where('user_id', $user->id)->random()->id ?? null,
                    'description' => "'{$place->name}'Aへの関心に基づいた提案",
                    'suggestion_date' => now(),
                    'timestamp' => now(),
                ]);
            }
        }
    }
}

