<?php

/**
 * EnsureAdmin Middleware
 *
 * Restricts route access to users with the `admin` role only.
 * Non-admin authenticated users are redirected to the dashboard with an error.
 * Unauthenticated users are redirected to the login page.
 *
 * Usage: Route::middleware('role:admin') via Spatie, or ->middleware(EnsureAdmin::class)
 *
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Allow only admin-role users to proceed.
     * All others are redirected with a 403-style flash message.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->hasRole('admin')) {
            return redirect()->route('dashboard')
                ->with('error', 'Access denied. Admin privileges required.');
        }

        return $next($request);
    }
}
