<?php

/**
 * HandleInertiaRequests Middleware
 *
 * Inertia.js middleware for Mini CRM.
 * Controls asset versioning (triggers full reload when assets change)
 * and defines the root Inertia template (resources/views/app.blade.php).
 *
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root Inertia blade template.
     */
    protected $rootView = 'app';

    /**
     * Return the asset version used for cache-busting.
     * Changing this value forces a full page reload in the browser.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the shared data available to every Inertia page.
     * Note: auth, settings, and flash are already shared in AppServiceProvider.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), []);
    }
}
