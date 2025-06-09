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
   public function run()
    {
        $users = User::all();
        $places = Place::all();

        $requests = [
            '窓際の席をお願いします。',
            '静かな席を希望します。',
            'ベジタリアンメニューを用意してください。',
            '誕生日用のサプライズをお願いします。',
            '子供用の椅子をお願いします。',
        ];

        $statuses = ['pending', 'confirmed', 'cancelled'];

        foreach ($users as $user) {
            Booking::create([
                'user_id' => $user->id,
                'place_id' => $places->random()->id,
                'booking_time' => now()->addDays(rand(1, 10)),
                'number_of_people' => rand(1, 5),
                'special_requests' => $requests[array_rand($requests)],
                'status' => $statuses[array_rand($statuses)],
            ]);
        }
    }

}
