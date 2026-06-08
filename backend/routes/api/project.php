<?php

use App\Http\Controllers\Api\Admin\AdminFeatureCardController;
use App\Http\Controllers\Api\Admin\AdminHeroSectionController;
use App\Http\Controllers\Api\Admin\AdminHomeSectionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AIController;

// يمكنك إضافته بدون حماية للتجربة، أو داخل ممر الـ sanctum إذا كان يتطلب تسجيل دخول
Route::post('/ai/search', [AIController::class, 'search']);
Route::prefix('v1')->group(function () {

    // public frontend API
    Route::get('/home', [HomeController::class, 'index']);
    Route::get('/about', [AboutController::class, 'index']);
    Route::get('/footer', [FooterController::class, 'index']);

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/categories', [ProductCategoryController::class, 'index']);

    // admin dashboard API
    Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
        Route::apiResource('home-sections', AdminHomeSectionController::class);
        Route::apiResource('hero-sections', AdminHeroSectionController::class);
        Route::apiResource('feature-cards', AdminFeatureCardController::class);
        Route::apiResource('about-us', AdminAboutUsController::class);
        Route::apiResource('footer-settings', AdminFooterSettingController::class);
        Route::apiResource('categories', AdminProductCategoryController::class);
        Route::apiResource('products', AdminProductController::class);
    });
});