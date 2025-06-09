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
        Schema::create('booking_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->string('room_type')->nullable();
            $table->integer('number_of_rooms')->nullable();
            $table->string('menu_selected')->nullable();
            $table->string('table_preference')->nullable();
            $table->string('ticket_type')->nullable();
            $table->decimal('price_per_unit', 8, 2)->nullable();
            $table->decimal('total_price', 8, 2)->nullable();
            $table->text('notes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_details');
    }
};
