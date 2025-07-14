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
        Schema::create('saved_trips', function (Blueprint $table) {
            $table->id();
              $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->string('title');
    $table->text('description')->nullable();
    $table->json('form_data');
    $table->json('timeline_data');
    $table->integer('total_duration');
     $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_trips');
    }
};
