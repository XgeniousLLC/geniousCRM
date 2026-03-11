<?php

/**
 * DealApiController
 *
 * REST API controller for Deal resources.
 * Supports list (with search/stage filter), show, create, update, delete.
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
use Modules\Api\Http\Resources\DealResource;
use Modules\Deal\Models\Deal;

class DealApiController extends Controller
{
    /**
     * Return a paginated list of deals.
     * Supports ?search= (title) and ?stage= filter.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $deals = Deal::with(['contact', 'assignedUser', 'createdBy'])
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when($request->stage,  fn ($q, $st) => $q->where('stage', $st))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return DealResource::collection($deals);
    }

    /**
     * Return a single deal with its relations.
     */
    public function show(Deal $deal): DealResource
    {
        $deal->load(['contact', 'assignedUser', 'createdBy']);

        return new DealResource($deal);
    }

    /**
     * Store a new deal.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'                 => 'required|string|max:191',
            'value'                 => 'nullable|numeric|min:0',
            'contact_id'            => 'nullable|exists:contacts,id',
            'stage'                 => 'required|in:new_deal,proposal_sent,negotiation,won,lost',
            'expected_closing_date' => 'nullable|date',
            'assigned_user_id'      => 'nullable|exists:users,id',
        ]);

        $deal = Deal::create(array_merge($data, ['created_by' => Auth::id()]));

        ActivityService::log('created', 'Deal', $deal->id, $deal->title);

        $deal->load(['contact', 'assignedUser', 'createdBy']);

        return (new DealResource($deal))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update an existing deal.
     */
    public function update(Request $request, Deal $deal): DealResource
    {
        $data = $request->validate([
            'title'                 => 'required|string|max:191',
            'value'                 => 'nullable|numeric|min:0',
            'contact_id'            => 'nullable|exists:contacts,id',
            'stage'                 => 'required|in:new_deal,proposal_sent,negotiation,won,lost',
            'expected_closing_date' => 'nullable|date',
            'assigned_user_id'      => 'nullable|exists:users,id',
        ]);

        $oldStage = $deal->stage;
        $deal->update($data);

        if ($oldStage !== $deal->stage) {
            ActivityService::log('stage_changed', 'Deal', $deal->id, $deal->title, "{$oldStage} → {$deal->stage}");
        } else {
            ActivityService::log('updated', 'Deal', $deal->id, $deal->title);
        }

        $deal->load(['contact', 'assignedUser', 'createdBy']);

        return new DealResource($deal);
    }

    /**
     * Permanently delete a deal.
     */
    public function destroy(Deal $deal): JsonResponse
    {
        $title = $deal->title;
        $id    = $deal->id;
        $deal->delete();

        ActivityService::log('deleted', 'Deal', $id, $title);

        return response()->json(['message' => 'Deal deleted.']);
    }
}
