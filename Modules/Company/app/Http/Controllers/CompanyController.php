<?php

/**
 * CompanyController
 *
 * Handles all HTTP actions for the Company module.
 * Companies are organisations that contacts and deals can be linked to.
 *
 * Module  : Company
 * Package : Modules\Company\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Company\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Activity\Models\Activity;
use Modules\Activity\Services\ActivityService;
use Modules\Company\Models\Company;
use Modules\Deal\Models\Deal;
use Modules\Task\Models\Task;

class CompanyController extends Controller
{
    /**
     * Display a paginated, searchable list of companies.
     */
    public function index(Request $request): Response
    {
        $sort = in_array($request->sort, ['name', 'industry', 'created_at']) ? $request->sort : 'name';
        $dir  = $request->dir === 'desc' ? 'desc' : 'asc';

        $companies = Company::withCount('contacts')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")
                ->orWhere('industry', 'like', "%{$s}%"))
            ->orderBy($sort, $dir)
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Company/CompanyList', [
            'companies' => $companies,
            'filters'   => [
                'search' => $request->search,
                'sort'   => $request->sort,
                'dir'    => $request->dir,
            ],
        ]);
    }

    /**
     * Display the detail page for a single company.
     * Shows linked contacts, linked deals, activity feed, and tasks.
     */
    public function show(Company $company): Response
    {
        $company->load(['contacts', 'createdBy']);

        // Deals linked via contacts
        $contactIds = $company->contacts->pluck('id');
        $deals = Deal::with('assignedUser')
            ->whereIn('contact_id', $contactIds)
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn($d) => [
                'id'    => $d->id,
                'title' => $d->title,
                'value' => $d->value,
                'stage' => $d->stage,
                'stage_label' => Deal::$stages[$d->stage]['label'] ?? $d->stage,
                'stage_color' => Deal::$stages[$d->stage]['color'] ?? '#6b7280',
                'assigned_user' => $d->assignedUser ? ['name' => $d->assignedUser->name] : null,
            ]);

        $activities = Activity::with('user')
            ->where('entity_type', 'Company')
            ->where('entity_id', $company->id)
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn($a) => [
                'id'           => $a->id,
                'action'       => $a->action,
                'action_label' => $a->actionLabel(),
                'description'  => $a->description,
                'user'         => $a->user ? ['name' => $a->user->name] : null,
                'created_at'   => $a->created_at->diffForHumans(),
            ]);

        $tasks = Task::with(['assignedUser'])
            ->where('taskable_type', 'Company')
            ->where('taskable_id', $company->id)
            ->orderByRaw("CASE WHEN status='in_progress' THEN 1 WHEN status='pending' THEN 2 WHEN status='done' THEN 3 ELSE 4 END")
            ->orderBy('due_date')
            ->get()
            ->map(fn($t) => [
                'id'             => $t->id,
                'title'          => $t->title,
                'description'    => $t->description,
                'due_date'       => $t->due_date?->format('Y-m-d'),
                'due_date_label' => $t->due_date?->format('M j, Y'),
                'assigned_user'  => $t->assignedUser ? ['id' => $t->assignedUser->id, 'name' => $t->assignedUser->name] : null,
                'status'         => $t->status,
            ]);

        return Inertia::render('Company/CompanyDetail', [
            'company'      => $company,
            'deals'        => $deals,
            'activities'   => $activities,
            'tasks'        => $tasks,
            'taskStatuses' => Task::$statuses,
        ]);
    }

    /**
     * Store a newly created company.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:191',
            'industry' => 'nullable|string|max:191',
            'website'  => 'nullable|string|max:191',
            'phone'    => 'nullable|string|max:50',
            'address'  => 'nullable|string',
        ]);

        $company = Company::create(array_merge($data, ['created_by' => Auth::id()]));

        ActivityService::log('created', 'Company', $company->id, $company->name);

        return back()->with('success', 'Company created.');
    }

    /**
     * Update an existing company.
     */
    public function update(Request $request, Company $company)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:191',
            'industry' => 'nullable|string|max:191',
            'website'  => 'nullable|string|max:191',
            'phone'    => 'nullable|string|max:50',
            'address'  => 'nullable|string',
        ]);

        $company->update($data);

        ActivityService::log('updated', 'Company', $company->id, $company->name);

        return back()->with('success', 'Company updated.');
    }

    /**
     * Permanently delete a company.
     */
    public function destroy(Company $company)
    {
        $name = $company->name;
        $id   = $company->id;
        $company->delete();

        ActivityService::log('deleted', 'Company', $id, $name);

        return back()->with('success', 'Company deleted.');
    }
}
