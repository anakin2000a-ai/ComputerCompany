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
       Schema::create('footer_settings', function (Blueprint $table) {
    $table->id();

    $table->string('logo')->nullable();
    $table->string('company_name')->default('Nexus Labs');
    $table->text('description')->nullable();

    $table->string('email')->nullable();
    $table->string('phone')->nullable();
    $table->string('address')->nullable();

    $table->string('facebook_url')->nullable();
    $table->string('instagram_url')->nullable();
    $table->string('linkedin_url')->nullable();
    $table->string('x_url')->nullable();

    $table->text('copyright_text')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('footer_settings');
    }
};
