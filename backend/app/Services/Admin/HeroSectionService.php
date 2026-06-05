<?php

namespace App\Services\Admin;

use App\Models\HeroSection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class HeroSectionService
{
    public function getAll()
    {
        return HeroSection::latest()->get();
    }

    public function create(array $data): HeroSection
    {
        if (isset($data['background_image']) && $data['background_image'] instanceof UploadedFile) {
            $data['background_image'] = $this->uploadImage($data['background_image']);
        }

        $data['is_active'] = $data['is_active'] ?? true;

        return HeroSection::create($data);
    }

    public function update(HeroSection $heroSection, array $data): HeroSection
    {
        if (isset($data['background_image']) && $data['background_image'] instanceof UploadedFile) {
            $this->deleteImage($heroSection->background_image);
            $data['background_image'] = $this->uploadImage($data['background_image']);
        }

        $heroSection->update($data);

        return $heroSection->fresh();
    }

    public function delete(HeroSection $heroSection): bool
    {
        $this->deleteImage($heroSection->background_image);

        return $heroSection->delete();
    }

    private function uploadImage(UploadedFile $image): string
    {
        return $image->store('hero-sections', 'public');
    }

    private function deleteImage(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}