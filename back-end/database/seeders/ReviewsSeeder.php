<?php

namespace Database\Seeders;

use App\Models\Place;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReviewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run() {
        $users = User::all();
        $places = Place::all();
        foreach ($places as $place) {
            Review::create([
                'user_id' => $users->random()->id,
                'place_id' => $place->id,
                'rating' => rand(1,5),
                'comment' => 'Great place!',
            ]);
        }
    }
}
