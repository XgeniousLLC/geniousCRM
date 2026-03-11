<?php

/**
 * Activity Model
 *
 * Represents a single logged action in the CRM.
 * Uses a simple flat polymorphic pattern:
 *   entity_type + entity_id point to any CRM entity (Lead, Deal, Contact).
 *
 * Table     : activities
 * Relations : user (BelongsTo), entity (dynamic via entity_type/entity_id)
 * Module    : Activity
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace Modules\Activity\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Activity extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'entity_label',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /** Human-friendly labels for known action strings. */
    public static array $actionLabels = [
        'created'       => 'Created',
        'updated'       => 'Updated',
        'deleted'       => 'Deleted',
        'stage_changed' => 'Stage Changed',
        'note_added'    => 'Note Added',
        'note_deleted'  => 'Note Deleted',
        'converted'     => 'Converted to Contact',
        'status_changed'=> 'Status Changed',
        'log_added'     => 'Activity Logged',
    ];

    /**
     * The user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Return a human-readable label for this activity's action.
     */
    public function actionLabel(): string
    {
        return static::$actionLabels[$this->action] ?? ucfirst(str_replace('_', ' ', $this->action));
    }

    /**
     * Return the URL path for the entity (used in feed links).
     * Returns null for deleted or unknown entities.
     */
    public function entityUrl(): ?string
    {
        return match ($this->entity_type) {
            'Lead'    => '/leads',
            'Deal'    => '/deals',
            'Contact' => '/contacts',
            default   => null,
        };
    }
}
