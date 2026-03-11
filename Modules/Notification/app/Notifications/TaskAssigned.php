<?php

/**
 * TaskAssigned Notification
 *
 * Fired when a task is assigned to a user.
 * Delivers via database (bell icon) and queued email.
 *
 * Module  : Notification
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Notification\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Modules\Task\Models\Task;

class TaskAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Task $task) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => "New task assigned to you: {$this->task->title}",
            'url'     => '/tasks',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $due = $this->task->due_date?->format('M j, Y') ?? 'No due date';

        return (new MailMessage)
            ->subject("Task Assigned: {$this->task->title}")
            ->greeting("Hello, {$notifiable->name}!")
            ->line("A task has been assigned to you in Mini CRM.")
            ->line("**Task:** {$this->task->title}")
            ->line("**Due:** {$due}")
            ->line("**Status:** {$this->task->status}")
            ->action('View My Tasks', url('/tasks'))
            ->line('Thank you for using Mini CRM.');
    }
}
