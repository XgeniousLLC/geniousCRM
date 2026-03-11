<?php

use Illuminate\Support\Facades\Route;

// Redirect root to dashboard (or login if unauthenticated)
Route::get('/', function () {
    return redirect()->route('dashboard');
});
