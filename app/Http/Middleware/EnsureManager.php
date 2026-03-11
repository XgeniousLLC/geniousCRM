<?php

/**
 * EnsureManager Middleware
 *
 * Restricts route access to users with the `admin` or `manager` role.
 * Sales users are blocked from manager-only areas (reports, team views).
 * Unauthenticated users are redirected to the login page.
 *
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureManager
{
    /**
     * Allow admin and manager roles to proceed.
     * Sales users and unauthenticated users are blocked.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->hasAnyRole(['admin', 'manager'])) {
            return redirect()->route('dashboard')
                ->with('error', 'Access denied. Manager privileges required.');
        }

        return $next($request);
    }
}
