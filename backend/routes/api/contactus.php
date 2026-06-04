<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ContactMessageController;

Route::post('/contact-messages', [ContactMessageController::class, 'store']);