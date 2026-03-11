<?php

/**
 * ContactResource
 *
 * JSON:API transformer for the Contact model.
 * Exposes id, name fields, email, phone, company, tags, timestamps.
 *
 * Module  : Api
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Api\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactResource extends JsonResource
{
    /**
     * Transform a Contact model into an array for JSON output.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'first_name' => $this->first_name,
            'last_name'  => $this->last_name,
            'email'      => $this->email,
            'phone'      => $this->phone,
            'company'    => $this->company,
            'notes'      => $this->notes,
            'tags'       => $this->whenLoaded('tags', fn () => $this->tags->map(fn ($t) => [
                'id'    => $t->id,
                'name'  => $t->name,
                'color' => $t->color,
            ])),
            'created_by' => $this->whenLoaded('createdBy', fn () => [
                'id'   => $this->createdBy->id,
                'name' => $this->createdBy->name,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
