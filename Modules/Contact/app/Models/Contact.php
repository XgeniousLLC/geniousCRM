<?php

/**
 * Contact Model
 *
 * Represents a person or organisation stored in the CRM.
 *
 * Table     : contacts
 * Relations : tags (BelongsToMany), notes (HasMany), createdBy (BelongsTo User), company (BelongsTo Company)
 * SoftDelete: yes — restored via /contacts/{id}/restore, force-deleted via /contacts/{id}/force
 * Module    : Contact
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace Modules\Contact\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Company\Models\Company;

class Contact extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'company',
        'company_id',
        'notes',
        'created_by',
    ];

    /** Full name accessor. */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /** Tags associated with this contact. */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'contact_tag');
    }

    /** Notes attached to this contact. */
    public function contactNotes(): HasMany
    {
        return $this->hasMany(ContactNote::class);
    }

    /** The user who created this contact. */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** The company this contact belongs to. */
    public function companyRecord(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
