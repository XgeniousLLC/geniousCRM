<?php

/**
 * DealLog Model
 *
 * Represents a manually-logged activity on a Deal.
 * Types: note, email, sms, call, todo.
 * Todos have an optional due_date and a completed flag.
 *
 * Table     : deal_logs
 * Relations : deal (BelongsTo), author (BelongsTo User)
 * Module    : Deal
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace Modules\Deal\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DealLog extends Model
{
    protected $fillable = [
        'deal_id',
        'user_id',
        'type',
        'subject',
        'body',
        'due_date',
        'completed',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'due_date'  => 'date',
    ];

    /** Config per log type: icon key, label, colour class. */
    public static array $types = [
        'note'  => ['label' => 'Note',       'color' => 'text-slate-600',   'bg' => 'bg-slate-100'],
        'email' => ['label' => 'Email',       'color' => 'text-blue-600',    'bg' => 'bg-blue-50'],
        'sms'   => ['label' => 'SMS',         'color' => 'text-emerald-600', 'bg' => 'bg-emerald-50'],
        'call'  => ['label' => 'Call',        'color' => 'text-amber-600',   'bg' => 'bg-amber-50'],
        'todo'  => ['label' => 'To-do',       'color' => 'text-purple-600',  'bg' => 'bg-purple-50'],
    ];

    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
