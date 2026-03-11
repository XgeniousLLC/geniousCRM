<?php

use Illuminate\Support\Facades\Route;
use Modules\Deal\Http\Controllers\DealController;
use Modules\Deal\Http\Controllers\DealTrashController;

/*
|--------------------------------------------------------------------------
| Deal Module — Web Routes
|--------------------------------------------------------------------------
| Deal CRUD and Kanban stage updates.
| All routes require authentication.
*/

Route::middleware('auth')->group(function () {
    Route::get('/deals', [DealController::class, 'index'])->name('deals.index');
    Route::post('/deals', [DealController::class, 'store'])->name('deals.store');

    // Static paths must come before {deal} wildcard to avoid route capture conflicts
    // Trash bin (admin only)
    Route::get('/deals/trash', [DealTrashController::class, 'index'])->name('deals.trash');
    Route::patch('/deals/{id}/restore', [DealTrashController::class, 'restore'])->name('deals.restore');
    Route::delete('/deals/{id}/force', [DealTrashController::class, 'forceDelete'])->name('deals.force-delete');

    // Wildcard routes — must come after static paths
    Route::get('/deals/{deal}', [DealController::class, 'show'])->name('deals.show');
    Route::patch('/deals/{deal}', [DealController::class, 'update'])->name('deals.update');
    Route::patch('/deals/{deal}/stage', [DealController::class, 'updateStage'])->name('deals.stage');
    Route::delete('/deals/{deal}', [DealController::class, 'destroy'])->name('deals.destroy');

    // Per-deal notes
    Route::post('/deals/{deal}/notes', [DealController::class, 'addNote'])->name('deals.notes.store');
    Route::delete('/deals/{deal}/notes/{note}', [DealController::class, 'deleteNote'])->name('deals.notes.destroy');

    // Per-deal manual activity logs (email, sms, call, todo, note)
    Route::post('/deals/{deal}/logs', [DealController::class, 'addLog'])->name('deals.logs.store');
    Route::delete('/deals/{deal}/logs/{log}', [DealController::class, 'deleteLog'])->name('deals.logs.destroy');
    Route::patch('/deals/{deal}/logs/{log}/toggle', [DealController::class, 'toggleLog'])->name('deals.logs.toggle');

    // Per-deal product line items
    Route::post('/deals/{deal}/products', [DealController::class, 'addProduct'])->name('deals.products.store');
    Route::delete('/deals/{deal}/products/{product}', [DealController::class, 'deleteProduct'])->name('deals.products.destroy');
});
