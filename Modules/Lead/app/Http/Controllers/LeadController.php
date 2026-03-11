<?php

/**
 * LeadController
 *
 * Handles all HTTP actions for the Lead module.
 * Leads are prospective customers moving through qualification stages.
 * Supports status management, assignment to sales users, and conversion to Contact.
 *
 * Module  : Lead
 * Package : Modules\Lead\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Lead\Http\Controllers;

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
use Modules\Contact\Services\DuplicateService;
use Modules\Lead\Models\Lead;
use Modules\Notification\Notifications\LeadAssigned;
use Modules\Task\Models\Task;

class LeadController extends Controller
{
    /**
     * Display the detail page for a single lead.
     * Loads notes, relations, and the activity timeline for this lead.
     */
    public function show(Lead $lead): Response
    {
        $lead->load(['assignedUser', 'createdBy', 'leadNotes.author']);

        $activities = Activity::with('user')
            ->where('entity_type', 'Lead')
            ->where('entity_id', $lead->id)
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
            ->where('taskable_type', 'Lead')
            ->where('taskable_id', $lead->id)
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

        return Inertia::render('Lead/LeadDetail', [
            'lead'        => $lead,
            'activities'  => $activities,
            'statuses'    => Lead::$statusColors,
            'salesUsers'  => User::role(['admin', 'manager', 'sales_user'])->orderBy('name')->get(['id', 'name']),
            'tasks'       => $tasks,
            'taskStatuses' => Task::$statuses,
        ]);
    }

    /**
     * Display a paginated list of leads.
     * Supports search (name, email) and filter by status.
     */
    public function index(Request $request): Response
    {
        $sort    = in_array($request->sort, ['name', 'status', 'follow_up_date', 'created_at']) ? $request->sort : 'created_at';
        $dir     = $request->dir === 'asc' ? 'asc' : 'desc';

        $query = Lead::with(['assignedUser', 'createdBy', 'tags'])
            ->when($request->search, function ($q, $s) {
                $q->where(function ($inner) use ($s) {
                    $inner->where('name',  'like', "%{$s}%")
                          ->orWhere('email', 'like', "%{$s}%")
                          ->orWhere('phone', 'like', "%{$s}%");
                });
            })
            ->when($request->status, fn($q, $st) => $q->where('status', $st))
            ->when($request->tag, fn($q, $tagId) => $q->whereHas('tags', fn($t) => $t->where('tags.id', $tagId)))
            ->orderBy($sort, $dir)
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Lead/LeadList', [
            'leads'      => $query,
            'salesUsers' => User::role(['admin', 'manager', 'sales_user'])->orderBy('name')->get(['id', 'name']),
            'statuses'   => Lead::$statusColors,
            'sources'    => Lead::$sources,
            'tags'       => Tag::orderBy('name')->get(),
            'filters'    => [
                'search' => $request->search,
                'status' => $request->status,
                'tag'    => $request->tag,
                'sort'   => $request->sort,
                'dir'    => $request->dir,
            ],
        ]);
    }

    /**
     * Store a newly created lead.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:191',
            'email'            => 'nullable|email|max:191',
            'phone'            => 'nullable|string|max:50',
            'source'           => 'nullable|in:Website,Referral,LinkedIn,Cold Outreach,Event,Advertisement,Other',
            'assigned_user_id' => 'nullable|exists:users,id',
            'status'           => 'required|in:new,contacted,qualified,lost,converted',
            'notes'            => 'nullable|string',
            'follow_up_date'   => 'nullable|date',
            'tags'             => 'nullable|array',
            'tags.*'           => 'integer|exists:tags,id',
        ]);

        // Duplicate detection — skip when user explicitly forces creation
        if (!$request->boolean('force')) {
            $duplicates = DuplicateService::findLeads($data['email'] ?? null, $data['phone'] ?? null);
            if (!empty($duplicates)) {
                return back()->with('duplicates', $duplicates);
            }
        }

        $lead = Lead::create(array_merge($data, ['created_by' => Auth::id()]));

        if (!empty($data['tags'])) {
            $lead->tags()->sync($data['tags']);
        }

        ActivityService::log('created', 'Lead', $lead->id, $lead->name);

        // Notify the assigned user (skip if assigning to self)
        if ($lead->assigned_user_id && $lead->assigned_user_id !== Auth::id()) {
            $lead->assignedUser->notify(new LeadAssigned($lead));
        }

        return back()->with('success', 'Lead created.');
    }

    /**
     * Update an existing lead's fields.
     */
    public function update(Request $request, Lead $lead)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:191',
            'email'            => 'nullable|email|max:191',
            'phone'            => 'nullable|string|max:50',
            'source'           => 'nullable|in:Website,Referral,LinkedIn,Cold Outreach,Event,Advertisement,Other',
            'assigned_user_id' => 'nullable|exists:users,id',
            'status'           => 'required|in:new,contacted,qualified,lost,converted',
            'notes'            => 'nullable|string',
            'follow_up_date'   => 'nullable|date',
            'tags'             => 'nullable|array',
            'tags.*'           => 'integer|exists:tags,id',
        ]);

        $oldStatus     = $lead->status;
        $oldAssigneeId = $lead->assigned_user_id;
        $lead->update($data);
        $lead->tags()->sync($data['tags'] ?? []);

        if ($oldStatus !== $lead->status) {
            ActivityService::log('status_changed', 'Lead', $lead->id, $lead->name, "{$oldStatus} → {$lead->status}");
        } else {
            ActivityService::log('updated', 'Lead', $lead->id, $lead->name);
        }

        // Notify new assignee when assignment changes (skip self-assignment)
        if ($lead->assigned_user_id
            && $lead->assigned_user_id !== $oldAssigneeId
            && $lead->assigned_user_id !== Auth::id()
        ) {
            $lead->load('assignedUser');
            $lead->assignedUser->notify(new LeadAssigned($lead));
        }

        return back()->with('success', 'Lead updated.');
    }

    /**
     * Permanently delete a lead and its notes.
     */
    public function destroy(Lead $lead)
    {
        $name = $lead->name;
        $id   = $lead->id;
        $lead->delete();

        ActivityService::log('deleted', 'Lead', $id, $name);

        return back()->with('success', 'Lead deleted.');
    }

    /**
     * Convert a lead into a Contact.
     * Sets lead status to "converted" and creates a new Contact record.
     * Redirects to the contacts page on success.
     */
    public function convert(Lead $lead)
    {
        if ($lead->status === 'converted') {
            return back()->with('error', 'Lead is already converted.');
        }

        // Split name into first / last (best-effort)
        $parts     = explode(' ', trim($lead->name), 2);
        $firstName = $parts[0];
        $lastName  = $parts[1] ?? '';

        $contact = Contact::create([
            'first_name' => $firstName,
            'last_name'  => $lastName,
            'email'      => $lead->email,
            'phone'      => $lead->phone,
            'notes'      => $lead->notes,
            'created_by' => Auth::id(),
        ]);

        $lead->update(['status' => 'converted']);

        ActivityService::log('converted', 'Lead', $lead->id, $lead->name);

        return redirect("/contacts/{$contact->id}")->with('success', "Lead \"{$lead->name}\" converted — contact created.");
    }

    /**
     * Bulk soft-delete leads by ID array.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer|exists:leads,id']);
        Lead::whereIn('id', $request->ids)->delete();
        return back()->with('success', count($request->ids) . ' lead(s) deleted.');
    }

    /**
     * Bulk assign leads to a user.
     */
    public function bulkAssign(Request $request)
    {
        $request->validate([
            'ids'              => 'required|array',
            'ids.*'            => 'integer|exists:leads,id',
            'assigned_user_id' => 'required|exists:users,id',
        ]);
        Lead::whereIn('id', $request->ids)->update(['assigned_user_id' => $request->assigned_user_id]);
        return back()->with('success', count($request->ids) . ' lead(s) assigned.');
    }

    /**
     * Bulk update status for leads.
     */
    public function bulkStatus(Request $request)
    {
        $request->validate([
            'ids'    => 'required|array',
            'ids.*'  => 'integer|exists:leads,id',
            'status' => 'required|in:new,contacted,qualified,lost,converted',
        ]);
        Lead::whereIn('id', $request->ids)->update(['status' => $request->status]);
        return back()->with('success', count($request->ids) . ' lead(s) status updated.');
    }

    /**
     * Add a note to a lead.
     */
    public function addNote(Request $request, Lead $lead)
    {
        $request->validate(['body' => 'required|string']);

        $lead->leadNotes()->create([
            'user_id' => Auth::id(),
            'body'    => $request->body,
        ]);

        ActivityService::log('note_added', 'Lead', $lead->id, $lead->name);

        return back()->with('success', 'Note added.');
    }

    /**
     * Delete a single note from a lead.
     */
    public function deleteNote(Lead $lead, int $noteId)
    {
        $lead->leadNotes()->findOrFail($noteId)->delete();

        return back()->with('success', 'Note deleted.');
    }
}
