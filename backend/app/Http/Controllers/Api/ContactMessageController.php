<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Services\ContactMessageService;
use Illuminate\Http\JsonResponse;

class ContactMessageController extends Controller
{
    public function __construct(
        private ContactMessageService $contactMessageService
    ) {}
    public function store(StoreContactMessageRequest $request): JsonResponse
{
    $data = $request->validated();

    $contactMessage = $this->contactMessageService->store($data);

    return response()->json([
        'message' => 'Your message has been sent successfully.',
        'data' => $contactMessage,
    ], 201);
}
}