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
        Schema::create('feature_cards', function (Blueprint $table) {
        $table->id();

        $table->string('page')->default('home');
        $table->string('section_key')->default('workloads');

        $table->string('icon')->nullable();
        $table->string('title');
        $table->text('description')->nullable();

        $table->string('button_text')->nullable();
        $table->string('button_url')->nullable();

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
        Schema::dropIfExists('feature_cards');
    }
};
