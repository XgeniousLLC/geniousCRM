<?php

/**
 * LeadImportController
 *
 * Handles CSV import of leads into the Mini CRM.
 * Three-step flow:
 *   1. GET  /leads/import         — show upload form
 *   2. POST /leads/import/preview — parse CSV, store in session, show mapping + preview
 *   3. POST /leads/import/process — insert rows using the column mapping
 *
 * Module  : Lead
 * Package : Modules\Lead\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Lead\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Lead\Models\Lead;

class LeadImportController extends Controller
{
    /** CRM fields the user can map CSV columns to. */
    private const FIELDS = [
        'name'   => 'Name *',
        'email'  => 'Email',
        'phone'  => 'Phone',
        'source' => 'Source',
        'status' => 'Status (new/contacted/qualified/lost)',
        'notes'  => 'Notes',
    ];

    /** Valid status values accepted during import. */
    private const VALID_STATUSES = ['new', 'contacted', 'qualified', 'lost'];

    /**
     * Show the CSV import form.
     * If a preview is in the session, pass it through so the mapping step renders.
     */
    public function show(): Response
    {
        return Inertia::render('Lead/LeadImport', [
            'fields'  => self::FIELDS,
            'preview' => session('lead_import_preview'),
        ]);
    }

    /**
     * Parse the uploaded CSV, store parsed data in the session,
     * and redirect back so the mapping + preview table renders.
     */
    public function preview(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $path    = $request->file('file')->store('imports/leads');
        $full    = storage_path("app/{$path}");
        $handle  = fopen($full, 'r');
        $headers = fgetcsv($handle);

        $sample = [];
        while (($row = fgetcsv($handle)) !== false && count($sample) < 5) {
            $sample[] = $row;
        }
        fclose($handle);

        session([
            'lead_import_preview' => [
                'headers' => $headers,
                'sample'  => $sample,
            ],
            'lead_import_path' => $path,
        ]);

        return back();
    }

    /**
     * Process the confirmed import using the column mapping provided by the user.
     * Skips rows with a missing name. Defaults status to "new" if invalid.
     * Inserts in chunks of 100 to keep memory usage low.
     */
    public function process(Request $request): RedirectResponse
    {
        $request->validate([
            'mapping'        => 'required|array',
            'mapping.name'   => 'required|numeric',
        ]);

        $mapping = $request->input('mapping');
        $path    = session('lead_import_path');

        if (!$path || !file_exists(storage_path("app/{$path}"))) {
            return back()->with('error', 'Import session expired. Please re-upload the file.');
        }

        $handle   = fopen(storage_path("app/{$path}"), 'r');
        fgetcsv($handle); // skip header row

        $imported = 0;
        $skipped  = 0;
        $buffer   = [];

        while (($row = fgetcsv($handle)) !== false) {
            $record = [];
            foreach ($mapping as $field => $colIndex) {
                if ($colIndex !== '' && isset($row[(int) $colIndex])) {
                    $record[$field] = trim($row[(int) $colIndex]);
                }
            }

            if (empty($record['name'])) {
                $skipped++;
                continue;
            }

            // Normalise status — fall back to "new" if not a known value
            if (empty($record['status']) || !in_array($record['status'], self::VALID_STATUSES)) {
                $record['status'] = 'new';
            }

            $buffer[] = array_merge($record, [
                'created_by' => Auth::id(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if (count($buffer) >= 100) {
                Lead::insert($buffer);
                $imported += count($buffer);
                $buffer = [];
            }
        }

        fclose($handle);

        if (!empty($buffer)) {
            Lead::insert($buffer);
            $imported += count($buffer);
        }

        session()->forget(['lead_import_preview', 'lead_import_path']);

        return redirect('/leads')->with('success', "{$imported} lead(s) imported, {$skipped} skipped.");
    }
}
