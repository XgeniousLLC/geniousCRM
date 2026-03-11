<?php

/**
 * SettingController
 *
 * Manages the application-wide general settings for Mini CRM.
 * Settings are stored as key/value rows in the `settings` table and accessed
 * via SettingService. This includes: app title, meta info, logo, and favicon.
 * Only admin users can access these routes.
 *
 * Module  : Core
 * Package : Modules\Core\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Show the general settings page with current values pre-filled.
     */
    public function index(): Response
    {
        return Inertia::render('Core/GeneralSettings', [
            'settings' => [
                'app_title'        => SettingService::get('app_title', config('app.name')),
                'meta_description' => SettingService::get('meta_description', ''),
                'meta_keywords'    => SettingService::get('meta_keywords', ''),
                'logo'             => SettingService::get('logo', ''),
                'favicon'          => SettingService::get('favicon', ''),
            ],
        ]);
    }

    /**
     * Save general settings to the key/value store.
     * Handles logo and favicon file uploads to storage/app/public.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'app_title'        => ['required', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords'    => ['nullable', 'string', 'max:500'],
            'logo'             => ['nullable', 'image', 'max:2048'],
            'favicon'          => ['nullable', 'image', 'mimes:ico,png,jpg', 'max:512'],
        ]);

        SettingService::set('app_title', $request->app_title);
        SettingService::set('meta_description', $request->meta_description ?? '');
        SettingService::set('meta_keywords', $request->meta_keywords ?? '');

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('settings', 'public');
            SettingService::set('logo', $path);
        }

        if ($request->hasFile('favicon')) {
            $path = $request->file('favicon')->store('settings', 'public');
            SettingService::set('favicon', $path);
        }

        return back()->with('success', 'Settings saved successfully.');
    }
}
