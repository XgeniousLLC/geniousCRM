<?php

/**
 * SearchController
 *
 * Powers the global search bar in the top navigation.
 * Queries contacts (name, email), leads (name, email), and deals (title)
 * in parallel and returns grouped JSON results.
 *
 * Module  : Core
 * Package : Modules\Core\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Contact\Models\Contact;
use Modules\Deal\Models\Deal;
use Modules\Lead\Models\Lead;

class SearchController extends Controller
{
    /**
     * Run a cross-entity search for the global search bar.
     * Returns up to 5 matches per entity type.
     * Requires at least 2 characters in the query.
     */
    public function search(Request $request): JsonResponse
    {
        $q = trim($request->get('q', ''));

        if (mb_strlen($q) < 2) {
            return response()->json(['contacts' => [], 'leads' => [], 'deals' => []]);
        }

        $like = '%' . $q . '%';

        $contacts = Contact::where(function ($query) use ($like) {
            $query->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$like])
                  ->orWhere('email', 'like', $like);
        })->limit(5)->get(['id', 'first_name', 'last_name', 'email'])
        ->map(fn($c) => [
            'id'    => $c->id,
            'label' => "{$c->first_name} {$c->last_name}",
            'sub'   => $c->email ?? '',
            'type'  => 'Contact',
            'url'   => "/contacts/{$c->id}",
        ]);

        $leads = Lead::where(function ($query) use ($like) {
            $query->where('name',  'like', $like)
                  ->orWhere('email', 'like', $like);
        })->limit(5)->get(['id', 'name', 'email'])
        ->map(fn($l) => [
            'id'    => $l->id,
            'label' => $l->name,
            'sub'   => $l->email ?? '',
            'type'  => 'Lead',
            'url'   => "/leads/{$l->id}",
        ]);

        $deals = Deal::where('title', 'like', $like)
            ->limit(5)->get(['id', 'title', 'stage'])
            ->map(fn($d) => [
                'id'    => $d->id,
                'label' => $d->title,
                'sub'   => $d->stage,
                'type'  => 'Deal',
                'url'   => "/deals/{$d->id}",
            ]);

        return response()->json([
            'contacts' => $contacts->values(),
            'leads'    => $leads->values(),
            'deals'    => $deals->values(),
        ]);
    }
}
