<?php

namespace Database\Seeders;

use App\Models\AiUserProfile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AiUserProfilesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run() {
        $users = User ::all();
        foreach ($users as $user) {
            AiUserProfile::create([
                'user_id' => $user->id,
                'preferences' => json_encode([
                    'food' => ['vegan', 'japanese'],
                    'lodging' => ['hotel'],
                    'interests' => ['nature', 'history']
                ]),
                'travel_style' => 'solo',
                'budget_level' => 'medium'
            ]);
        }
    }
}
