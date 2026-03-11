<?php

/**
 * TaskResource
 *
 * JSON:API transformer for the Task model.
 * Exposes id, title, description, due_date, status, entity context, assigned user.
 *
 * Module  : Api
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Api\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform a Task model into an array for JSON output.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'description'   => $this->description,
            'due_date'      => $this->due_date?->toDateString(),
            'status'        => $this->status,
            'taskable_type' => $this->taskable_type,
            'taskable_id'   => $this->taskable_id,
            'assigned_user' => $this->whenLoaded('assignedUser', fn () => $this->assignedUser ? [
                'id'   => $this->assignedUser->id,
                'name' => $this->assignedUser->name,
            ] : null),
            'created_by'    => $this->whenLoaded('createdBy', fn () => $this->createdBy ? [
                'id'   => $this->createdBy->id,
                'name' => $this->createdBy->name,
            ] : null),
            'created_at'    => $this->created_at?->toIso8601String(),
            'updated_at'    => $this->updated_at?->toIso8601String(),
        ];
    }
}
