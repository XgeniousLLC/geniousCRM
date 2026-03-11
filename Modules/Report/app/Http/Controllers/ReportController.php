<?php

/**
 * ReportController
 *
 * Provides all reporting data for the Report module.
 * Access is restricted to admin and manager roles via route middleware.
 *
 * Module  : Report
 * Package : Modules\Report\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Report\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Contact\Models\Contact;
use Modules\Deal\Models\Deal;
use Modules\Lead\Models\Lead;
use Modules\Task\Models\Task;

class ReportController extends Controller
{
    /**
     * Render the main report dashboard.
     * Returns summary stats, deals by stage, lead conversion rate,
     * and pipeline value grouped by stage.
     * Supports optional date-range filtering via `from` and `to` query params.
     */
    public function dashboard(Request $request): Response
    {
        $from = $request->from ? \Carbon\Carbon::parse($request->from)->startOfDay() : null;
        $to   = $request->to   ? \Carbon\Carbon::parse($request->to)->endOfDay()     : null;

        $dateFilter = function ($query) use ($from, $to) {
            if ($from) $query->where('created_at', '>=', $from);
            if ($to)   $query->where('created_at', '<=', $to);
        };

        // ── Summary stats ──────────────────────────────────────────
        $totalContacts = Contact::when(true, $dateFilter)->count();
        $totalLeads    = Lead::when(true, $dateFilter)->count();
        $totalDeals    = Deal::when(true, $dateFilter)->count();
        $openTasks     = Task::whereIn('status', ['pending', 'in_progress'])->count();

        // ── Deals by stage ─────────────────────────────────────────
        $stagesConfig  = Deal::$stages;
        $dealsByStage  = Deal::when(true, $dateFilter)
            ->select('stage', DB::raw('count(*) as count'), DB::raw('COALESCE(SUM(value),0) as total_value'))
            ->groupBy('stage')
            ->get()
            ->keyBy('stage');

        $stageData = collect($stagesConfig)->map(function ($meta, $stage) use ($dealsByStage) {
            $row = $dealsByStage->get($stage);
            return [
                'stage'       => $stage,
                'label'       => $meta['label'],
                'color'       => $meta['color'],
                'count'       => $row ? (int) $row->count : 0,
                'total_value' => $row ? (float) $row->total_value : 0,
            ];
        })->values();

        // ── Lead conversion ────────────────────────────────────────
        $leadsTotal     = Lead::when(true, $dateFilter)->count();
        $leadsConverted = Lead::when(true, $dateFilter)->where('status', 'converted')->count();
        $conversionRate = $leadsTotal > 0 ? round(($leadsConverted / $leadsTotal) * 100, 1) : 0;

        $leadsByStatus = Lead::when(true, $dateFilter)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn($r) => [$r->status => (int) $r->count]);

        // ── Leads by source ────────────────────────────────────────
        $leadsBySource = Lead::when(true, $dateFilter)
            ->whereNotNull('source')
            ->select('source', DB::raw('count(*) as count'))
            ->groupBy('source')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => ['source' => $r->source, 'count' => (int) $r->count]);

        // ── Pipeline value summary ─────────────────────────────────
        $pipelineValue = Deal::when(true, $dateFilter)
            ->whereNotIn('stage', ['won', 'lost'])
            ->sum('value');

        $wonValue  = Deal::when(true, $dateFilter)->where('stage', 'won')->sum('value');
        $lostValue = Deal::when(true, $dateFilter)->where('stage', 'lost')->sum('value');

        // Weighted pipeline: SUM(value * probability / 100) for open deals
        $weightedPipeline = Deal::when(true, $dateFilter)
            ->whereNotIn('stage', ['won', 'lost'])
            ->selectRaw('SUM(value * probability / 100) as weighted')
            ->value('weighted') ?? 0;

        return Inertia::render('Report/ReportDashboard', [
            'stats' => [
                'contacts'         => $totalContacts,
                'leads'            => $totalLeads,
                'deals'            => $totalDeals,
                'open_tasks'       => $openTasks,
                'pipeline_value'   => (float) $pipelineValue,
                'won_value'        => (float) $wonValue,
                'lost_value'       => (float) $lostValue,
                'weighted_pipeline' => (float) $weightedPipeline,
            ],
            'stageData'      => $stageData,
            'leadsByStatus'  => $leadsByStatus,
            'leadsBySource'  => $leadsBySource,
            'conversionRate' => $conversionRate,
            'leadsTotal'     => $leadsTotal,
            'leadsConverted' => $leadsConverted,
            'filters'        => [
                'from' => $request->from,
                'to'   => $request->to,
            ],
        ]);
    }

    /**
     * Export a CSV file for contacts or leads.
     * Accepts `type` = "contacts" | "leads".
     */
    public function export(Request $request, string $type)
    {
        if ($type === 'contacts') {
            $filename = 'contacts_' . now()->format('Y-m-d') . '.csv';
            $headers  = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Tags', 'Created At'];
            $rows     = Contact::with('tags')->orderBy('id')->get()->map(fn($c) => [
                $c->id,
                $c->first_name,
                $c->last_name,
                $c->email ?? '',
                $c->phone ?? '',
                $c->company ?? '',
                $c->tags->pluck('name')->join(', '),
                $c->created_at->format('Y-m-d'),
            ]);
        } elseif ($type === 'leads') {
            $filename = 'leads_' . now()->format('Y-m-d') . '.csv';
            $headers  = ['ID', 'Name', 'Email', 'Phone', 'Source', 'Status', 'Assigned To', 'Created At'];
            $rows     = Lead::with('assignedUser')->orderBy('id')->get()->map(fn($l) => [
                $l->id,
                $l->name,
                $l->email ?? '',
                $l->phone ?? '',
                $l->source ?? '',
                $l->status,
                $l->assignedUser?->name ?? '',
                $l->created_at->format('Y-m-d'),
            ]);
        } else {
            abort(404);
        }

        $callback = function () use ($headers, $rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $headers);
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
