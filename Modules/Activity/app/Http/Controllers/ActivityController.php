<?php

/**
 * ActivityController
 *
 * Handles HTTP actions for the Activity module.
 * Exposes the global activity feed (admin/manager only)
 * and a per-entity feed used by embedded feed components.
 *
 * Module  : Activity
 * Package : Modules\Activity\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Activity\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Activity\Models\Activity;

class ActivityController extends Controller
{
    /**
     * Display the global activity feed.
     * Paginated, ordered newest-first. Accessible by admin and manager roles only.
     */
    public function index(Request $request): Response
    {
        $query = Activity::with('user')
            ->when($request->entity_type, fn($q, $t) => $q->where('entity_type', $t))
            ->when($request->action,      fn($q, $a) => $q->where('action', $a))
            ->latest()
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Activity/ActivityFeed', [
            'activities'   => $query,
            'actionLabels' => Activity::$actionLabels,
            'filters'      => [
                'entity_type' => $request->entity_type,
                'action'      => $request->action,
            ],
        ]);
    }

    /**
     * Return activities for a specific entity as JSON (used by embedded feed components).
     */
    public function forEntity(Request $request)
    {
        $request->validate([
            'entity_type' => 'required|string',
            'entity_id'   => 'required|integer',
        ]);

        $activities = Activity::with('user')
            ->where('entity_type', $request->entity_type)
            ->where('entity_id',   $request->entity_id)
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn($a) => [
                'id'           => $a->id,
                'action'       => $a->action,
                'action_label' => $a->actionLabel(),
                'description'  => $a->description,
                'user'         => $a->user ? ['name' => $a->user->name] : null,
                'created_at'   => $a->created_at->diffForHumans(),
            ]);

        return response()->json($activities);
    }
}
