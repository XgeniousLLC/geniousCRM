<?php

/**
 * TrashController
 *
 * Unified trash view for the Mini CRM.
 * Loads all soft-deleted Contacts, Leads, and Deals in a single request
 * and renders them as tabbed sections on one page.
 * Restore and force-delete actions are still handled by each module's
 * own TrashController, so existing routes remain intact.
 *
 * Module  : Core
 * Package : Modules\Core\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Contact\Models\Contact;
use Modules\Deal\Models\Deal;
use Modules\Lead\Models\Lead;

class TrashController extends Controller
{
    /**
     * Display all soft-deleted records grouped by type.
     * Returns contacts, leads, and deals in a single Inertia render
     * so the frontend can switch between tabs without extra round-trips.
     */
    public function index(): Response
    {
        $contacts = Contact::onlyTrashed()
            ->orderByDesc('deleted_at')
            ->get(['id', 'first_name', 'last_name', 'email', 'company', 'deleted_at'])
            ->map(fn ($c) => [
                'id'         => $c->id,
                'name'       => trim("{$c->first_name} {$c->last_name}"),
                'email'      => $c->email,
                'company'    => $c->company,
                'deleted_at' => $c->deleted_at->diffForHumans(),
            ]);

        $leads = Lead::onlyTrashed()
            ->orderByDesc('deleted_at')
            ->get(['id', 'name', 'email', 'status', 'deleted_at'])
            ->map(fn ($l) => [
                'id'         => $l->id,
                'name'       => $l->name,
                'email'      => $l->email,
                'status'     => $l->status,
                'deleted_at' => $l->deleted_at->diffForHumans(),
            ]);

        $deals = Deal::onlyTrashed()
            ->orderByDesc('deleted_at')
            ->get(['id', 'title', 'value', 'stage', 'deleted_at'])
            ->map(fn ($d) => [
                'id'          => $d->id,
                'title'       => $d->title,
                'value'       => $d->value,
                'stage'       => $d->stage,
                'stage_label' => Deal::$stages[$d->stage]['label'] ?? $d->stage,
                'stage_color' => Deal::$stages[$d->stage]['color'] ?? '#6b7280',
                'deleted_at'  => $d->deleted_at->diffForHumans(),
            ]);

        return Inertia::render('Core/Trash', [
            'contacts' => $contacts,
            'leads'    => $leads,
            'deals'    => $deals,
        ]);
    }
}
