<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Place;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $regions = [
            // 'Hokkaido, Japan',
            'Sendai, Japan',
            'Tokyo, Japan',
            'Nagoya, Japan',
            'Osaka, Japan',
            'Hiroshima, Japan',
            'Fukuoka, Japan',
            'Okinawa, Japan',
        ];

       foreach ($regions as $region) {
            $response =$response = Http::withToken(config('services.eventbrite.token'))
                ->get('https://www.eventbriteapi.com/v3/events/search/', [
                    'location.address' => $region,
                    'location.within' => '50km',
                    'expand' => 'venue',
                    'sort_by' => 'date',
                ]);
                dd($response->status(), $response->json());


            if ($response->successful()) {
                $events = $response->json()['events'] ?? [];
                $place = Place::inRandomOrder()->first(); // Tạm gán 1 place chung

                foreach ($events as $e) {
                    // Bỏ sự kiện không có thời gian bắt đầu
                    if (empty($e['start']['local']) || empty($e['end']['local'])) {
                        continue;
                    }

                    Event::create([
                        'user_id' => 1,
                        'place_id' => $place->id,
                        'title' => $e['name']['text'] ?? 'イベント',
                        'description' => $e['description']['text'] ?? '詳細は未定。',
                        'start_time' => $e['start']['local'],
                        'end_time' => $e['end']['local'],
                        'image_url' => $e['logo']['url'] ?? null,
                    ]);
                }

                echo count($events) . " events imported.\n";
            } else {
                echo "Eventbrite API failed: " . $response->status();
            }
        }
    }
}
