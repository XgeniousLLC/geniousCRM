<?php

/**
 * OnboardingController
 *
 * Manages the first-time setup wizard shown to new installs.
 * Detects a fresh install (no contacts, leads, or deals exist) and
 * presents a multi-step wizard to help the admin configure the app,
 * invite a team member, and optionally import contacts.
 *
 * The onboarding is dismissed permanently by storing `onboarding_dismissed=1`
 * in the settings table. Once dismissed it never re-appears.
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
use Modules\Contact\Models\Contact;
use Modules\Deal\Models\Deal;
use Modules\Lead\Models\Lead;

class OnboardingController extends Controller
{
    /**
     * Show the onboarding wizard.
     * Redirects to dashboard if onboarding has already been dismissed.
     */
    public function index(): Response|RedirectResponse
    {
        if (SettingService::get('onboarding_dismissed')) {
            return redirect('/dashboard');
        }

        return Inertia::render('Core/Onboarding', [
            'appTitle' => SettingService::get('app_title', config('app.name')),
        ]);
    }

    /**
     * Dismiss the onboarding wizard permanently.
     * Stores a flag in the settings table so it never re-appears.
     */
    public function dismiss(): RedirectResponse
    {
        SettingService::set('onboarding_dismissed', '1');

        return redirect('/dashboard')->with('success', 'Welcome to Mini CRM! You\'re all set.');
    }
}
