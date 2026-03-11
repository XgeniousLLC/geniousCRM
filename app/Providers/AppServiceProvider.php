<?php

/**
 * AppServiceProvider
 *
 * Core Laravel service provider for Mini CRM.
 * Shares global Inertia props on every request:
 *   - auth.user (with roles)
 *   - settings (from SettingService — used by layout for logo, title, favicon)
 *   - flash messages
 * Registers named API rate limiters for public and authenticated endpoints.
 *
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace App\Providers;

use App\Services\SettingService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Modules\Contact\Models\Contact;
use Modules\Deal\Models\Deal;
use Modules\Lead\Models\Lead;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     * Share global Inertia data available to every page component.
     * Configure named rate limiters for the REST API.
     * Set per-user timezone so all diffForHumans() and date formatting
     * respect the authenticated user's preferred IANA timezone.
     */
    public function boot(): void
    {
        // Named API rate limiters
        RateLimiter::for('api-public', fn (Request $request) =>
            Limit::perMinute(60)->by($request->ip())
        );
        RateLimiter::for('api-auth', fn (Request $request) =>
            Limit::perMinute(120)->by(optional($request->user())->id ?: $request->ip())
        );

        // Per-user timezone — applies on every authenticated request
        $this->app->booted(function () {
            $user = auth()->user();
            if ($user && ! empty($user->timezone)) {
                config(['app.timezone' => $user->timezone]);
                date_default_timezone_set($user->timezone);
            }
        });

        Inertia::share([
            'auth' => function () {
                $user = auth()->user();
                if (! $user) return ['user' => null];

                return [
                    'user' => [
                        'id'      => $user->id,
                        'name'    => $user->name,
                        'email'   => $user->email,
                        'company' => $user->company,
                        'roles'   => $user->roles->map(fn ($r) => ['name' => $r->name]),
                    ],
                ];
            },
            'settings' => function () {
                // Guard against running before migrations exist
                if (! Schema::hasTable('settings')) return [];

                return [
                    'app_title' => SettingService::get('app_title', config('app.name')),
                    'logo'      => SettingService::get('logo', ''),
                    'favicon'   => SettingService::get('favicon', ''),
                ];
            },
            'flash' => function () {
                return [
                    'success' => session('success'),
                    'error'   => session('error'),
                ];
            },
            'onboarding_required' => function () {
                $user = auth()->user();
                if (! $user || ! $user->hasRole('admin')) return false;
                if (! Schema::hasTable('settings')) return false;
                if (SettingService::get('onboarding_dismissed')) return false;
                if (! Schema::hasTable('contacts') || ! Schema::hasTable('leads') || ! Schema::hasTable('deals')) return false;
                return Contact::count() === 0 && Lead::count() === 0 && Deal::count() === 0;
            },

            'notifications' => function () {
                $user = auth()->user();
                if (! $user || ! \Illuminate\Support\Facades\Schema::hasTable('notifications')) {
                    return ['unread_count' => 0, 'recent' => []];
                }

                return [
                    'unread_count' => $user->unreadNotifications()->count(),
                    'recent'       => $user->notifications()
                        ->latest()
                        ->limit(10)
                        ->get()
                        ->map(fn($n) => [
                            'id'         => $n->id,
                            'message'    => $n->data['message'] ?? '',
                            'url'        => $n->data['url']     ?? null,
                            'read_at'    => $n->read_at,
                            'created_at' => $n->created_at->diffForHumans(),
                        ])
                        ->toArray(),
                ];
            },
        ]);
    }
}
