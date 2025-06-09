<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\Place;
use App\Models\Category;

class PlaceCategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            'Hotel',
            'Restaurant',
            'Cafe',
            'Museum',
            'Park',
            'Temple',
            'Zoo',
            'Castle',
            'Shopping',
            'Viewpoint',
            'Onsen',
            'Historical Site'
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['slug' => Str::slug($cat)],
                ['name' => $cat, 'icon' => null]
            );
        }

        // Tự động gán category vào bảng place_categories theo keyword đơn giản trong tên place
        $map = [
            'Hotel' => ['hotel', 'inn', 'ryokan','ホテル'],
            'Restaurant' => ['restaurant', 'grill', 'dining','レストラン'],
            'Cafe' => ['cafe', 'coffee','コーヒー'],
            'Museum' => ['museum'],
            'Park' => ['park','公園'],
            'Temple' => ['temple', 'shrine','神社'],
            'Zoo' => ['zoo', 'aquarium'],
            'Castle' => ['castle', 'palace'],
            'Shopping' => ['mall', 'market', 'shopping'],
            'Viewpoint' => ['viewpoint', 'observatory'],
            'Onsen' => ['onsen', 'hot spring'],
            'Historical Site' => ['ruins', 'historic']
        ];

        foreach (Place::all() as $place) {
            foreach ($map as $catName => $keywords) {
                foreach ($keywords as $kw) {
                    if (Str::contains(Str::lower($place->name), $kw)) {
                        $cat = Category::where('slug', Str::slug($catName))->first();
                        if ($cat) {
                            DB::table('place_categories')->updateOrInsert([
                                'place_id' => $place->id,
                                'category_id' => $cat->id
                            ]);
                        }
                        break;
                    }
                }
            }
        }
    }
}
