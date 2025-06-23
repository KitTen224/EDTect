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
    public function run()
    {
        $bookings = Booking::all();

        $roomTypes = ['シングル', 'ダブル', 'ツイン', 'デラックス'];
        $menus = ['ビーガンセット', '和食コース', '洋食ディナー', 'お子様セット'];
        $tables = ['窓際', '静かな場所', 'カウンター席', '個室'];
        $ticketTypes = ['一般', 'VIP', 'プレミアム', '学割'];
        $notes = [
            '記念日です。静かな席を希望します。', // Kỷ niệm - muốn chỗ yên tĩnh
            'アレルギーがあります。ピーナッツなしでお願いします。', // Dị ứng
            '子供連れです。子供用の椅子をお願いします。', // Có trẻ em
            'サプライズを用意してください。', // Chuẩn bị bất ngờ
            '特別な日のため、花を飾ってください。' // Ngày đặc biệt, trang trí hoa
        ];

        foreach ($bookings as $booking) {
            $numberOfRooms = rand(1, 3);
            $pricePerUnit = rand(80, 150); // Giá ngẫu nhiên

            BookingDetail::create([
                'booking_id' => $booking->id,
                'room_type' => $roomTypes[array_rand($roomTypes)],
                'number_of_rooms' => $numberOfRooms,
                'menu_selected' => $menus[array_rand($menus)],
                'table_preference' => $tables[array_rand($tables)],
                'ticket_type' => $ticketTypes[array_rand($ticketTypes)],
                'price_per_unit' => $pricePerUnit,
                'total_price' => $pricePerUnit * $numberOfRooms,
                'notes' => $notes[array_rand($notes)],
            ]);
        }
    }
}
