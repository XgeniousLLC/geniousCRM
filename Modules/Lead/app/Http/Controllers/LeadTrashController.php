<?php

/**
 * LeadTrashController
 *
 * Manages the soft-deleted leads bin.
 * Allows admins to view, restore, or permanently delete trashed leads.
 *
 * Module  : Lead
 * Package : Modules\Lead\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Lead\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Lead\Models\Lead;

class LeadTrashController extends Controller
{
    /**
     * Display a paginated list of soft-deleted leads.
     */
    public function index(): Response
    {
        $leads = Lead::onlyTrashed()
            ->latest('deleted_at')
            ->paginate(20);

        return Inertia::render('Lead/LeadTrash', [
            'leads' => $leads,
        ]);
    }

    /**
     * Restore a soft-deleted lead back to the active list.
     */
    public function restore(int $id): RedirectResponse
    {
        Lead::onlyTrashed()->findOrFail($id)->restore();

        return back()->with('success', 'Lead restored.');
    }

    /**
     * Permanently delete a trashed lead (irreversible).
     */
    public function forceDelete(int $id): RedirectResponse
    {
        Lead::onlyTrashed()->findOrFail($id)->forceDelete();

        return back()->with('success', 'Lead permanently deleted.');
    }
}
