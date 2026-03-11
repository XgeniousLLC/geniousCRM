<?php

/**
 * LeadResource
 *
 * JSON:API transformer for the Lead model.
 * Exposes id, name, contact fields, source, status, assigned user, timestamps.
 *
 * Module  : Api
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Api\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadResource extends JsonResource
{
    /**
     * Transform a Lead model into an array for JSON output.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'email'         => $this->email,
            'phone'         => $this->phone,
            'source'        => $this->source,
            'status'        => $this->status,
            'notes'         => $this->notes,
            'assigned_user' => $this->whenLoaded('assignedUser', fn () => $this->assignedUser ? [
                'id'   => $this->assignedUser->id,
                'name' => $this->assignedUser->name,
            ] : null),
            'created_by'    => $this->whenLoaded('createdBy', fn () => [
                'id'   => $this->createdBy->id,
                'name' => $this->createdBy->name,
            ]),
            'created_at'    => $this->created_at?->toIso8601String(),
            'updated_at'    => $this->updated_at?->toIso8601String(),
        ];
    }
}
