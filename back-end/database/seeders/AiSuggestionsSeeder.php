<?php

namespace Database\Seeders;

use App\Models\AiSuggestion;
use App\Models\Place;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AiSuggestionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run() {
        $users = User::all();
        $places = Place::all();
        foreach ($users as $user) {
            AiSuggestion::create([
                'user_id' => $user->id,
                'place_id' => $places->random()->id,
                'suggestion_date' => now()->format('Y-m-d'),
                'reason' => 'Based on your interests in food and nature.'
            ]);
        }
    }
}
