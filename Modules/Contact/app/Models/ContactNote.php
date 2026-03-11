<?php

/**
 * ContactNote Model
 *
 * A free-text note attached to a Contact, written by a CRM user.
 *
 * Table     : contact_notes
 * Relations : contact (BelongsTo), author (BelongsTo User)
 * Module    : Contact
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace Modules\Contact\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactNote extends Model
{
    protected $fillable = ['contact_id', 'user_id', 'body'];

    /** Contact this note belongs to. */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /** The CRM user who wrote this note. */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
