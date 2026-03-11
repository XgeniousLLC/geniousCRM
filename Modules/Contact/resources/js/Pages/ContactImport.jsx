/**
 * ContactImport
 *
 * Three-step CSV import wizard for contacts.
 * Step 1: Upload CSV file.
 * Step 2: Map CSV columns to CRM fields + preview first 5 rows.
 * Step 3: Confirm and process the import.
 *
 * Module : Contact
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

export default function ContactImport({ fields, preview }) {
    return (
        <>
            <Head title="Import Contacts" />
            <div className="space-y-6 max-w-3xl">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Import Contacts</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Upload a CSV file to bulk-import contacts into the CRM.
                    </p>
                </div>

                {!preview ? (
                    <UploadStep />
                ) : (
                    <MappingStep preview={preview} fields={fields} />
                )}
            </div>
        </>
    );
}

ContactImport.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ── Step 1: Upload ── */
function UploadStep() {
    const { data, setData, post, processing, errors } = useForm({ file: null });

    const submit = (e) => {
        e.preventDefault();
        post('/contacts/import/preview', {
            forceFormData: true,
        });
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-foreground">Step 1 — Upload CSV</h2>
            <p className="text-sm text-muted-foreground">
                The file must be a <code className="bg-muted px-1 rounded text-xs">.csv</code> or <code className="bg-muted px-1 rounded text-xs">.txt</code> file with comma-separated values. Max size: 5 MB.
            </p>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">CSV File</label>
                    <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={(e) => setData('file', e.target.files[0])}
                        className="block w-full text-sm text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-border file:text-sm file:bg-muted file:text-foreground hover:file:bg-sidebar-accent transition"
                    />
                    {errors.file && <p className="text-xs text-destructive mt-1">{errors.file}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing || !data.file}
                    className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition"
                >
                    {processing ? 'Uploading…' : 'Upload & Preview'}
                </button>
            </form>
        </div>
    );
}

/* ── Step 2: Column mapping + preview ── */
function MappingStep({ preview, fields }) {
    const { headers, sample } = preview;

    const initialMapping = Object.fromEntries(
        Object.keys(fields).map((field) => {
            // Auto-match by lowercased header name
            const idx = headers.findIndex(
                (h) => h.toLowerCase().replace(/\s+/g, '_') === field.toLowerCase()
            );
            return [field, idx >= 0 ? String(idx) : ''];
        })
    );

    const { data, setData, post, processing, errors } = useForm({ mapping: initialMapping });

    const submit = (e) => {
        e.preventDefault();
        post('/contacts/import/process');
    };

    return (
        <div className="space-y-6">
            {/* Mapping table */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="font-medium text-foreground">Step 2 — Map Columns</h2>
                <p className="text-sm text-muted-foreground">
                    Match each CRM field to the corresponding CSV column. Fields marked <span className="text-destructive">*</span> are required.
                </p>

                <div className="space-y-3">
                    {Object.entries(fields).map(([field, label]) => (
                        <div key={field} className="flex items-center gap-4">
                            <label className="w-48 text-sm font-medium text-foreground shrink-0">{label}</label>
                            <select
                                value={data.mapping[field] ?? ''}
                                onChange={(e) => setData('mapping', { ...data.mapping, [field]: e.target.value })}
                                className="flex-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">— Skip —</option>
                                {headers.map((h, i) => (
                                    <option key={i} value={String(i)}>
                                        Col {i + 1}: {h}
                                    </option>
                                ))}
                            </select>
                            {errors[`mapping.${field}`] && (
                                <p className="text-xs text-destructive">{errors[`mapping.${field}`]}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview rows */}
            {sample.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                    <h2 className="font-medium text-foreground">Preview (first {sample.length} rows)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-muted/50">
                                    {headers.map((h, i) => (
                                        <th key={i} className="text-left px-3 py-2 font-medium text-muted-foreground border border-border">
                                            {h || `Col ${i + 1}`}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sample.map((row, ri) => (
                                    <tr key={ri} className="even:bg-muted/20">
                                        {row.map((cell, ci) => (
                                            <td key={ci} className="px-3 py-1.5 border border-border text-foreground">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <a
                    href="/contacts/import/form"
                    className="px-4 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-sidebar-accent transition"
                >
                    Start Over
                </a>
                <button
                    onClick={submit}
                    disabled={processing}
                    className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition"
                >
                    {processing ? 'Importing…' : 'Confirm Import'}
                </button>
            </div>
        </div>
    );
}
