<?php

// namespace Database\Seeders;

// use Illuminate\Database\Seeder;
// use Illuminate\Support\Str;
// use Illuminate\Support\Facades\DB;
// use App\Models\Place;
// use App\Models\Category;

// class PlaceCategorySeeder extends Seeder
// {
    // public function run()
    // {
        // $categories = [
        //     'Hotel',
        //     'Restaurant',
        //     'Cafe',
        //     'Museum',
        //     'Park',
        //     'Temple',
        //     'Zoo',
        //     'Castle',
        //     'Shopping',
        //     'Viewpoint',
        //     'Onsen',
        //     'Historical Site'
        // ];

    //     foreach ($categories as $cat) {
    //         Category::updateOrCreate(
    //             ['slug' => Str::slug($cat)],
    //             ['name' => $cat, 'icon' => null]
    //         );
    //     }

    //     // Tự động gán category vào bảng place_categories theo keyword đơn giản trong tên place
    //     $map = [
    //         'Hotel' => ['hotel', 'inn', 'ryokan','ホテル'],
    //         'Restaurant' => ['restaurant', 'grill', 'dining','レストラン'],
    //         'Cafe' => ['cafe', 'coffee','コーヒー'],
    //         'Museum' => ['museum'],
    //         'Park' => ['park','公園'],
    //         'Temple' => ['temple', 'shrine','神社'],
    //         'Zoo' => ['zoo', 'aquarium'],
    //         'Castle' => ['castle', 'palace'],
    //         'Shopping' => ['mall', 'market', 'shopping'],
    //         'Viewpoint' => ['viewpoint', 'observatory'],
    //         'Onsen' => ['onsen', 'hot spring'],
    //         'Historical Site' => ['ruins', 'historic']
    //     ];

    //     foreach (Place::all() as $place) {
    //         foreach ($map as $catName => $keywords) {
    //             foreach ($keywords as $kw) {
    //                 if (Str::contains(Str::lower($place->name), $kw)) {
    //                     $cat = Category::where('slug', Str::slug($catName))->first();
    //                     if ($cat) {
    //                         DB::table('place_categories')->updateOrInsert([
    //                             'place_id' => $place->id,
    //                             'category_id' => $cat->id
    //                         ]);
    //                     }
    //                     break;
    //                 }
    //             }
    //         }
    //     }
    // }


    namespace Database\Seeders;

    use Illuminate\Database\Seeder;
    use App\Models\Place;
    use App\Models\Category;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Str;

    class PlaceCategorySeeder extends Seeder
    {
        public function run()
        {
            $places = Place::all();

            foreach ($places as $place) {
                $categoryIds = [];

                // 👉 Nếu là dữ liệu từ Geoapify, lấy từ tags (JSON)
                if ($place->source === 'geoapify' && $place->tags) {
                    $tags = json_decode($place->tags, true);

                    foreach ($tags as $tag) {
                        $categoryName = ucfirst(str_replace('_', ' ', $tag));
                        $category = Category::firstOrCreate(
                            ['name' => $categoryName]
                        );
                        $categoryIds[] = $category->id;
                    }
                }

                // 👉 Nếu là Hotpepper, tạm thời lấy từ catch phrase (hoặc từ khóa mô tả)
                if ($place->source === 'hotpepper') {
                    // Ví dụ mô phỏng genre.name đã được lưu trong description
                    $desc = $place->description;

                    // Map từ tiếng Nhật sang tiếng Anh (tuỳ ý)
                    $genreMap = [
                        '居酒屋' => 'Izakaya',
                        '寿司' => 'Sushi',
                        'ラーメン' => 'Ramen',
                        '焼肉' => 'Barbecue',
                        'カフェ' => 'Cafe',
                        'イタリアン' => 'Italian',
                        'フレンチ' => 'French',
                    ];

                    foreach ($genreMap as $jp => $en) {
                        if (mb_strpos($desc, $jp) !== false) {
                            $category = Category::firstOrCreate(['name' => $en]);
                            $categoryIds[] = $category->id;
                        }
                    }
                }
                // Nếu có category thì gán
                if (!empty($categoryIds)) {
                    $place->categories()->syncWithoutDetaching($categoryIds);
                }
            }
        }
    }

