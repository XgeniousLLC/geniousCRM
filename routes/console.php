<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Commands — Mini CRM
|--------------------------------------------------------------------------
| The Notification module also registers the task-due reminder schedule
| directly from NotificationServiceProvider. The entry below is a
| human-readable reference and fallback for environments that use
| routes/console.php as the canonical scheduler definition.
*/
Schedule::command('notify:task-due-reminders')
    ->dailyAt('08:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/scheduler.log'));
