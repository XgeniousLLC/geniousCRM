<?php

/**
 * Lead Model
 *
 * Represents a prospective customer in the Mini CRM pipeline.
 * Leads progress through statuses and can be converted to Contacts.
 *
 * Table     : leads
 * Relations : assignedUser (BelongsTo User), createdBy (BelongsTo User), notes (HasMany LeadNote)
 * Statuses  : new | contacted | qualified | lost | converted
 * SoftDelete: yes — restored via /leads/{id}/restore, force-deleted via /leads/{id}/force
 * Module    : Lead
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace Modules\Lead\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Contact\Models\Tag;

class Lead extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'source',
        'assigned_user_id',
        'status',
        'notes',
        'follow_up_date',
        'created_by',
    ];

    protected $casts = [
        'follow_up_date' => 'date',
    ];

    /** Allowed lead source values (enum-backed). */
    public static array $sources = [
        'Website', 'Referral', 'LinkedIn', 'Cold Outreach', 'Event', 'Advertisement', 'Other',
    ];

    /** Status badge colours for the UI. */
    public static array $statusColors = [
        'new'       => '#6366f1',
        'contacted' => '#f59e0b',
        'qualified' => '#10b981',
        'lost'      => '#ef4444',
        'converted' => '#8b5cf6',
    ];

    /** True when follow_up_date is today or overdue and lead is still active. */
    public function isFollowUpOverdue(): bool
    {
        return $this->follow_up_date
            && $this->follow_up_date->isPast()
            && !in_array($this->status, ['converted', 'lost']);
    }

    /** The sales user this lead is assigned to. */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    /** The user who created this lead. */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** Notes attached to this lead. */
    public function leadNotes(): HasMany
    {
        return $this->hasMany(LeadNote::class);
    }

    /** Tags attached to this lead. */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'lead_tag');
    }
}
