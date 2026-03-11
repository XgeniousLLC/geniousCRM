<?php

/**
 * ContactApiController
 *
 * REST API controller for Contact resources.
 * Supports list (with search/tag filter), show, create, update, delete.
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
use Modules\Api\Http\Resources\ContactResource;
use Modules\Contact\Models\Contact;

class ContactApiController extends Controller
{
    /**
     * Return a paginated list of contacts.
     * Supports ?search= (name/email/company) and ?tag= (tag ID).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $contacts = Contact::with(['tags', 'createdBy'])
            ->when($request->search, function ($q, $s) {
                $q->where(function ($inner) use ($s) {
                    $inner->where('first_name', 'like', "%{$s}%")
                          ->orWhere('last_name',  'like', "%{$s}%")
                          ->orWhere('email',       'like', "%{$s}%")
                          ->orWhere('company',     'like', "%{$s}%");
                });
            })
            ->when($request->tag, fn ($q, $tagId) => $q->whereHas('tags', fn ($t) => $t->where('tags.id', $tagId)))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return ContactResource::collection($contacts);
    }

    /**
     * Return a single contact with its tags.
     */
    public function show(Contact $contact): ContactResource
    {
        $contact->load(['tags', 'createdBy']);

        return new ContactResource($contact);
    }

    /**
     * Store a new contact.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'nullable|email|max:191',
            'phone'      => 'nullable|string|max:50',
            'company'    => 'nullable|string|max:191',
            'notes'      => 'nullable|string',
            'tags'       => 'nullable|array',
            'tags.*'     => 'integer|exists:tags,id',
        ]);

        $contact = Contact::create(array_merge($data, ['created_by' => Auth::id()]));

        if (!empty($data['tags'])) {
            $contact->tags()->sync($data['tags']);
        }

        ActivityService::log('created', 'Contact', $contact->id, "{$contact->first_name} {$contact->last_name}");

        $contact->load(['tags', 'createdBy']);

        return (new ContactResource($contact))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update an existing contact's fields and tag associations.
     */
    public function update(Request $request, Contact $contact): ContactResource
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'nullable|email|max:191',
            'phone'      => 'nullable|string|max:50',
            'company'    => 'nullable|string|max:191',
            'notes'      => 'nullable|string',
            'tags'       => 'nullable|array',
            'tags.*'     => 'integer|exists:tags,id',
        ]);

        $contact->update($data);
        $contact->tags()->sync($data['tags'] ?? []);

        ActivityService::log('updated', 'Contact', $contact->id, "{$contact->first_name} {$contact->last_name}");

        $contact->load(['tags', 'createdBy']);

        return new ContactResource($contact);
    }

    /**
     * Permanently delete a contact.
     */
    public function destroy(Contact $contact): JsonResponse
    {
        $name = "{$contact->first_name} {$contact->last_name}";
        $id   = $contact->id;
        $contact->delete();

        ActivityService::log('deleted', 'Contact', $id, $name);

        return response()->json(['message' => 'Contact deleted.']);
    }
}
