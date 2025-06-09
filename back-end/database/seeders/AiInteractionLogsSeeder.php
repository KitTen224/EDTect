<?php

namespace Database\Seeders;

use App\Models\AiInteractionLog;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AiInteractionLogsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run() {
        $users = User::all();
        foreach ($users as $user) {
            AiInteractionLog::create([
                'user_id' => $user->id,
                'interaction_type' => 'view_place',
                'interaction_data' => json_encode([
                    'place_id' => rand(1, 10)
                ]),
                'created_at' => now()
            ]);
        }
    }
}
