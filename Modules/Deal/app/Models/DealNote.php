<?php

/**
 * DealNote Model
 *
 * A free-text note attached to a Deal, written by a CRM user.
 *
 * Table     : deal_notes
 * Relations : deal (BelongsTo), author (BelongsTo User)
 * Module    : Deal
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace Modules\Deal\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DealNote extends Model
{
    protected $fillable = ['deal_id', 'user_id', 'body'];

    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
