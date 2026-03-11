<?php

/**
 * ContactTrashController
 *
 * Manages the soft-deleted contacts bin.
 * Allows admins to view, restore, or permanently delete trashed contacts.
 *
 * Module  : Contact
 * Package : Modules\Contact\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Contact\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Contact\Models\Contact;

class ContactTrashController extends Controller
{
    /**
     * Display a paginated list of soft-deleted contacts.
     */
    public function index(): Response
    {
        $contacts = Contact::onlyTrashed()
            ->latest('deleted_at')
            ->paginate(20);

        return Inertia::render('Contact/ContactTrash', [
            'contacts' => $contacts,
        ]);
    }

    /**
     * Restore a soft-deleted contact back to the active list.
     */
    public function restore(int $id): RedirectResponse
    {
        Contact::onlyTrashed()->findOrFail($id)->restore();

        return back()->with('success', 'Contact restored.');
    }

    /**
     * Permanently delete a trashed contact (irreversible).
     */
    public function forceDelete(int $id): RedirectResponse
    {
        Contact::onlyTrashed()->findOrFail($id)->forceDelete();

        return back()->with('success', 'Contact permanently deleted.');
    }
}
