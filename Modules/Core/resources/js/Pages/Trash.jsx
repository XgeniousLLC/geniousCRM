/**
 * Trash
 *
 * Unified trash management page for Mini CRM.
 * Displays soft-deleted Contacts, Leads, and Deals in three tabs.
 * Restore and permanent-delete actions post to each module's own routes.
 *
 * Module : Core
 * Author : Xgenious (https://xgenious.com)
 */

import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../Components/Layout/AppLayout';

const TABS = ['contacts', 'leads', 'deals'];

const STATUS_COLORS = {
    new:       'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-green-100 text-green-700',
    lost:      'bg-red-100 text-red-700',
    converted: 'bg-purple-100 text-purple-700',
};

export default function Trash({ contacts, leads, deals }) {
    const [tab, setTab] = useState('contacts');

    const counts = { contacts: contacts.length, leads: leads.length, deals: deals.length };

    return (
        <>
            <Head title="Trash" />
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-semibold text-foreground">Trash</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Restore deleted records or permanently remove them.
                    </p>
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-1 border-b border-border">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition capitalize ${
                                tab === t
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t}
                            {counts[t] > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                    tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}>
                                    {counts[t]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab panels */}
                {tab === 'contacts' && (
                    <ContactsTab contacts={contacts} />
                )}
                {tab === 'leads' && (
                    <LeadsTab leads={leads} />
                )}
                {tab === 'deals' && (
                    <DealsTab deals={deals} />
                )}
            </div>
        </>
    );
}

Trash.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ── Contacts tab ── */
function ContactsTab({ contacts }) {
    if (contacts.length === 0) return <EmptyTrash entity="contacts" />;

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-muted/40">
                    <tr>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Company</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Deleted</th>
                        <th className="px-4 py-3" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {contacts.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/20 transition">
                            <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.email}</td>
                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.company || '—'}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{c.deleted_at}</td>
                            <td className="px-4 py-3">
                                <Actions
                                    restoreUrl={`/contacts/${c.id}/restore`}
                                    deleteUrl={`/contacts/${c.id}/force`}
                                    label={c.name}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ── Leads tab ── */
function LeadsTab({ leads }) {
    if (leads.length === 0) return <EmptyTrash entity="leads" />;

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-muted/40">
                    <tr>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Deleted</th>
                        <th className="px-4 py-3" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {leads.map((l) => (
                        <tr key={l.id} className="hover:bg-muted/20 transition">
                            <td className="px-4 py-3 font-medium text-foreground">{l.name}</td>
                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{l.email}</td>
                            <td className="px-4 py-3 hidden md:table-cell">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[l.status] ?? 'bg-muted text-muted-foreground'}`}>
                                    {l.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{l.deleted_at}</td>
                            <td className="px-4 py-3">
                                <Actions
                                    restoreUrl={`/leads/${l.id}/restore`}
                                    deleteUrl={`/leads/${l.id}/force`}
                                    label={l.name}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ── Deals tab ── */
function DealsTab({ deals }) {
    if (deals.length === 0) return <EmptyTrash entity="deals" />;

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-muted/40">
                    <tr>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Value</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Stage</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Deleted</th>
                        <th className="px-4 py-3" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {deals.map((d) => (
                        <tr key={d.id} className="hover:bg-muted/20 transition">
                            <td className="px-4 py-3 font-medium text-foreground">{d.title}</td>
                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                                ${Number(d.value).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                                <span
                                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: d.stage_color }}
                                >
                                    {d.stage_label}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{d.deleted_at}</td>
                            <td className="px-4 py-3">
                                <Actions
                                    restoreUrl={`/deals/${d.id}/restore`}
                                    deleteUrl={`/deals/${d.id}/force`}
                                    label={d.title}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ── Shared action buttons (restore + force delete) ── */
function Actions({ restoreUrl, deleteUrl, label }) {
    return (
        <div className="flex items-center gap-3 justify-end">
            <RestoreButton url={restoreUrl} />
            <ForceDeleteButton url={deleteUrl} label={label} />
        </div>
    );
}

function RestoreButton({ url }) {
    const { patch, processing } = useForm();
    return (
        <button
            onClick={() => patch(url)}
            disabled={processing}
            className="text-xs text-emerald-600 hover:underline disabled:opacity-50"
        >
            Restore
        </button>
    );
}

function ForceDeleteButton({ url, label }) {
    const { delete: destroy, processing } = useForm();
    const handle = () => {
        if (!confirm(`Permanently delete "${label}"? This cannot be undone.`)) return;
        destroy(url);
    };
    return (
        <button
            onClick={handle}
            disabled={processing}
            className="text-xs text-destructive hover:underline disabled:opacity-50"
        >
            Delete permanently
        </button>
    );
}

/* ── Empty state ── */
function EmptyTrash({ entity }) {
    return (
        <div className="border border-border rounded-lg py-16 text-center">
            <svg className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <p className="text-sm text-muted-foreground">No deleted {entity} found.</p>
        </div>
    );
}
