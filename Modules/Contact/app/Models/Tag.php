<?php

/**
 * Tag Model
 *
 * Lightweight label that can be attached to contacts, leads, and deals.
 * Each tag has a name and an optional display colour (hex).
 *
 * Table     : tags
 * Relations : contacts (BelongsToMany), leads (BelongsToMany via lead_tag),
 *             deals (BelongsToMany via deal_tag)
 * Module    : Contact
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace Modules\Contact\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = ['name', 'color'];

    /** Contacts that carry this tag. */
    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class, 'contact_tag');
    }
}
