<?php

/**
 * ApiDocController
 *
 * Renders the in-admin REST API documentation page.
 * Passes all endpoint definitions as structured data to the React page.
 * Accessible to all authenticated users.
 *
 * Module  : Api
 * Package : Modules\Api\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Api\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ApiDocController extends Controller
{
    /**
     * Render the API documentation page.
     * The endpoint spec is defined here as structured data so the React
     * page can render it without any runtime API calls.
     */
    public function index(): Response
    {
        $baseUrl = rtrim(config('app.url'), '/') . '/api/v1';

        $endpoints = [
            [
                'group'       => 'Authentication',
                'description' => 'Obtain and revoke Sanctum bearer tokens. Login and register are public (no token required).',
                'items'       => [
                    [
                        'method'      => 'POST',
                        'path'        => '/api/v1/login',
                        'summary'     => 'Login — obtain a bearer token',
                        'auth'        => false,
                        'body'        => ['email' => 'string (required)', 'password' => 'string (required)'],
                        'response'    => ['token' => 'string', 'user' => ['id' => 1, 'name' => 'John Doe', 'email' => 'john@example.com', 'roles' => ['sales_user']]],
                        'status'      => 200,
                    ],
                    [
                        'method'      => 'POST',
                        'path'        => '/api/v1/register',
                        'summary'     => 'Register a new user (assigned sales_user role)',
                        'auth'        => false,
                        'body'        => ['name' => 'string (required)', 'email' => 'string (required)', 'password' => 'string min:8 (required)', 'password_confirmation' => 'string (required)'],
                        'response'    => ['token' => 'string', 'user' => ['id' => 2, 'name' => 'Jane Doe', 'email' => 'jane@example.com', 'roles' => ['sales_user']]],
                        'status'      => 201,
                    ],
                    [
                        'method'      => 'POST',
                        'path'        => '/api/v1/logout',
                        'summary'     => 'Logout — revoke current token',
                        'auth'        => true,
                        'body'        => [],
                        'response'    => ['message' => 'Logged out successfully.'],
                        'status'      => 200,
                    ],
                ],
            ],
            [
                'group'       => 'Contacts',
                'description' => 'Manage CRM contacts. Supports search by name/email/company and tag filtering.',
                'items'       => [
                    [
                        'method'      => 'GET',
                        'path'        => '/api/v1/contacts',
                        'summary'     => 'List contacts (paginated, 15/page)',
                        'auth'        => true,
                        'query'       => ['search' => 'string (optional)', 'tag' => 'integer tag ID (optional)', 'page' => 'integer (optional)'],
                        'response'    => ['data' => [['id' => 1, 'first_name' => 'Alice', 'last_name' => 'Smith', 'email' => 'alice@example.com', 'phone' => '+1234567890', 'company' => 'Acme Inc', 'tags' => [], 'created_at' => '2026-03-01T00:00:00Z']], 'meta' => ['total' => 1, 'per_page' => 15, 'current_page' => 1]],
                        'status'      => 200,
                    ],
                    [
                        'method'      => 'POST',
                        'path'        => '/api/v1/contacts',
                        'summary'     => 'Create a new contact',
                        'auth'        => true,
                        'body'        => ['first_name' => 'string (required)', 'last_name' => 'string (required)', 'email' => 'email (optional)', 'phone' => 'string (optional)', 'company' => 'string (optional)', 'notes' => 'string (optional)', 'tags' => 'array of tag IDs (optional)'],
                        'response'    => ['data' => ['id' => 3, 'first_name' => 'Bob', 'last_name' => 'Jones', 'email' => 'bob@example.com']],
                        'status'      => 201,
                    ],
                    [
                        'method'      => 'GET',
                        'path'        => '/api/v1/contacts/{id}',
                        'summary'     => 'Get a single contact',
                        'auth'        => true,
                        'body'        => [],
                        'response'    => ['data' => ['id' => 1, 'first_name' => 'Alice', 'last_name' => 'Smith', 'email' => 'alice@example.com', 'tags' => [['id' => 1, 'name' => 'VIP', 'color' => '#6366f1']]]],
                        'status'      => 200,
                    ],
                    [
                        'method'      => 'PUT',
                        'path'        => '/api/v1/contacts/{id}',
                        'summary'     => 'Update a contact',
                        'auth'        => true,
                        'body'        => ['first_name' => 'string (required)', 'last_name' => 'string (required)', 'email' => 'email (optional)', 'phone' => 'string (optional)', 'company' => 'string (optional)', 'notes' => 'string (optional)', 'tags' => 'array of tag IDs (optional)'],
                        'response'    => ['data' => ['id' => 1, 'first_name' => 'Alice', 'last_name' => 'Updated']],
                        'status'      => 200,
                    ],
                    [
                        'method'      => 'DELETE',
                        'path'        => '/api/v1/contacts/{id}',
                        'summary'     => 'Delete a contact',
                        'auth'        => true,
                        'body'        => [],
                        'response'    => ['message' => 'Contact deleted.'],
                        'status'      => 200,
                    ],
                ],
            ],
            [
                'group'       => 'Leads',
                'description' => 'Manage CRM leads. Filter by status (new, contacted, qualified, lost, converted).',
                'items'       => [
                    [
                        'method'      => 'GET',
                        'path'        => '/api/v1/leads',
                        'summary'     => 'List leads (paginated)',
                        'auth'        => true,
                        'query'       => ['search' => 'string (optional)', 'status' => 'new|contacted|qualified|lost|converted (optional)', 'page' => 'integer (optional)'],
                        'response'    => ['data' => [['id' => 1, 'name' => 'John Lead', 'email' => 'john@lead.com', 'status' => 'new', 'source' => 'Website']], 'meta' => ['total' => 1]],
                        'status'      => 200,
                    ],
                    [
                        'method'      => 'POST',
                        'path'        => '/api/v1/leads',
                        'summary'     => 'Create a new lead',
                        'auth'        => true,
                        'body'        => ['name' => 'string (required)', 'email' => 'email (optional)', 'phone' => 'string (optional)', 'source' => 'string (optional)', 'assigned_user_id' => 'integer (optional)', 'status' => 'new|contacted|qualified|lost (optional, default: new)', 'notes' => 'string (optional)'],
                        'response'    => ['data' => ['id' => 5, 'name' => 'New Lead', 'status' => 'new']],
                        'status'      => 201,
                    ],
                    [
                        'method'      => 'GET',
                        'path'        => '/api/v1/leads/{id}',
                        'summary'     => 'Get a single lead',
                        'auth'        => true,
                        'body'        => [],
                        'response'    => ['data' => ['id' => 1, 'name' => 'John Lead', 'status' => 'contacted', 'assigned_user' => ['id' => 2, 'name' => 'Sales Rep']]],
                        'status'      => 200,
                    ],
                    [
                        'method'      => 'PUT',
                        'path'        => '/api/v1/leads/{id}',
                        'summary'     => 'Update a lead',
                        'auth'        => true,
                        'body'        => ['name' => 'string (required)', 'status' => 'new|contacted|qualified|lost|converted (required)', 'email' => 'email (optional)', 'phone' => 'string (optional)', 'source' => 'string (optional)', 'assigned_user_id' => 'integer (optional)', 'notes' => 'string (optional)'],
                        'response'    => ['data' => ['id' => 1, 'name' => 'John Lead', 'status' => 'qualified']],
                        'status'      => 200,
                    ],
                    [
                        'method'      => 'DELETE',
                        'path'        => '/api/v1/leads/{id}',
                        'summary'     => 'Delete a lead',
                        'auth'        => true,
                        'body'        => [],
                        'response'    => ['message' => 'Lead deleted.'],
                        'status'      => 200,
                    ],
                ],
            ],
            [
                'group'       => 'Deals',
                'description' => 'Manage sales pipeline deals. Filter by stage (new_deal, proposal_sent, negotiation, won, lost).',
                'items'       => [
                    [
                        'method'      => 'GET',
                        'path'        => '/api/v1/deals',
                        'summary'     => 'List deals (paginated)',
                        'auth'        => true,
                        'query'       => ['search' => 'string (optional)', 'stage' => 'new_deal|proposal_sent|negotiation|won|lost (optional)', 'page' => 'integer (optional)'],
                        'response'    => ['data' => [['id' => 1, 'title' => 'Acme Deal', 'value' => 5000, 'stage' => 'negotiation']], 'meta' => ['total' => 1]],
                        'status'      => 200,
                    ],
                    [
                        'method'      => 'POST',
                        'path'        => '/api/v1/deals',
                        'summary'     => 'Create a new deal',
                        'auth'        => true,
                        'body'        => ['title' => 'string (required)', 'value' => 'number (optional)', 'contact_id' => 'integer (optional)', 'stage' => 'new_deal|proposal_sent|negotiation|won|lost (required)', 'expected_closing_date' => 'date Y-m-d (optional)', 'assigned_user_id' => 'integer (optional)'],
                        'response'    => ['data' => ['id' => 8, 'title' => 'New Deal', 'stage' => 'new_deal', 'value' => 2500]],
                        'status'      => 201,
                    ],
                    [
                        'method'      => 'GET',
                        'path'        => '/api/v1/deals/{id}',
                        'summary'     => 'Get a single deal',
                        'auth'        => true,
                        'body'        => [],
                        'response'    => ['data' => ['id' => 1, 'title' => 'Acme Deal', 'value' => 5000, 'stage' => 'negotiation', 'contact' => ['id' => 1, 'name' => 'Alice Smith']]],
                        'status'      => 200,
                    ],
                    [
                        'method'      => 'PUT',
                        'path'        => '/api/v1/deals/{id}',
                        'summary'     => 'Update a deal',
                        'auth'        => true,
                        'body'        => ['title' => 'string (required)', 'value' => 'number (optional)', 'contact_id' => 'integer (optional)', 'stage' => 'new_deal|proposal_sent|negotiation|won|lost (required)', 'expected_closing_date' => 'date (optional)', 'assigned_user_id' => 'integer (optional)'],
                        'response'    => ['data' => ['id' => 1, 'title' => 'Acme Deal', 'stage' => 'won']],
                        'status'      => 200,
                    ],
                    [
                        'method'      => 'DELETE',
                        'path'        => '/api/v1/deals/{id}',
                        'summary'     => 'Delete a deal',
                        'auth'        => true,
                        'body'        => [],
                        'response'    => ['message' => 'Deal deleted.'],
                        'status'      => 200,
                    ],
                ],
            ],
            [
                'group'       => 'Tasks',
                'description' => 'Manage tasks linked to any entity (Lead, Contact, Deal). Filter by status or entity.',
                'items'       => [
                    [
                        'method'      => 'GET',
                        'path'        => '/api/v1/tasks',
                        'summary'     => 'List tasks (paginated)',
                        'auth'        => true,
                        'query'       => ['status' => 'pending|in_progress|done (optional)', 'entity_type' => 'Lead|Contact|Deal (optional)', 'entity_id' => 'integer (optional)', 'assigned_to_me' => '1 (optional)', 'page' => 'integer (optional)'],
                        'response'    => ['data' => [['id' => 1, 'title' => 'Follow up', 'status' => 'pending', 'due_date' => '2026-03-15', 'taskable_type' => 'Lead', 'taskable_id' => 3]], 'meta' => ['total' => 1]],
                        'status'      => 200,
                    ],
                    [
                        'method'      => 'POST',
                        'path'        => '/api/v1/tasks',
                        'summary'     => 'Create a task linked to an entity',
                        'auth'        => true,
                        'body'        => ['title' => 'string (required)', 'description' => 'string (optional)', 'due_date' => 'date Y-m-d (optional)', 'assigned_user_id' => 'integer (optional)', 'status' => 'pending|in_progress|done (optional, default: pending)', 'taskable_type' => 'Lead|Contact|Deal (required)', 'taskable_id' => 'integer (required)'],
                        'response'    => ['data' => ['id' => 12, 'title' => 'Send proposal', 'status' => 'pending', 'taskable_type' => 'Deal', 'taskable_id' => 5]],
                        'status'      => 201,
                    ],
                    [
                        'method'      => 'GET',
                        'path'        => '/api/v1/tasks/{id}',
                        'summary'     => 'Get a single task',
                        'auth'        => true,
                        'body'        => [],
                        'response'    => ['data' => ['id' => 1, 'title' => 'Follow up', 'status' => 'in_progress', 'assigned_user' => ['id' => 3, 'name' => 'Sales Rep']]],
                        'status'      => 200,
                    ],
                    [
                        'method'      => 'PUT',
                        'path'        => '/api/v1/tasks/{id}',
                        'summary'     => 'Update a task',
                        'auth'        => true,
                        'body'        => ['title' => 'string (required)', 'description' => 'string (optional)', 'due_date' => 'date (optional)', 'assigned_user_id' => 'integer (optional)', 'status' => 'pending|in_progress|done (required)'],
                        'response'    => ['data' => ['id' => 1, 'title' => 'Follow up', 'status' => 'done']],
                        'status'      => 200,
                    ],
                    [
                        'method'      => 'DELETE',
                        'path'        => '/api/v1/tasks/{id}',
                        'summary'     => 'Delete a task',
                        'auth'        => true,
                        'body'        => [],
                        'response'    => ['message' => 'Task deleted.'],
                        'status'      => 200,
                    ],
                ],
            ],
        ];

        return Inertia::render('Api/ApiDocs', [
            'baseUrl'   => $baseUrl,
            'endpoints' => $endpoints,
            'version'   => 'v1',
        ]);
    }
}
