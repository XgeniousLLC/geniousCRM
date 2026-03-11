<?php

/**
 * DealResource
 *
 * JSON:API transformer for the Deal model.
 * Exposes id, title, value, stage, contact, assigned user, close date, timestamps.
 *
 * Module  : Api
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Api\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DealResource extends JsonResource
{
    /**
     * Transform a Deal model into an array for JSON output.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'title'                 => $this->title,
            'value'                 => $this->value,
            'stage'                 => $this->stage,
            'expected_closing_date' => $this->expected_closing_date?->toDateString(),
            'contact'               => $this->whenLoaded('contact', fn () => $this->contact ? [
                'id'   => $this->contact->id,
                'name' => $this->contact->first_name . ' ' . $this->contact->last_name,
            ] : null),
            'assigned_user'         => $this->whenLoaded('assignedUser', fn () => $this->assignedUser ? [
                'id'   => $this->assignedUser->id,
                'name' => $this->assignedUser->name,
            ] : null),
            'created_by'            => $this->whenLoaded('createdBy', fn () => [
                'id'   => $this->createdBy->id,
                'name' => $this->createdBy->name,
            ]),
            'created_at'            => $this->created_at?->toIso8601String(),
            'updated_at'            => $this->updated_at?->toIso8601String(),
        ];
    }
}
