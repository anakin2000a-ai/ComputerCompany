<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSection extends Model
{
    protected $fillable = [
        'page',
        'small_title',
        'title',
        'highlighted_title',
        'subtitle',
        'primary_button_text',
        'primary_button_url',
        'secondary_button_text',
        'secondary_button_url',
        'background_image',
        'is_active',
    ];
   
    protected $appends = [
        'image_url'
    ];

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        return asset('storage/' . $this->image);
    }
 

    protected $casts = [
        'is_active' => 'boolean',
    ];
}