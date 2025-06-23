<?php

namespace Database\Seeders;

use App\Models\Place;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReviewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run() {
        $comments = [
            '料理がとても美味しかったです！', // Thức ăn rất ngon!
            'スタッフがとても親切でした。',   // Nhân viên thân thiện.
            '少し狭いですが、清潔感があります。', // Không gian hơi chật nhưng sạch sẽ.
            'また行きたくなるお店です。',       // Rất đáng để quay lại.
            '少し高めですが、質が良いです。',     // Giá hơi cao nhưng chất lượng tốt.
        ];
        $places = Place::all();
        foreach ($places as $place) {
            for ($i = 0; $i < rand(1, 5); $i++) {
                Review::create([
                    'user_id' => rand(1,5),
                    'place_id' => $place->id,
                    'rating' => rand(1,5),
                    'comment' => $comments[array_rand($comments)],
                ]);
            }
        }
    }
}
