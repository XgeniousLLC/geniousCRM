<?php

/**
 * Company Model
 *
 * Represents an organisation in the CRM.
 * Contacts can be linked to a company via company_id.
 * Deals are associated indirectly through linked contacts.
 *
 * Table     : companies
 * Relations : contacts (HasMany), createdBy (BelongsTo User)
 * Module    : Company
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace Modules\Company\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Contact\Models\Contact;

class Company extends Model
{
    protected $fillable = [
        'name',
        'industry',
        'website',
        'phone',
        'address',
        'created_by',
    ];

    /** Contacts linked to this company. */
    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    /** The user who created this company. */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
