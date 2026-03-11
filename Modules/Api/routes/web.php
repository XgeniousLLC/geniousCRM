<?php

use Illuminate\Support\Facades\Route;
use Modules\Api\Http\Controllers\ApiDocController;

Route::middleware(['auth'])->group(function () {
    Route::get('api-docs', [ApiDocController::class, 'index'])->name('api-docs');
});
