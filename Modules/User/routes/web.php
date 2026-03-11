<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\RoleController;
use Modules\User\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| User Module — Web Routes
|--------------------------------------------------------------------------
| Admin user management and role/permission management.
| All routes restricted to users with the `admin` role.
*/

Route::middleware(['auth', 'ensure.admin'])->group(function () {

    // User management
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::patch('/users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Role management
    Route::resource('roles', RoleController::class)->except(['show']);
});
