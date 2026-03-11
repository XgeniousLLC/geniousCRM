<?php

use Illuminate\Support\Facades\Route;
use Modules\Lead\Http\Controllers\LeadController;
use Modules\Lead\Http\Controllers\LeadImportController;
use Modules\Lead\Http\Controllers\LeadTrashController;

/*
|--------------------------------------------------------------------------
| Lead Module — Web Routes
|--------------------------------------------------------------------------
| Lead CRUD, status change, assignment, note management, conversion,
| CSV import, and trash bin.
| All routes require authentication.
*/

Route::middleware('auth')->group(function () {
    Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
    Route::post('/leads', [LeadController::class, 'store'])->name('leads.store');

    // Static paths must come before {lead} wildcard to avoid route capture conflicts
    // Bulk operations
    Route::post('/leads/bulk-destroy', [LeadController::class, 'bulkDestroy'])->name('leads.bulk-destroy');
    Route::post('/leads/bulk-assign',  [LeadController::class, 'bulkAssign'])->name('leads.bulk-assign');
    Route::post('/leads/bulk-status',  [LeadController::class, 'bulkStatus'])->name('leads.bulk-status');

    // CSV import (3-step: upload → preview → process)
    Route::get('/leads/import/form', [LeadImportController::class, 'show'])->name('leads.import.show');
    Route::post('/leads/import/preview', [LeadImportController::class, 'preview'])->name('leads.import.preview');
    Route::post('/leads/import/process', [LeadImportController::class, 'process'])->name('leads.import.process');

    // Trash bin (admin only)
    Route::get('/leads/trash', [LeadTrashController::class, 'index'])->name('leads.trash');
    Route::patch('/leads/{id}/restore', [LeadTrashController::class, 'restore'])->name('leads.restore');
    Route::delete('/leads/{id}/force', [LeadTrashController::class, 'forceDelete'])->name('leads.force-delete');

    // Wildcard routes — must come after static paths
    Route::get('/leads/{lead}', [LeadController::class, 'show'])->name('leads.show');
    Route::patch('/leads/{lead}', [LeadController::class, 'update'])->name('leads.update');
    Route::delete('/leads/{lead}', [LeadController::class, 'destroy'])->name('leads.destroy');

    // Convert lead → contact
    Route::post('/leads/{lead}/convert', [LeadController::class, 'convert'])->name('leads.convert');

    // Per-lead notes
    Route::post('/leads/{lead}/notes', [LeadController::class, 'addNote'])->name('leads.notes.store');
    Route::delete('/leads/{lead}/notes/{note}', [LeadController::class, 'deleteNote'])->name('leads.notes.destroy');
});
