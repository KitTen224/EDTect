<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class HotelSeeder extends Seeder
{
    protected $regions = [
        ['name'=>'Hokkaido','lat_min'=>41.5,'lon_min'=>140.0,'lat_max'=>46.0,'lon_max'=>146.0],
        ['name'=>'Tohoku','lat_min'=>38.0,'lon_min'=>139.0,'lat_max'=>41.5,'lon_max'=>142.5],
        ['name'=>'Kanto','lat_min'=>35.0,'lon_min'=>138.0,'lat_max'=>37.5,'lon_max'=>141.0],
        ['name'=>'Chubu','lat_min'=>35.0,'lon_min'=>136.0,'lat_max'=>38.0,'lon_max'=>140.0],
        ['name'=>'Kansai','lat_min'=>34.0,'lon_min'=>134.0,'lat_max'=>36.0,'lon_max'=>137.0],
        ['name'=>'Chugoku','lat_min'=>33.0,'lon_min'=>131.0,'lat_max'=>35.0,'lon_max'=>135.0],
        ['name'=>'Shikoku','lat_min'=>33.0,'lon_min'=>133.0,'lat_max'=>35.0,'lon_max'=>134.5],
        ['name'=>'Kyushu','lat_min'=>30.5,'lon_min'=>129.0,'lat_max'=>33.5,'lon_max'=>132.5],
    ];

    public function run()
    {
        $apiKey = env('GEOAPIFY_API_KEY');
        if (!$apiKey) {
            $this->command->error('Geoapify API key not set!');
            return;
        }

        //$adminId = User::where('role','admin')->value('id') ?? 1;

        foreach ($this->regions as $reg) {
            $response =  Http::withOptions(['verify' => false]) // Bỏ kiểm tra SSL
                    ->get('https://api.geoapify.com/v2/places', [
                'categories' => 'accommodation.hotel',
                'filter' => "rect:{$reg['lon_min']},{$reg['lat_min']},{$reg['lon_max']},{$reg['lat_max']}",
                'limit' => 100,
                'apiKey' => $apiKey,
                'format' => 'json',
            ]);

            if (!$response->successful()) {
                $this->command->warn("Failed region: {$reg['name']}");
                continue;
            }

            $features = $response->json()['features'] ?? [];
            $this->command->info("Region {$reg['name']}: got " . count($features));

            foreach ($features as $f) {
                $props = $f['properties'] ?? [];
                $coords = $f['geometry']['coordinates'] ?? [null, null];
                DB::table('places')->insert([
                    'owner_id' => 1,
                    'name' => $props['name'] ?? 'Unnamed Hotel',
                    'address' => $props['address_line1'] ?? $props['formatted'] ?? '',
                    'latitude' => $coords[1],
                    'longitude' => $coords[0],
                    'description' => $props['name'] ?? '',
                    'average_rating' => 0,
                    'is_featured' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                    'source' => 'geoapify',
                    'tags' => json_encode($props['categories'] ?? []),
                ]);
            }

            sleep(1); // tránh bị block
        }
    }
}
