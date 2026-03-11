<?php

/**
 * Deal Model
 *
 * Represents a sales opportunity in the Mini CRM pipeline.
 * Deals move through stages from new_deal through to won or lost.
 *
 * Table     : deals
 * Relations : contact (BelongsTo), assignedUser (BelongsTo User), createdBy (BelongsTo User), dealProducts (HasMany)
 * Stages    : new_deal | proposal_sent | negotiation | won | lost
 * SoftDelete: yes — restored via /deals/{id}/restore, force-deleted via /deals/{id}/force
 * Module    : Deal
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace Modules\Deal\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Contact\Models\Contact;
use Modules\Contact\Models\Tag;

class Deal extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'value',
        'contact_id',
        'stage',
        'expected_closing_date',
        'assigned_user_id',
        'probability',
        'created_by',
    ];

    protected $casts = [
        'expected_closing_date' => 'date',
        'value'                 => 'float',
        'probability'           => 'integer',
    ];

    /** Default win probability per stage (0–100). */
    public static array $stageProbabilities = [
        'new_deal'      => 10,
        'proposal_sent' => 30,
        'negotiation'   => 60,
        'won'           => 100,
        'lost'          => 0,
    ];

    /** Stage display labels and colours for the Kanban board. */
    public static array $stages = [
        'new_deal'      => ['label' => 'New Deal',      'color' => '#6366f1'],
        'proposal_sent' => ['label' => 'Proposal Sent', 'color' => '#f59e0b'],
        'negotiation'   => ['label' => 'Negotiation',   'color' => '#3b82f6'],
        'won'           => ['label' => 'Won',            'color' => '#10b981'],
        'lost'          => ['label' => 'Lost',           'color' => '#ef4444'],
    ];

    /** Contact linked to this deal. */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /** Sales user assigned to this deal. */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    /** The user who created this deal. */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** Simple text notes attached to this deal. */
    public function dealNotes(): HasMany
    {
        return $this->hasMany(DealNote::class);
    }

    /** Manually logged activity entries (email, sms, call, todo, note). */
    public function dealLogs(): HasMany
    {
        return $this->hasMany(DealLog::class);
    }

    /** Tags attached to this deal. */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'deal_tag');
    }

    /** Product line items attached to this deal. */
    public function dealProducts(): HasMany
    {
        return $this->hasMany(DealProduct::class);
    }
}
