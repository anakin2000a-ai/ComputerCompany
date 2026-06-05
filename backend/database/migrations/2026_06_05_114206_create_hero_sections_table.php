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
       Schema::create('hero_sections', function (Blueprint $table) {
    $table->id();

    $table->string('page')->default('home');
    $table->string('small_title')->nullable();
    $table->string('title');
    $table->string('highlighted_title')->nullable();
    $table->text('subtitle')->nullable();

    $table->string('primary_button_text')->nullable();
    $table->string('primary_button_url')->nullable();
    $table->string('secondary_button_text')->nullable();
    $table->string('secondary_button_url')->nullable();

    $table->string('background_image')->nullable();
    $table->boolean('is_active')->default(true);

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hero_sections');
    }
};
