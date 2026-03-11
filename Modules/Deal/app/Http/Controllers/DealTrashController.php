<?php

/**
 * DealTrashController
 *
 * Manages the soft-deleted deals bin.
 * Allows admins to view, restore, or permanently delete trashed deals.
 *
 * Module  : Deal
 * Package : Modules\Deal\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Deal\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Deal\Models\Deal;

class DealTrashController extends Controller
{
    /**
     * Display a paginated list of soft-deleted deals.
     */
    public function index(): Response
    {
        $deals = Deal::onlyTrashed()
            ->latest('deleted_at')
            ->paginate(20);

        return Inertia::render('Deal/DealTrash', [
            'deals' => $deals,
        ]);
    }

    /**
     * Restore a soft-deleted deal back to the active pipeline.
     */
    public function restore(int $id): RedirectResponse
    {
        Deal::onlyTrashed()->findOrFail($id)->restore();

        return back()->with('success', 'Deal restored.');
    }

    /**
     * Permanently delete a trashed deal (irreversible).
     */
    public function forceDelete(int $id): RedirectResponse
    {
        Deal::onlyTrashed()->findOrFail($id)->forceDelete();

        return back()->with('success', 'Deal permanently deleted.');
    }
}
