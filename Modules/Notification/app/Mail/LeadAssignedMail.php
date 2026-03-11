<?php

/**
 * LeadAssignedMail
 *
 * Standalone Mailable sent when a lead is assigned to a user.
 * Used as a reference for custom templating; the notification
 * system also sends mail via LeadAssigned::toMail().
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
use Modules\Lead\Models\Lead;

class LeadAssignedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Lead $lead) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Lead Assigned: {$this->lead->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'notification::emails.lead-assigned',
            with: [
                'lead' => $this->lead,
                'url'  => url("/leads/{$this->lead->id}"),
            ],
        );
    }
}
