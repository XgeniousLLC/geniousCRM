<?php

/**
 * DealStageMail
 *
 * Mailable sent when a deal's stage changes.
 * Notifies the deal owner / assigned user of the transition.
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
use Modules\Deal\Models\Deal;

class DealStageMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Deal   $deal,
        public readonly string $oldStage,
        public readonly string $newStage,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Deal Stage Updated: {$this->deal->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'notification::emails.deal-stage',
            with: [
                'deal'     => $this->deal,
                'oldStage' => $this->oldStage,
                'newStage' => $this->newStage,
                'url'      => url("/deals/{$this->deal->id}"),
            ],
        );
    }
}
