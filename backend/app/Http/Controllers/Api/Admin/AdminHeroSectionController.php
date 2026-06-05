<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreHeroSectionRequest;
use App\Http\Requests\Admin\UpdateHeroSectionRequest;
use App\Models\HeroSection;
use App\Services\Admin\HeroSectionService;
use Illuminate\Http\JsonResponse;

class AdminHeroSectionController extends Controller
{
    public function __construct(
        private readonly HeroSectionService $heroSectionService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'status' => true,
            'message' => 'Hero sections fetched successfully.',
            'data' => $this->heroSectionService->getAll(),
        ]);
    }

    public function store(StoreHeroSectionRequest $request): JsonResponse
    {
        $heroSection = $this->heroSectionService->create(
            $request->validated()
        );

        return response()->json([
            'status' => true,
            'message' => 'Hero section created successfully.',
            'data' => $heroSection,
        ], 201);
    }

    public function show(HeroSection $heroSection): JsonResponse
    {
        return response()->json([
            'status' => true,
            'message' => 'Hero section fetched successfully.',
            'data' => $heroSection,
        ]);
    }

    public function update(
        UpdateHeroSectionRequest $request,
        HeroSection $heroSection
    ): JsonResponse {
        $heroSection = $this->heroSectionService->update(
            $heroSection,
            $request->validated()
        );

        return response()->json([
            'status' => true,
            'message' => 'Hero section updated successfully.',
            'data' => $heroSection,
        ]);
    }

    public function destroy(HeroSection $heroSection): JsonResponse
    {
        $this->heroSectionService->delete($heroSection);

        return response()->json([
            'status' => true,
            'message' => 'Hero section deleted successfully.',
        ]);
    }
}