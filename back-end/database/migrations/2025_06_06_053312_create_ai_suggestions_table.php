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
        Schema::create('ai_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Có thể là gợi ý chung
            $table->foreignId('place_id')->nullable()->constrained('places')->onDelete('set null');
            $table->foreignId('itinerary_id')->nullable()->constrained('itineraries')->onDelete('set null');
            $table->text('description')->nullable(); // lý do gợi ý
            $table->timestamp('timestamp')->useCurrent(); // AI log hành vi lúc nào
            $table->timestamp('suggestion_date')->nullable()->useCurrent(); // Ngày AI gợi ý
            $table->timestamps(); // created_at / updated_at như bình thường
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_suggestions');
    }
};
