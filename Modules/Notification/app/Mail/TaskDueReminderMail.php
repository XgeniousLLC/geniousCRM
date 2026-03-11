<?php

/**
 * TaskDueReminderMail
 *
 * Daily digest Mailable listing all tasks due today for a user.
 * Dispatched by the SendTaskDueReminders console command at 08:00.
 *
 * Module  : Notification
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Notification\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class TaskDueReminderMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /** @param Collection $tasks Tasks due today for this user */
    public function __construct(public readonly Collection $tasks) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Tasks Due Today — Mini CRM',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'notification::emails.task-due-reminder',
            with: [
                'tasks' => $this->tasks,
                'url'   => url('/tasks'),
            ],
        );
    }
}
