<?php

namespace Database\Seeders;

use App\Models\AiUserProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class AiUserProfilesSeeder extends Seeder
{
    public function run()
    {
        //$travelStyles = ['adventure', 'relaxation', 'cultural', 'romantic', 'family'];
        $travelStyles = ['冒険', 'リラクゼーション', '文化', 'ロマンチック', '家族'];
        //$transportModes = ['train', 'bus', 'walk', 'bike', 'car'];
        $transportModes = ['電車', 'バス', '徒歩', '自転車', '車'];
        $budgets = ['low', 'medium', 'high'];
        //$budgets = ['低予算', '中予算', '高予算'];

        // $interestTags = [
        //     'sushi', 'ramen', 'onsen', 'castle', 'museum', 'park',
        //     'cafe', 'barbecue', 'nature', 'temple', 'shopping'
        // ];
        $interestTags = [
            '寿司',     // sushi
            'ラーメン', // ramen
            '居酒屋',
            'イタリアン',
            'フレンチ',
            'カフェ',   // cafe
            '焼肉',     // barbecue
            'Accommodation ',
            'Accommodation.hotel',
            'Building',
            'Building.accommodation',
            'Internet access',
            'Leisure',
            'Leisure.spa',
            'Leisure.spa.public bath',
            'Building.commercial',
        ];

        $users = User::all();

        foreach ($users as $user) {
            AiUserProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'travel_style' => collect($travelStyles)->random(),
                    'preferred_transport' => collect($transportModes)->random(),
                    'budget_level' => collect($budgets)->random(),
                    'interest_tags' =>  json_encode(collect($interestTags)->random(rand(3, 6))->values())
                ]
            );
        }
    }
}
