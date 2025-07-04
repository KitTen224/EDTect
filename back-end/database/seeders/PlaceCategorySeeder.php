<?php
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

