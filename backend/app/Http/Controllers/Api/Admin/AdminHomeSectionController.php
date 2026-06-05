<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreHomeSectionRequest;
use App\Http\Requests\Admin\UpdateHomeSectionRequest;
use App\Models\HomeSection;
use App\Services\Admin\HomeSectionService;
use Illuminate\Http\JsonResponse;

class AdminHomeSectionController extends Controller
{
    public function __construct(
        private readonly HomeSectionService $homeSectionService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'status' => true,
            'message' => 'Home sections fetched successfully.',
            'data' => $this->homeSectionService->getAll(),
        ]);
    }

    public function store(StoreHomeSectionRequest $request): JsonResponse
    {
        $homeSection = $this->homeSectionService->create(
            $request->validated()
        );

        return response()->json([
            'status' => true,
            'message' => 'Home section created successfully.',
            'data' => $homeSection,
        ], 201);
    }

    public function show(HomeSection $homeSection): JsonResponse
    {
        return response()->json([
            'status' => true,
            'message' => 'Home section fetched successfully.',
            'data' => $homeSection,
        ]);
    }

    public function update(
        UpdateHomeSectionRequest $request,
        HomeSection $homeSection
    ): JsonResponse {
        $homeSection = $this->homeSectionService->update(
            $homeSection,
            $request->validated()
        );

        return response()->json([
            'status' => true,
            'message' => 'Home section updated successfully.',
            'data' => $homeSection,
        ]);
    }

    public function destroy(HomeSection $homeSection): JsonResponse
    {
        $this->homeSectionService->delete($homeSection);

        return response()->json([
            'status' => true,
            'message' => 'Home section deleted successfully.',
        ]);
    }
}