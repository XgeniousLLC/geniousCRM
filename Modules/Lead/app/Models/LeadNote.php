<?php

/**
 * LeadNote Model
 *
 * A free-text note attached to a Lead, written by a CRM user.
 *
 * Table     : lead_notes
 * Relations : lead (BelongsTo), author (BelongsTo User)
 * Module    : Lead
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace Modules\Lead\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadNote extends Model
{
    protected $fillable = ['lead_id', 'user_id', 'body'];

    /** Lead this note belongs to. */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /** The CRM user who wrote this note. */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
