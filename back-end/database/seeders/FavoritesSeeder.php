<?php

namespace Database\Seeders;

use App\Models\Favorite;
use App\Models\Place;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FavoritesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run() {
        $users = User::all();
        $places = Place::all();
        foreach ($users as $user) {
            Favorite::create([
                'user_id' => $user->id,
                'place_id' => $places->random()->id
            ]);
        }
    }
}
