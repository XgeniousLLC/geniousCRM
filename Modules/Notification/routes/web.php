<?php

use Illuminate\Support\Facades\Route;
use Modules\Notification\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| Notification Module — Web Routes
|--------------------------------------------------------------------------
| In-app notification endpoints (JSON responses).
| All routes require authentication.
*/

Route::middleware('auth')->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::patch('/{id}/read', [NotificationController::class, 'markRead'])->name('read');
    Route::patch('/read-all', [NotificationController::class, 'markAllRead'])->name('read-all');
});
