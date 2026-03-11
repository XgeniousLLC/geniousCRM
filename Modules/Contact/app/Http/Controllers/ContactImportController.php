<?php

/**
 * ContactImportController
 *
 * Handles CSV import of contacts into the Mini CRM.
 * Three-step flow:
 *   1. GET  /contacts/import         — show upload form
 *   2. POST /contacts/import/preview — parse CSV, store in session, show mapping + preview
 *   3. POST /contacts/import/process — insert rows using the column mapping
 *
 * Module  : Contact
 * Package : Modules\Contact\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Contact\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Contact\Models\Contact;

class ContactImportController extends Controller
{
    /** CRM fields the user can map CSV columns to. */
    private const FIELDS = [
        'first_name' => 'First Name *',
        'last_name'  => 'Last Name',
        'email'      => 'Email',
        'phone'      => 'Phone',
        'company'    => 'Company',
        'notes'      => 'Notes',
    ];

    /**
     * Show the CSV import form.
     * If a preview is in the session, pass it through so the mapping step renders.
     */
    public function show(): Response
    {
        return Inertia::render('Contact/ContactImport', [
            'fields'  => self::FIELDS,
            'preview' => session('contact_import_preview'),
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

        $path    = $request->file('file')->store('imports/contacts');
        $full    = storage_path("app/{$path}");
        $handle  = fopen($full, 'r');
        $headers = fgetcsv($handle);

        $sample = [];
        while (($row = fgetcsv($handle)) !== false && count($sample) < 5) {
            $sample[] = $row;
        }
        fclose($handle);

        session([
            'contact_import_preview' => [
                'headers'  => $headers,
                'sample'   => $sample,
            ],
            'contact_import_path' => $path,
        ]);

        return back();
    }

    /**
     * Process the confirmed import using the column mapping provided by the user.
     * Skips rows with a missing first_name, or a duplicate email.
     * Inserts in chunks of 100 to keep memory usage low.
     */
    public function process(Request $request): RedirectResponse
    {
        $request->validate([
            'mapping'              => 'required|array',
            'mapping.first_name'   => 'required|numeric',
        ]);

        $mapping = $request->input('mapping');          // field → column index
        $path    = session('contact_import_path');

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

            // Skip if first_name missing
            if (empty($record['first_name'])) {
                $skipped++;
                continue;
            }

            // Skip duplicate email
            if (!empty($record['email']) && Contact::where('email', $record['email'])->exists()) {
                $skipped++;
                continue;
            }

            $buffer[] = array_merge($record, [
                'created_by' => Auth::id(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if (count($buffer) >= 100) {
                Contact::insert($buffer);
                $imported += count($buffer);
                $buffer = [];
            }
        }

        fclose($handle);

        if (!empty($buffer)) {
            Contact::insert($buffer);
            $imported += count($buffer);
        }

        session()->forget(['contact_import_preview', 'contact_import_path']);

        return redirect('/contacts')->with('success', "{$imported} contact(s) imported, {$skipped} skipped.");
    }
}
