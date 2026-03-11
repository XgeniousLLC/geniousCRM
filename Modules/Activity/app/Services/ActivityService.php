<?php

/**
 * ActivityService
 *
 * Central auto-logging service for the Activity module.
 * All modules call ActivityService::log() to record user actions.
 * This keeps activity tracking decoupled from business logic —
 * controllers just call log() after completing their operation.
 *
 * Usage:
 *   ActivityService::log('created', 'Lead', $lead->id, $lead->name);
 *   ActivityService::log('stage_changed', 'Deal', $deal->id, $deal->title, "→ {$deal->stage}");
 *
 * Module  : Activity
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Activity\Services;

use Illuminate\Support\Facades\Auth;
use Modules\Activity\Models\Activity;

class ActivityService
{
    /**
     * Log a user action against a CRM entity.
     *
     * @param  string      $action       Action key: "created", "updated", "stage_changed", etc.
     * @param  string      $entityType   Entity class short name: "Lead", "Deal", "Contact"
     * @param  int         $entityId     Primary key of the entity
     * @param  string|null $entityLabel  Human-readable name snapshot (e.g. lead name, deal title)
     * @param  string|null $description  Optional extra context (e.g. "New → Qualified")
     */
    public static function log(
        string $action,
        string $entityType,
        int $entityId,
        ?string $entityLabel = null,
        ?string $description = null,
    ): void {
        Activity::create([
            'user_id'      => Auth::id(),
            'action'       => $action,
            'entity_type'  => $entityType,
            'entity_id'    => $entityId,
            'entity_label' => $entityLabel,
            'description'  => $description,
        ]);
    }
}
