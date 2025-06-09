<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingDetail;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BookingDetailsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run() {
        $bookings = Booking::all();
        foreach ($bookings as $booking) {
            BookingDetail::create([
                'booking_id' => $booking->id,
                'room_type' => 'Deluxe',
                'number_of_rooms' => 1,
                'menu_selected' => 'Vegan Set',
                'table_preference' => 'Window',
                'ticket_type' => 'VIP',
                'price_per_unit' => 120.00,
                'total_price' => 120.00,
                'notes' => 'Special occasion'
            ]);
        }
    }
}
