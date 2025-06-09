<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ExportAIDataset extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'export:ai-dataset';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
        public function handle()
    {
        $places = DB::table('places')->select('id', 'name', 'tags', 'genre_name')->get();
        $profiles = DB::table('ai_user_profiles')->select('user_id', 'interest_tags')->get();

        // Export places
        $placesCsv = $places->map(fn($row) => [
            $row->id,
            $row->name,
            $row->tags,
            $row->genre_name
        ])->prepend(['id', 'name', 'tags', 'genre_name']);

        Storage::put('public/places.csv', $placesCsv->map(fn($r) => implode(',', $r))->implode("\n"));

        // Export profiles
        $profilesCsv = $profiles->map(fn($row) => [
            $row->user_id,
            $row->interest_tags
        ])->prepend(['user_id', 'interest_tags']);

        Storage::put('public/ai_user_profiles.csv', $profilesCsv->map(fn($r) => implode(',', $r))->implode("\n"));

        $this->info("✅ Exported AI dataset thành công.");
    }
}
