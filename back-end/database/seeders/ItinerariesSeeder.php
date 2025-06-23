<?php

namespace Database\Seeders;

use App\Models\Itinerary;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ItinerariesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run() {
        $users = User::all();
        foreach ($users as $user) {
            Itinerary::create([
                'user_id' => $user->id,
                'title' => 'My Solo Trip Plan',
                'description' => 'Plan for visiting exciting places alone.',
                'start_date' => now()->addDays(3)->format('Y-m-d'),
                'end_date' => now()->addDays(5)->format('Y-m-d'),
            ]);
        }
    }
}
