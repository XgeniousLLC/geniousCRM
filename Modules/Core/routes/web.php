<?php

use Illuminate\Support\Facades\Route;
use Modules\Core\Http\Controllers\DashboardController;
use Modules\Core\Http\Controllers\OnboardingController;
use Modules\Core\Http\Controllers\ProfileController;
use Modules\Core\Http\Controllers\SearchController;
use Modules\Core\Http\Controllers\SessionController;
use Modules\Core\Http\Controllers\SettingController;
use Modules\Core\Http\Controllers\TrashController;

/*
|--------------------------------------------------------------------------
| Core Module — Web Routes
|--------------------------------------------------------------------------
| Dashboard, profile, password change, and general settings routes.
| All routes require authentication. Settings require the admin role.
*/

Route::middleware('auth')->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Unified trash page (admin only)
    Route::get('/trash', [TrashController::class, 'index'])->name('trash')->middleware('ensure.admin');

    // Global search (JSON API for the header search bar)
    Route::get('/search', [SearchController::class, 'search'])->name('search');

    // Profile
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::patch('/password', [ProfileController::class, 'updatePassword'])->name('password');
    });

    // General Settings — admin only
    Route::prefix('settings')->name('settings.')->middleware('ensure.admin')->group(function () {
        Route::get('/', [SettingController::class, 'index'])->name('index');
        Route::patch('/', [SettingController::class, 'update'])->name('update');
    });

    // Active session management
    Route::delete('/sessions/{id}/revoke', [SessionController::class, 'revoke'])->name('sessions.revoke');
    Route::delete('/sessions/revoke-others', [SessionController::class, 'revokeOthers'])->name('sessions.revoke-others');

    // Onboarding wizard (first-time setup) — admin only
    Route::middleware('ensure.admin')->group(function () {
        Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding');
        Route::post('/onboarding/dismiss', [OnboardingController::class, 'dismiss'])->name('onboarding.dismiss');
    });
});
