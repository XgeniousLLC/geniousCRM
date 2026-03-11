<?php

/**
 * ContactController
 *
 * Handles all HTTP actions for the Contact module.
 * Contacts represent real people or organisations tracked in the Mini CRM.
 * Supports search by name/email/company and filter by tag.
 *
 * Module  : Contact
 * Package : Modules\Contact\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Contact\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Modules\Activity\Models\Activity;
use Modules\Activity\Services\ActivityService;
use Inertia\Response;
use Modules\Contact\Models\Contact;
use Modules\Contact\Models\Tag;
use Modules\Contact\Services\DuplicateService;
use Modules\Company\Models\Company;
use Modules\Deal\Models\Deal;
use Modules\Task\Models\Task;

class ContactController extends Controller
{
    /**
     * Display the detail page for a single contact.
     * Loads notes, tags, and the activity timeline for this contact.
     */
    public function show(Contact $contact): Response
    {
        $contact->load(['tags', 'contactNotes.author', 'createdBy']);

        $activities = Activity::with('user')
            ->where('entity_type', 'Contact')
            ->where('entity_id', $contact->id)
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
            ->where('taskable_type', 'Contact')
            ->where('taskable_id', $contact->id)
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

        $deals = Deal::with('assignedUser')
            ->where('contact_id', $contact->id)
            ->latest()
            ->get()
            ->map(fn ($d) => [
                'id'    => $d->id,
                'title' => $d->title,
                'value' => $d->value,
                'stage' => $d->stage,
                'assigned_user' => $d->assignedUser ? ['name' => $d->assignedUser->name] : null,
            ]);

        return Inertia::render('Contact/ContactDetail', [
            'contact'      => $contact,
            'activities'   => $activities,
            'allTags'      => Tag::orderBy('name')->get(),
            'salesUsers'   => User::role(['admin', 'manager', 'sales_user'])->orderBy('name')->get(['id', 'name']),
            'tasks'        => $tasks,
            'taskStatuses' => Task::$statuses,
            'deals'        => $deals,
        ]);
    }

    /**
     * Display a paginated list of contacts.
     * Supports search (name, email, company) and tag filter.
     */
    public function index(Request $request): Response
    {
        $sort    = in_array($request->sort, ['first_name', 'company', 'created_at']) ? $request->sort : 'created_at';
        $dir     = $request->dir === 'asc' ? 'asc' : 'desc';

        $query = Contact::with(['tags', 'createdBy'])
            ->when($request->search, function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('first_name', 'like', "%{$search}%")
                          ->orWhere('last_name',  'like', "%{$search}%")
                          ->orWhere('email',       'like', "%{$search}%")
                          ->orWhere('company',     'like', "%{$search}%");
                });
            })
            ->when($request->tag, function ($q, $tagId) {
                $q->whereHas('tags', fn($t) => $t->where('tags.id', $tagId));
            })
            ->orderBy($sort, $dir)
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Contact/ContactList', [
            'contacts'  => $query,
            'tags'      => Tag::orderBy('name')->get(),
            'companies' => Company::orderBy('name')->get(['id', 'name']),
            'filters'   => [
                'search' => $request->search,
                'tag'    => $request->tag,
                'sort'   => $request->sort,
                'dir'    => $request->dir,
            ],
        ]);
    }

    /**
     * Bulk soft-delete contacts by ID array.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer|exists:contacts,id']);
        Contact::whereIn('id', $request->ids)->delete();
        return back()->with('success', count($request->ids) . ' contact(s) deleted.');
    }

    /**
     * Attach a tag to all contacts in the given ID array.
     */
    public function bulkTag(Request $request)
    {
        $request->validate([
            'ids'    => 'required|array',
            'ids.*'  => 'integer|exists:contacts,id',
            'tag_id' => 'required|integer|exists:tags,id',
        ]);
        Contact::whereIn('id', $request->ids)->each(fn($c) => $c->tags()->syncWithoutDetaching([$request->tag_id]));
        return back()->with('success', 'Tag applied to ' . count($request->ids) . ' contact(s).');
    }

    /**
     * Export selected contacts (by ID array from query string) as CSV.
     */
    public function bulkExport(Request $request)
    {
        $ids  = array_filter(explode(',', $request->get('ids', '')));
        $rows = Contact::with('tags')
            ->when(!empty($ids), fn($q) => $q->whereIn('id', $ids))
            ->orderBy('id')
            ->get()
            ->map(fn($c) => [
                $c->id,
                $c->first_name,
                $c->last_name,
                $c->email ?? '',
                $c->phone ?? '',
                $c->company ?? '',
                $c->tags->pluck('name')->join(', '),
                $c->created_at->format('Y-m-d'),
            ]);

        $headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Tags', 'Created At'];
        $filename = 'contacts_export_' . now()->format('Y-m-d') . '.csv';

        return response()->stream(function () use ($headers, $rows) {
            $h = fopen('php://output', 'w');
            fputcsv($h, $headers);
            foreach ($rows as $row) fputcsv($h, $row);
            fclose($h);
        }, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Store a newly created contact.
     * Attaches tags by ID array after saving.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'nullable|email|max:191',
            'phone'      => 'nullable|string|max:50',
            'company'    => 'nullable|string|max:191',
            'company_id' => 'nullable|exists:companies,id',
            'notes'      => 'nullable|string',
            'tags'       => 'nullable|array',
            'tags.*'     => 'integer|exists:tags,id',
        ]);

        // Duplicate detection — skip when user explicitly forces creation
        if (!$request->boolean('force')) {
            $duplicates = DuplicateService::findContacts($data['email'] ?? null, $data['phone'] ?? null);
            if (!empty($duplicates)) {
                return back()->with('duplicates', $duplicates);
            }
        }

        $contact = Contact::create(array_merge($data, ['created_by' => Auth::id()]));

        if (!empty($data['tags'])) {
            $contact->tags()->sync($data['tags']);
        }

        ActivityService::log('created', 'Contact', $contact->id, "{$contact->first_name} {$contact->last_name}");

        return back()->with('success', 'Contact created.');
    }

    /**
     * Update an existing contact's fields and tag associations.
     */
    public function update(Request $request, Contact $contact)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'nullable|email|max:191',
            'phone'      => 'nullable|string|max:50',
            'company'    => 'nullable|string|max:191',
            'company_id' => 'nullable|exists:companies,id',
            'notes'      => 'nullable|string',
            'tags'       => 'nullable|array',
            'tags.*'     => 'integer|exists:tags,id',
        ]);

        $contact->update($data);
        $contact->tags()->sync($data['tags'] ?? []);

        ActivityService::log('updated', 'Contact', $contact->id, "{$contact->first_name} {$contact->last_name}");

        return back()->with('success', 'Contact updated.');
    }

    /**
     * Permanently delete a contact and its associated notes.
     */
    public function destroy(Contact $contact)
    {
        $name = "{$contact->first_name} {$contact->last_name}";
        $id   = $contact->id;
        $contact->delete();

        ActivityService::log('deleted', 'Contact', $id, $name);

        return back()->with('success', 'Contact deleted.');
    }

    /**
     * Add a note to a contact.
     */
    public function addNote(Request $request, Contact $contact)
    {
        $request->validate(['body' => 'required|string']);

        $contact->contactNotes()->create([
            'user_id' => Auth::id(),
            'body'    => $request->body,
        ]);

        ActivityService::log('note_added', 'Contact', $contact->id, "{$contact->first_name} {$contact->last_name}");

        return back()->with('success', 'Note added.');
    }

    /**
     * Delete a single note from a contact.
     */
    public function deleteNote(Contact $contact, int $noteId)
    {
        $contact->contactNotes()->findOrFail($noteId)->delete();

        return back()->with('success', 'Note deleted.');
    }
}
