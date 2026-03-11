<?php

use Illuminate\Support\Facades\Route;
use Modules\Activity\Http\Controllers\ActivityController;

/*
|--------------------------------------------------------------------------
| Activity Module — Web Routes
|--------------------------------------------------------------------------
| Global activity feed (admin/manager) and per-entity JSON feed endpoint.
| All routes require authentication.
*/

Route::middleware('auth')->group(function () {
    // Global activity feed page (admin + manager)
    Route::get('/activities', [ActivityController::class, 'index'])->name('activities.index');

    // Per-entity activity feed (JSON, used by embedded components)
    Route::get('/activities/entity', [ActivityController::class, 'forEntity'])->name('activities.entity');
});
