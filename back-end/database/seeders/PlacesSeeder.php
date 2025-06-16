<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Models\Place;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlacesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    // public function run() {
    //     $owner = User::where('role', 'business')->first();
    //     Place::factory()->count(10)->create([
    //         'owner_id' => $owner->id
    //     ]);
    // }
    public function run(): void
    {
        $maxRecords = 10; // Giới hạn an toàn
        $currentCount = 0;
        $apiKey = env('HOTPEPPER_API_KEY'); // Đặt trong .env
        $areas = ['Z011', 'Z012', 'Z013', 'Z014', 'Z015', 'Z016']; // Vùng toàn quốc Nhật Bản (ví dụ vài vùng chính)

        $allPlaces = [];

        foreach ($areas as $area) {
            for ($start = 1; $start <= $maxRecords; $start += 100) {
                $response = Http::withOptions(['verify' => false]) // Bỏ kiểm tra SSL
                    ->get('https://webservice.recruit.co.jp/hotpepper/gourmet/v1/', [
                        'key' => $apiKey,
                        'format' => 'json',
                        'large_area' => $area,
                        'count' => 100,
                        'start' => $start,
                    ]);

                if ($response->failed()) break;

                $results = $response->json();
                $shops = $results['results']['shop'] ?? [];

                foreach ($shops as $shop) {
                    if ($currentCount >= $maxRecords) break 2;
                    $allPlaces[] = [
                        'owner_id' => 1, // Giả định là admin tạo
                        'name' => $shop['name'] ?? 'No Name',
                        'description' => $shop['catch'] ?? '',
                        'address' => $shop['address'] ?? '',
                        'latitude' => $shop['lat'] ?? 0,
                        'longitude' => $shop['lng'] ?? 0,
                        'phone' => $shop['tel'] ?? null,
                        'email' => null,
                        'website' => $shop['urls']['pc'] ?? null,
                        'opening_hours' => json_encode([$shop['open'], $shop['close']]),
                        'average_rating' => 0,
                        'is_featured' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                        'source' => 'hotpepper',
                        'source_type'=> 'admin',
                        'is_ai_generated' => false,
                        'genre_name' => $shop['genre']['name'] ?? '',
                    ];
                    $currentCount++;

                }

                // Nếu kết quả trả về ít hơn count yêu cầu → không còn nữa
                if (count($shops) < 100) break;
                 sleep(1);
            }
        }

        // Chia nhỏ mảng để tránh quá tải khi insert
        foreach (array_chunk($allPlaces, 200) as $chunk) {
            DB::table('places')->insert($chunk);
        }
    }
}
