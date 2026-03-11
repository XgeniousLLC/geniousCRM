<?php

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\LoginController;
use Modules\Auth\Http\Controllers\PasswordResetController;
use Modules\Auth\Http\Controllers\RegisterController;
use Modules\Auth\Http\Controllers\TwoFactorController;

/*
|--------------------------------------------------------------------------
| Auth Module — Web Routes
|--------------------------------------------------------------------------
| Login, register, logout, password reset, and 2FA challenge routes.
| Rate limiting applied to all credential submission endpoints.
*/

// Guest-only routes
Route::middleware('guest')->group(function () {

    // Login (rate-limited: 5 attempts per minute per IP)
    Route::get('/login', [LoginController::class, 'showLogin'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:5,1');

    // Registration (rate-limited: 10 attempts per minute)
    Route::get('/register', [RegisterController::class, 'showRegister'])->name('register');
    Route::post('/register', [RegisterController::class, 'register'])->middleware('throttle:10,1');

    // Password reset — request link (rate-limited: 3 per minute)
    Route::get('/forgot-password', [PasswordResetController::class, 'showForgotForm'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])->name('password.email')->middleware('throttle:3,1');

    // Password reset — set new password
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetForm'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->name('password.update');

    // 2FA challenge (shown after password auth when 2FA is enabled)
    Route::get('/two-factor/challenge', [TwoFactorController::class, 'showChallenge'])->name('two-factor.challenge');
    Route::post('/two-factor/challenge', [TwoFactorController::class, 'verifyChallenge'])->middleware('throttle:10,1');
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

    // 2FA management (from profile page)
    Route::post('/two-factor/enable',  [TwoFactorController::class, 'enable'])->name('two-factor.enable');
    Route::post('/two-factor/confirm', [TwoFactorController::class, 'confirm'])->name('two-factor.confirm');
    Route::delete('/two-factor/disable', [TwoFactorController::class, 'disable'])->name('two-factor.disable');
});
