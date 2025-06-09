<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_interaction_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('action_type'); // search_place, add_to_itinerary, like_place,...
            $table->foreignId('place_id')->nullable()->constrained('places')->onDelete('set null');
            $table->foreignId('itinerary_id')->nullable()->constrained('itineraries')->onDelete('set null');
            $table->timestamp('timestamp')->useCurrent();
            $table->json('metadata')->nullable(); // ví dụ: {"search_term": "Kyoto temple"}
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_interaction_logs');
    }
};
