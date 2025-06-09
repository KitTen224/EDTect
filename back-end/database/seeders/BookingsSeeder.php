<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Place;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BookingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run() {
        $users = User::all();
        $places = Place::all();
        foreach ($users as $user) {
            Booking::create([
                'user_id' => $user->id,
                'place_id' => $places->random()->id,
                'booking_time' => now()->addDays(rand(1, 10)),
                'number_of_people' => rand(1, 5),
                'special_requests' => 'Window seat, please.',
                'status' => 'pending'
            ]);
        }
    }
}
