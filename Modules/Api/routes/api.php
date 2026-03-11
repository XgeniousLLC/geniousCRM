<?php

use Illuminate\Support\Facades\Route;
use Modules\Api\Http\Controllers\AuthApiController;
use Modules\Api\Http\Controllers\ContactApiController;
use Modules\Api\Http\Controllers\DealApiController;
use Modules\Api\Http\Controllers\LeadApiController;
use Modules\Api\Http\Controllers\TaskApiController;

/*
|--------------------------------------------------------------------------
| Api Module — REST API routes
|--------------------------------------------------------------------------
|
| Public auth endpoints (login / register / logout).
| All resource endpoints are protected by auth:sanctum.
| Rate limiting: 60 req/min on public; 120 req/min on authenticated.
|
*/

Route::prefix('v1')->name('v1.')->group(function () {

    /* ── Auth ── */
    Route::middleware('throttle:api-public')->group(function () {
        Route::post('login',    [AuthApiController::class, 'login']);
        Route::post('register', [AuthApiController::class, 'register']);
    });

    /* ── Protected resources ── */
    Route::middleware(['auth:sanctum', 'throttle:api-auth'])->group(function () {

        Route::post('logout', [AuthApiController::class, 'logout']);

        Route::apiResource('contacts', ContactApiController::class);
        Route::apiResource('leads',    LeadApiController::class);
        Route::apiResource('deals',    DealApiController::class);
        Route::apiResource('tasks',    TaskApiController::class);
    });
});
