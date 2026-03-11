<?php

/**
 * SendTaskDueReminders
 *
 * Artisan command that sends a daily digest email to each user
 * who has tasks due today (status != done). Runs via the scheduler at 08:00.
 *
 * Usage: php artisan notify:task-due-reminders
 *
 * Module  : Notification
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Notification\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Modules\Notification\Mail\TaskDueReminderMail;
use Modules\Task\Models\Task;

class SendTaskDueReminders extends Command
{
    protected $signature   = 'notify:task-due-reminders';
    protected $description = 'Send daily digest emails for tasks due today';

    /**
     * Find all users with tasks due today and dispatch a digest email to each.
     */
    public function handle(): int
    {
        $today = now()->toDateString();

        // Group tasks due today by assigned user
        $tasksByUser = Task::with('assignedUser')
            ->whereDate('due_date', $today)
            ->whereNotIn('status', ['done'])
            ->whereNotNull('assigned_user_id')
            ->get()
            ->groupBy('assigned_user_id');

        $sent = 0;
        foreach ($tasksByUser as $userId => $tasks) {
            $user = User::find($userId);
            if (! $user) continue;

            Mail::to($user->email)->queue(new TaskDueReminderMail($tasks));
            $sent++;
        }

        $this->info("Task due reminders sent to {$sent} user(s).");

        return self::SUCCESS;
    }
}
