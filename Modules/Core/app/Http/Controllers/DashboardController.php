<?php

/**
 * DashboardController
 *
 * Renders the admin/manager/sales dashboard home page.
 * Passes real summary statistics (contacts, leads, deals, tasks) to the Inertia view.
 *
 * Module  : Core
 * Package : Modules\Core\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Contact\Models\Contact;
use Modules\Deal\Models\Deal;
use Modules\Lead\Models\Lead;
use Modules\Task\Models\Task;

class DashboardController extends Controller
{
    /**
     * Render the main dashboard with live summary stat cards.
     */
    public function index(Request $request): Response
    {
        $stats = [
            'contacts'           => Contact::count(),
            'leads'              => Lead::whereNotIn('status', ['converted', 'lost'])->count(),
            'deals'              => Deal::whereNotIn('stage', ['won', 'lost'])->count(),
            'tasks'              => Task::whereIn('status', ['pending', 'in_progress'])->count(),
            'follow_up_due'      => Lead::whereNotIn('status', ['converted', 'lost'])
                                        ->whereNotNull('follow_up_date')
                                        ->whereDate('follow_up_date', '<=', now()->toDateString())
                                        ->count(),
            'closing_this_week'  => Deal::whereNotIn('stage', ['won', 'lost'])
                                        ->whereNotNull('expected_closing_date')
                                        ->whereDate('expected_closing_date', '>=', now()->toDateString())
                                        ->whereDate('expected_closing_date', '<=', now()->addDays(7)->toDateString())
                                        ->count(),
        ];

        return Inertia::render('Core/Dashboard', [
            'stats' => $stats,
        ]);
    }
}
