<?php

/**
 * TaskAssignedMail
 *
 * Standalone Mailable sent when a task is assigned to a user.
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
use Modules\Task\Models\Task;

class TaskAssignedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Task $task) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Task Assigned: {$this->task->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'notification::emails.task-assigned',
            with: [
                'task' => $this->task,
                'url'  => url('/tasks'),
            ],
        );
    }
}
