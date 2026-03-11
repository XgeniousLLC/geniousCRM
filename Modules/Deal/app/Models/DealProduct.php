<?php

/**
 * DealProduct Model
 *
 * Represents a line-item product attached to a CRM deal.
 * The total value of all products auto-populates the parent deal's value.
 *
 * Table     : deal_products
 * Relations : deal (BelongsTo)
 * Module    : Deal
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace Modules\Deal\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DealProduct extends Model
{
    protected $fillable = [
        'deal_id',
        'name',
        'quantity',
        'unit_price',
    ];

    protected $casts = [
        'quantity'   => 'integer',
        'unit_price' => 'float',
    ];

    /** The deal this product belongs to. */
    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    /** Computed line-item total. */
    public function getTotalAttribute(): float
    {
        return $this->quantity * $this->unit_price;
    }
}
