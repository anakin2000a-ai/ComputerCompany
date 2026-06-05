<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFeatureCardRequest;
use App\Http\Requests\Admin\UpdateFeatureCardRequest;
use App\Models\FeatureCard;
use App\Services\Admin\FeatureCardService;
use Illuminate\Http\JsonResponse;

class AdminFeatureCardController extends Controller
{
    public function __construct(
        private readonly FeatureCardService $featureCardService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'status' => true,
            'message' => 'Feature cards fetched successfully.',
            'data' => $this->featureCardService->getAll(),
        ]);
    }

    public function store(StoreFeatureCardRequest $request): JsonResponse
    {
        $featureCard = $this->featureCardService->create($request->validated());

        return response()->json([
            'status' => true,
            'message' => 'Feature card created successfully.',
            'data' => $featureCard,
        ], 201);
    }

    public function show(FeatureCard $featureCard): JsonResponse
    {
        return response()->json([
            'status' => true,
            'message' => 'Feature card fetched successfully.',
            'data' => $featureCard,
        ]);
    }

    public function update(
        UpdateFeatureCardRequest $request,
        FeatureCard $featureCard
    ): JsonResponse {
        $featureCard = $this->featureCardService->update(
            $featureCard,
            $request->validated()
        );

        return response()->json([
            'status' => true,
            'message' => 'Feature card updated successfully.',
            'data' => $featureCard,
        ]);
    }

    public function destroy(FeatureCard $featureCard): JsonResponse
    {
        $this->featureCardService->delete($featureCard);

        return response()->json([
            'status' => true,
            'message' => 'Feature card deleted successfully.',
        ]);
    }
}