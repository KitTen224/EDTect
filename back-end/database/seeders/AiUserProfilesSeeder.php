<?php

namespace Database\Seeders;

use App\Models\AiUserProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class AiUserProfilesSeeder extends Seeder
{
    public function run()
    {
        $travelStyles = ['adventure', 'relaxation', 'cultural', 'romantic', 'family'];
        $transportModes = ['train', 'bus', 'walk', 'bike', 'car'];
        $budgets = ['low', 'medium', 'high'];
        $interestTags = [
            'sushi', 'ramen', 'onsen', 'castle', 'museum', 'park',
            'cafe', 'barbecue', 'nature', 'temple', 'shopping'
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
