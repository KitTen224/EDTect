<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('ai_interaction_logs', function (Blueprint $table) {
            $table->text('prompt_text')->nullable()->after('action_type');
            $table->text('response_text')->nullable()->after('prompt_text');
            $table->string('model_used', 255)->nullable()->after('response_text');
        });
    }

    public function down()
    {
        Schema::table('ai_interaction_logs', function (Blueprint $table) {
            $table->dropColumn(['prompt_text', 'response_text', 'model_used']);
        });
    }

};
