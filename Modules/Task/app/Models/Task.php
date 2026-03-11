<?php

/**
 * Task Model
 *
 * Represents a to-do task in the Mini CRM.
 * Tasks are polymorphic — taskable_type + taskable_id point to
 * a Lead, Contact, or Deal. Null taskable means a standalone task.
 *
 * Table     : tasks
 * Relations : assignedUser (BelongsTo User), createdBy (BelongsTo User)
 * Statuses  : pending | in_progress | done
 * SoftDelete: yes — tasks are soft-deleted to preserve history
 * Module    : Task
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace Modules\Task\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'description', 'due_date', 'assigned_user_id',
        'created_by', 'status', 'taskable_type', 'taskable_id',
    ];

    protected $casts = ['due_date' => 'date'];

    public static array $statuses = [
        'pending'     => ['label' => 'Pending',     'color' => 'text-amber-600',   'bg' => 'bg-amber-50',   'border' => 'border-amber-200'],
        'in_progress' => ['label' => 'In Progress',  'color' => 'text-blue-600',    'bg' => 'bg-blue-50',    'border' => 'border-blue-200'],
        'done'        => ['label' => 'Done',          'color' => 'text-emerald-600', 'bg' => 'bg-emerald-50', 'border' => 'border-emerald-200'],
    ];

    /** Next status in the cycle: pending → in_progress → done → pending */
    public function nextStatus(): string
    {
        return match ($this->status) {
            'pending'     => 'in_progress',
            'in_progress' => 'done',
            default       => 'pending',
        };
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
