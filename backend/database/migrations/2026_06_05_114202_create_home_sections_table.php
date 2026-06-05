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
       Schema::create('home_sections', function (Blueprint $table) {
    $table->id();

    $table->string('section_key')->unique();
    // hero, workload_cards, about_preview, latest_insights

    $table->string('title')->nullable();
    $table->string('subtitle')->nullable();
    $table->longText('description')->nullable();

    $table->string('button_text')->nullable();
    $table->string('button_url')->nullable();
    $table->string('second_button_text')->nullable();
    $table->string('second_button_url')->nullable();

    $table->string('image')->nullable();
    $table->json('extra_data')->nullable();

    $table->integer('sort_order')->default(0);
    $table->boolean('is_active')->default(true);

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_sections');
    }
};
