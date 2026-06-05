<?php

namespace App\Services\Admin;

use App\Models\HomeSection;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class HomeSectionService
{
    public function getAll(): Collection
    {
        return HomeSection::query()
            ->orderBy('sort_order')
            ->latest()
            ->get();
    }

    public function create(array $data): HomeSection
    {
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $data['image'] = $this->uploadImage($data['image']);
        }

        $data['sort_order'] = $data['sort_order'] ?? 0;
        $data['is_active'] = $data['is_active'] ?? true;

        return HomeSection::create($data);
    }

    public function update(HomeSection $homeSection, array $data): HomeSection
    {
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $this->deleteImage($homeSection->image);
            $data['image'] = $this->uploadImage($data['image']);
        }

        $homeSection->update($data);

        return $homeSection->fresh();
    }

    public function delete(HomeSection $homeSection): bool
    {
        $this->deleteImage($homeSection->image);

        return $homeSection->delete();
    }

    private function uploadImage(UploadedFile $image): string
    {
        return $image->store('home-sections', 'public');
    }

    private function deleteImage(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}