<?php

/**
 * NotificationServiceProvider
 *
 * Registers routes, migrations, and bindings for the Notification module.
 * This module powers:
 *   — in-app database notifications (bell icon with dropdown)
 *   — queue-backed email notifications for assignment events
 *   — scheduled daily task-due digest email
 *
 * Module  : Notification
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Notification\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Nwidart\Modules\Traits\PathNamespace;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

class NotificationServiceProvider extends ServiceProvider
{
    use PathNamespace;

    protected string $name = 'Notification';

    protected string $nameLower = 'notification';

    /**
     * Boot the module — load migrations and register routes.
     */
    public function boot(): void
    {
        $this->registerCommandSchedules();
        $this->loadMigrationsFrom(module_path($this->name, 'database/migrations'));
    }

    /**
     * Register module providers (routes) and console commands.
     */
    public function register(): void
    {
        $this->app->register(RouteServiceProvider::class);

        $this->commands([
            \Modules\Notification\Console\Commands\SendTaskDueReminders::class,
        ]);
    }

    /**
     * Register scheduled commands for this module.
     * The task-due daily digest runs at 08:00 every morning.
     */
    protected function registerCommandSchedules(): void
    {
        $this->app->booted(function () {
            $schedule = $this->app->make(\Illuminate\Console\Scheduling\Schedule::class);
            $schedule->command('notify:task-due-reminders')->dailyAt('08:00');
        });
    }

    public function provides(): array
    {
        return [];
    }
}
