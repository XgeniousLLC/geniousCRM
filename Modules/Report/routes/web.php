<?php

use Illuminate\Support\Facades\Route;
use Modules\Report\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| Report Module — Web Routes
|--------------------------------------------------------------------------
| Report dashboard and CSV exports. Restricted to admin and manager roles.
*/

Route::middleware(['auth'])->group(function () {
    Route::get('/reports', [ReportController::class, 'dashboard'])->name('reports.dashboard');
    Route::get('/reports/export/{type}', [ReportController::class, 'export'])->name('reports.export');
});
