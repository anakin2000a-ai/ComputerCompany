<?php

namespace App\Services\Admin;

use App\Models\FeatureCard;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FeatureCardService
{
    public function getAll(): Collection
    {
        return FeatureCard::query()
            ->orderBy('sort_order')
            ->latest()
            ->get();
    }

    public function create(array $data): FeatureCard
    {
        if (isset($data['icon']) && $data['icon'] instanceof UploadedFile) {
            $data['icon'] = $this->uploadIcon($data['icon']);
        }

        $data['page'] = $data['page'] ?? 'home';
        $data['section_key'] = $data['section_key'] ?? 'workloads';
        $data['sort_order'] = $data['sort_order'] ?? 0;
        $data['is_active'] = $data['is_active'] ?? true;

        return FeatureCard::create($data);
    }

    public function update(FeatureCard $featureCard, array $data): FeatureCard
    {
        if (isset($data['icon']) && $data['icon'] instanceof UploadedFile) {
            $this->deleteIcon($featureCard->icon);
            $data['icon'] = $this->uploadIcon($data['icon']);
        }

        $featureCard->update($data);

        return $featureCard->fresh();
    }

    public function delete(FeatureCard $featureCard): bool
    {
        $this->deleteIcon($featureCard->icon);

        return $featureCard->delete();
    }

    private function uploadIcon(UploadedFile $icon): string
    {
        return $icon->store('feature-cards', 'public');
    }

    private function deleteIcon(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}