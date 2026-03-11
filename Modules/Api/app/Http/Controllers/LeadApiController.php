<?php

/**
 * LeadApiController
 *
 * REST API controller for Lead resources.
 * Supports list (with search/status filter), show, create, update, delete.
 * Protected by auth:sanctum middleware.
 *
 * Module  : Api
 * Package : Modules\Api\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Api\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Modules\Activity\Services\ActivityService;
use Modules\Api\Http\Resources\LeadResource;
use Modules\Lead\Models\Lead;

class LeadApiController extends Controller
{
    /**
     * Return a paginated list of leads.
     * Supports ?search= (name/email) and ?status= filter.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $leads = Lead::with(['assignedUser', 'createdBy'])
            ->when($request->search, function ($q, $s) {
                $q->where(function ($inner) use ($s) {
                    $inner->where('name',  'like', "%{$s}%")
                          ->orWhere('email', 'like', "%{$s}%");
                });
            })
            ->when($request->status, fn ($q, $st) => $q->where('status', $st))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return LeadResource::collection($leads);
    }

    /**
     * Return a single lead with its relations.
     */
    public function show(Lead $lead): LeadResource
    {
        $lead->load(['assignedUser', 'createdBy']);

        return new LeadResource($lead);
    }

    /**
     * Store a new lead.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'             => 'required|string|max:191',
            'email'            => 'nullable|email|max:191',
            'phone'            => 'nullable|string|max:50',
            'source'           => 'nullable|string|max:191',
            'assigned_user_id' => 'nullable|exists:users,id',
            'status'           => 'nullable|in:new,contacted,qualified,lost,converted',
            'notes'            => 'nullable|string',
        ]);

        $lead = Lead::create(array_merge($data, [
            'created_by' => Auth::id(),
            'status'     => $data['status'] ?? 'new',
        ]));

        ActivityService::log('created', 'Lead', $lead->id, $lead->name);

        $lead->load(['assignedUser', 'createdBy']);

        return (new LeadResource($lead))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update an existing lead.
     */
    public function update(Request $request, Lead $lead): LeadResource
    {
        $data = $request->validate([
            'name'             => 'required|string|max:191',
            'email'            => 'nullable|email|max:191',
            'phone'            => 'nullable|string|max:50',
            'source'           => 'nullable|string|max:191',
            'assigned_user_id' => 'nullable|exists:users,id',
            'status'           => 'required|in:new,contacted,qualified,lost,converted',
            'notes'            => 'nullable|string',
        ]);

        $oldStatus = $lead->status;
        $lead->update($data);

        if ($oldStatus !== $lead->status) {
            ActivityService::log('status_changed', 'Lead', $lead->id, $lead->name, "{$oldStatus} → {$lead->status}");
        } else {
            ActivityService::log('updated', 'Lead', $lead->id, $lead->name);
        }

        $lead->load(['assignedUser', 'createdBy']);

        return new LeadResource($lead);
    }

    /**
     * Permanently delete a lead.
     */
    public function destroy(Lead $lead): JsonResponse
    {
        $name = $lead->name;
        $id   = $lead->id;
        $lead->delete();

        ActivityService::log('deleted', 'Lead', $id, $name);

        return response()->json(['message' => 'Lead deleted.']);
    }
}
