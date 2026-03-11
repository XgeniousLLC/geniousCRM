<?php

/**
 * DealAssigned Notification
 *
 * Fired when a deal is assigned to a user.
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
use Modules\Deal\Models\Deal;

class DealAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Deal $deal) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => "You have been assigned deal: {$this->deal->title}",
            'url'     => "/deals/{$this->deal->id}",
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $value = $this->deal->value !== null
            ? '$' . number_format($this->deal->value, 2)
            : 'N/A';

        return (new MailMessage)
            ->subject("Deal Assigned: {$this->deal->title}")
            ->greeting("Hello, {$notifiable->name}!")
            ->line("A deal has been assigned to you in Mini CRM.")
            ->line("**Deal:** {$this->deal->title}")
            ->line("**Value:** {$value}")
            ->line("**Stage:** {$this->deal->stage}")
            ->action('View Deal', url("/deals/{$this->deal->id}"))
            ->line('Thank you for using Mini CRM.');
    }
}
