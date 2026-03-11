<?php

use Illuminate\Support\Facades\Route;
use Modules\Contact\Http\Controllers\ContactController;
use Modules\Contact\Http\Controllers\ContactImportController;
use Modules\Contact\Http\Controllers\ContactTrashController;

/*
|--------------------------------------------------------------------------
| Contact Module — Web Routes
|--------------------------------------------------------------------------
| Contact CRUD, per-contact note management, CSV import, and trash bin.
| All routes require authentication; accessible to admin, manager, sales_user.
*/

Route::middleware('auth')->group(function () {
    Route::get('/contacts', [ContactController::class, 'index'])->name('contacts.index');
    Route::post('/contacts', [ContactController::class, 'store'])->name('contacts.store');

    // Static paths must come before {contact} wildcard to avoid route capture conflicts
    // Bulk operations
    Route::post('/contacts/bulk-destroy', [ContactController::class, 'bulkDestroy'])->name('contacts.bulk-destroy');
    Route::post('/contacts/bulk-tag',     [ContactController::class, 'bulkTag'])->name('contacts.bulk-tag');
    Route::get('/contacts/bulk-export',   [ContactController::class, 'bulkExport'])->name('contacts.bulk-export');

    // CSV import (3-step: upload → preview → process)
    Route::get('/contacts/import/form', [ContactImportController::class, 'show'])->name('contacts.import.show');
    Route::post('/contacts/import/preview', [ContactImportController::class, 'preview'])->name('contacts.import.preview');
    Route::post('/contacts/import/process', [ContactImportController::class, 'process'])->name('contacts.import.process');

    // Trash bin (admin only)
    Route::get('/contacts/trash', [ContactTrashController::class, 'index'])->name('contacts.trash');
    Route::patch('/contacts/{id}/restore', [ContactTrashController::class, 'restore'])->name('contacts.restore');
    Route::delete('/contacts/{id}/force', [ContactTrashController::class, 'forceDelete'])->name('contacts.force-delete');

    // Wildcard routes — must come after static paths
    Route::get('/contacts/{contact}', [ContactController::class, 'show'])->name('contacts.show');
    Route::patch('/contacts/{contact}', [ContactController::class, 'update'])->name('contacts.update');
    Route::delete('/contacts/{contact}', [ContactController::class, 'destroy'])->name('contacts.destroy');

    // Per-contact notes
    Route::post('/contacts/{contact}/notes', [ContactController::class, 'addNote'])->name('contacts.notes.store');
    Route::delete('/contacts/{contact}/notes/{note}', [ContactController::class, 'deleteNote'])->name('contacts.notes.destroy');
});
