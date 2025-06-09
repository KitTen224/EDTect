<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Booking;
use App\Models\Favorite;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
        $this->call([
            UsersSeeder::class,
            PlacesSeeder::class,
            HotelSeeder::class,
            TourisSeeder::class,
            PlaceCategorySeeder::class,
            ReviewsSeeder::class,
            BookingsSeeder::class,
            BookingDetailsSeeder::class,
            ItinerariesSeeder::class,
            ItineraryPlacesSeeder::class,
            FavoritesSeeder::class,
            // EventSeeder::class, //error
            AiInteractionLogsSeeder::class,
            AiSuggestionsSeeder::class,
            AiUserProfilesSeeder::class,
        ]);

    }
}
