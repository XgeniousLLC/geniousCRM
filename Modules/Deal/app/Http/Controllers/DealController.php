<?php

/**
 * DealController
 *
 * Handles all HTTP actions for the Deal module.
 * Deals are sales opportunities tracked across pipeline stages.
 * Supports list view, Kanban stage updates, CRUD, and assignment.
 *
 * Module  : Deal
 * Package : Modules\Deal\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Deal\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Activity\Models\Activity;
use Modules\Activity\Services\ActivityService;
use Modules\Contact\Models\Contact;
use Modules\Contact\Models\Tag;
use Modules\Deal\Models\Deal;
use Modules\Deal\Models\DealProduct;
use Modules\Notification\Notifications\DealAssigned;
use Modules\Deal\Models\DealLog;
use Modules\Deal\Models\DealNote;
use Modules\Task\Models\Task;

class DealController extends Controller
{
    /**
     * Display the detail page for a single deal.
     * Loads notes, manual activity logs, and the system activity timeline.
     */
    public function show(Deal $deal): Response
    {
        $deal->load(['contact', 'assignedUser', 'createdBy', 'dealNotes.author', 'dealLogs.author', 'dealProducts']);

        $activities = Activity::with('user')
            ->where('entity_type', 'Deal')
            ->where('entity_id', $deal->id)
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

        $tasks = Task::with(['assignedUser', 'createdBy'])
            ->where('taskable_type', 'Deal')
            ->where('taskable_id', $deal->id)
            ->orderByRaw("CASE WHEN status='in_progress' THEN 1 WHEN status='pending' THEN 2 WHEN status='done' THEN 3 ELSE 4 END")
            ->orderBy('due_date')
            ->get()
            ->map(fn($t) => [
                'id'               => $t->id,
                'title'            => $t->title,
                'description'      => $t->description,
                'due_date'         => $t->due_date?->format('Y-m-d'),
                'due_date_label'   => $t->due_date?->format('M j, Y'),
                'assigned_user_id' => $t->assigned_user_id,
                'assigned_user'    => $t->assignedUser ? ['id' => $t->assignedUser->id, 'name' => $t->assignedUser->name] : null,
                'status'           => $t->status,
            ]);

        return Inertia::render('Deal/DealDetail', [
            'deal'         => $deal,
            'activities'   => $activities,
            'logTypes'     => DealLog::$types,
            'stages'       => Deal::$stages,
            'contacts'     => Contact::orderBy('first_name')->get(['id', 'first_name', 'last_name']),
            'salesUsers'   => User::role(['admin', 'manager', 'sales_user'])->orderBy('name')->get(['id', 'name']),
            'tasks'        => $tasks,
            'taskStatuses' => Task::$statuses,
            'stageProbabilities' => Deal::$stageProbabilities,
        ]);
    }

    /**
     * Add a plain text note to a deal.
     */
    public function addNote(Request $request, Deal $deal)
    {
        $request->validate(['body' => 'required|string']);

        $deal->dealNotes()->create([
            'user_id' => Auth::id(),
            'body'    => $request->body,
        ]);

        ActivityService::log('note_added', 'Deal', $deal->id, $deal->title);

        return back()->with('success', 'Note added.');
    }

    /**
     * Delete a plain text note from a deal.
     */
    public function deleteNote(Deal $deal, int $noteId)
    {
        $deal->dealNotes()->findOrFail($noteId)->delete();

        return back()->with('success', 'Note deleted.');
    }

    /**
     * Log a manual activity entry against a deal (email, sms, call, todo, note).
     */
    public function addLog(Request $request, Deal $deal)
    {
        $data = $request->validate([
            'type'     => 'required|in:note,email,sms,call,todo',
            'subject'  => 'nullable|string|max:191',
            'body'     => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);

        $deal->dealLogs()->create(array_merge($data, [
            'user_id'   => Auth::id(),
            'completed' => false,
        ]));

        ActivityService::log('log_added', 'Deal', $deal->id, $deal->title, ucfirst($data['type']) . ' logged');

        return back()->with('success', ucfirst($data['type']) . ' logged.');
    }

    /**
     * Delete a manual activity log entry from a deal.
     */
    public function deleteLog(Deal $deal, int $logId)
    {
        $deal->dealLogs()->findOrFail($logId)->delete();

        return back()->with('success', 'Log entry deleted.');
    }

    /**
     * Toggle the completed state of a todo log entry.
     */
    public function toggleLog(Deal $deal, int $logId)
    {
        $log = $deal->dealLogs()->findOrFail($logId);
        $log->update(['completed' => !$log->completed]);

        return back();
    }

    /**
     * Display the pipeline — both Kanban and list views share this data.
     * Groups deals by stage for the Kanban board.
     */
    public function index(Request $request): Response
    {
        $sort = in_array($request->sort, ['title', 'value', 'stage', 'expected_closing_date', 'created_at']) ? $request->sort : 'created_at';
        $dir  = $request->dir === 'asc' ? 'asc' : 'desc';

        $query = Deal::with(['contact', 'assignedUser', 'tags'])
            ->when($request->search, function ($q, $s) {
                $q->where('title', 'like', "%{$s}%");
            })
            ->when($request->stage, fn($q, $st) => $q->where('stage', $st))
            ->orderBy($sort, $dir);

        $allDeals = $query->get();

        // Group for Kanban
        $kanban = collect(Deal::$stages)->mapWithKeys(function ($meta, $stage) use ($allDeals) {
            return [$stage => [
                'label' => $meta['label'],
                'color' => $meta['color'],
                'deals' => $allDeals->where('stage', $stage)->values(),
            ]];
        });

        return Inertia::render('Deal/Pipeline', [
            'kanban'     => $kanban,
            'deals'      => $allDeals->values(),
            'stages'     => Deal::$stages,
            'contacts'   => Contact::orderBy('first_name')->get(['id', 'first_name', 'last_name']),
            'salesUsers' => User::role(['admin', 'manager', 'sales_user'])->orderBy('name')->get(['id', 'name']),
            'tags'       => Tag::orderBy('name')->get(),
            'filters'    => [
                'search' => $request->search,
                'stage'  => $request->stage,
                'sort'   => $request->sort,
                'dir'    => $request->dir,
            ],
        ]);
    }

    /**
     * Store a newly created deal.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'                 => 'required|string|max:191',
            'value'                 => 'nullable|numeric|min:0',
            'contact_id'            => 'nullable|exists:contacts,id',
            'stage'                 => 'required|in:new_deal,proposal_sent,negotiation,won,lost',
            'expected_closing_date' => 'nullable|date',
            'assigned_user_id'      => 'nullable|exists:users,id',
            'probability'           => 'nullable|integer|min:0|max:100',
            'tags'                  => 'nullable|array',
            'tags.*'                => 'integer|exists:tags,id',
        ]);

        // Auto-set probability from stage if not provided
        if (!isset($data['probability'])) {
            $data['probability'] = Deal::$stageProbabilities[$data['stage']] ?? 10;
        }

        $deal = Deal::create(array_merge($data, ['created_by' => Auth::id()]));

        if (!empty($data['tags'])) {
            $deal->tags()->sync($data['tags']);
        }

        ActivityService::log('created', 'Deal', $deal->id, $deal->title);

        // Notify the assigned user (skip self-assignment)
        if ($deal->assigned_user_id && $deal->assigned_user_id !== Auth::id()) {
            $deal->load('assignedUser');
            $deal->assignedUser->notify(new DealAssigned($deal));
        }

        return back()->with('success', 'Deal created.');
    }

    /**
     * Update an existing deal (fields or stage change).
     */
    public function update(Request $request, Deal $deal)
    {
        $data = $request->validate([
            'title'                 => 'required|string|max:191',
            'value'                 => 'nullable|numeric|min:0',
            'contact_id'            => 'nullable|exists:contacts,id',
            'stage'                 => 'required|in:new_deal,proposal_sent,negotiation,won,lost',
            'expected_closing_date' => 'nullable|date',
            'assigned_user_id'      => 'nullable|exists:users,id',
            'probability'           => 'nullable|integer|min:0|max:100',
            'tags'                  => 'nullable|array',
            'tags.*'                => 'integer|exists:tags,id',
        ]);

        $oldStage      = $deal->stage;
        $oldAssigneeId = $deal->assigned_user_id;
        $deal->update($data);
        $deal->tags()->sync($data['tags'] ?? []);

        if ($oldStage !== $deal->stage) {
            ActivityService::log('stage_changed', 'Deal', $deal->id, $deal->title, "{$oldStage} → {$deal->stage}");
        } else {
            ActivityService::log('updated', 'Deal', $deal->id, $deal->title);
        }

        // Notify new assignee when assignment changes (skip self-assignment)
        if ($deal->assigned_user_id
            && $deal->assigned_user_id !== $oldAssigneeId
            && $deal->assigned_user_id !== Auth::id()
        ) {
            $deal->load('assignedUser');
            $deal->assignedUser->notify(new DealAssigned($deal));
        }

        return back()->with('success', 'Deal updated.');
    }

    /**
     * Update only the stage of a deal (used by Kanban drag-and-drop).
     * Returns an Inertia-compatible redirect so router.patch() works correctly.
     */
    public function updateStage(Request $request, Deal $deal)
    {
        $request->validate([
            'stage' => 'required|in:new_deal,proposal_sent,negotiation,won,lost',
        ]);

        $oldStage = $deal->stage;
        $deal->update(['stage' => $request->stage]);

        ActivityService::log('stage_changed', 'Deal', $deal->id, $deal->title, "{$oldStage} → {$deal->stage}");

        return redirect()->back();
    }

    /**
     * Add a product line item to a deal.
     * Recalculates deal value from all line items after adding.
     */
    public function addProduct(Request $request, Deal $deal)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:191',
            'quantity'   => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

        $deal->dealProducts()->create($data);
        $this->recalcDealValue($deal);

        return back()->with('success', 'Product added.');
    }

    /**
     * Delete a product line item from a deal.
     * Recalculates deal value from remaining line items.
     */
    public function deleteProduct(Deal $deal, int $productId)
    {
        $deal->dealProducts()->findOrFail($productId)->delete();
        $this->recalcDealValue($deal);

        return back()->with('success', 'Product removed.');
    }

    /**
     * Recalculate and persist the deal value from its product line items.
     */
    private function recalcDealValue(Deal $deal): void
    {
        $total = $deal->dealProducts()->get()->sum(fn($p) => $p->quantity * $p->unit_price);
        $deal->update(['value' => $total]);
    }

    /**
     * Permanently delete a deal.
     */
    public function destroy(Deal $deal)
    {
        $title = $deal->title;
        $id    = $deal->id;
        $deal->delete();

        ActivityService::log('deleted', 'Deal', $id, $title);

        return back()->with('success', 'Deal deleted.');
    }
}
