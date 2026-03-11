<?php

/**
 * LeadAssigned Notification
 *
 * Fired when a lead is assigned (or re-assigned) to a user.
 * Delivers via:
 *   — database channel: stored in `notifications` table for the bell icon
 *   — mail channel: queued email to the newly assigned user
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
use Modules\Lead\Models\Lead;

class LeadAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Lead $lead) {}

    /**
     * Which channels to send on.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Database channel payload — stored in `notifications.data`.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => "You have been assigned lead: {$this->lead->name}",
            'url'     => "/leads/{$this->lead->id}",
        ];
    }

    /**
     * Email notification sent via queue.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Lead Assigned: {$this->lead->name}")
            ->greeting("Hello, {$notifiable->name}!")
            ->line("A lead has been assigned to you in Mini CRM.")
            ->line("**Lead:** {$this->lead->name}")
            ->line("**Source:** " . ($this->lead->source ?? 'N/A'))
            ->line("**Status:** {$this->lead->status}")
            ->action('View Lead', url("/leads/{$this->lead->id}"))
            ->line('Thank you for using Mini CRM.');
    }
}
