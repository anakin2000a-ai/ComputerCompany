<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeatureCard extends Model
{
    protected $fillable = [
        'page',
        'section_key',
        'icon',
        'title',
        'description',
        'button_text',
        'button_url',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}