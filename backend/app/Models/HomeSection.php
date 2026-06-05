<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class HomeSection extends Model
{
    protected $fillable = [
        'section_key',
        'title',
        'subtitle',
        'description',
        'button_text',
        'button_url',
        'second_button_text',
        'second_button_url',
        'image',
        'extra_data',
        'sort_order',
        'is_active',
    ];

    protected $appends = ['url'];

    protected $casts = [
        'extra_data' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function getUrlAttribute()
    {
        return $this->image
            ? asset('storage/' . $this->image)
            : null;
    }
}