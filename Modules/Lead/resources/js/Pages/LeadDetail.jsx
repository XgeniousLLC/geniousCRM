/**
 * LeadDetail
 *
 * Full detail page for a single CRM lead.
 * Shows lead info, inline notes management, and a live activity timeline.
 * Edit/delete actions open the same modal pattern as the list page.
 *
 * Module : Lead
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';
import TaskPanel from '@modules/Task/resources/js/Components/TaskPanel';

const STATUS_LABELS = {
    new: 'New', contacted: 'Contacted', qualified: 'Qualified',
    lost: 'Lost', converted: 'Converted',
};

export default function LeadDetail({ lead, activities, statuses, salesUsers, tasks = [], taskStatuses = {} }) {
    const [showEdit, setShowEdit] = useState(false);

    const color = statuses[lead.status] ?? '#94a3b8';

    return (
        <>
            <Head title={`Lead — ${lead.name}`} />

            <div className="space-y-5 max-w-5xl mx-auto">

                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Link href="/leads" className="text-sm text-muted-foreground hover:text-foreground transition">
                            ← Leads
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <h1 className="text-lg font-semibold text-foreground">{lead.name}</h1>
                        <span
                            className="px-2 py-0.5 rounded-full text-xs text-white font-medium"
                            style={{ backgroundColor: color }}
                        >
                            {STATUS_LABELS[lead.status] ?? lead.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowEdit(true)}
                            className="px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-sidebar-accent transition"
                        >
                            Edit
                        </button>
                        {lead.status !== 'converted' && (
                            <ConvertBtn lead={lead} />
                        )}
                        <DeleteBtn lead={lead} />
                    </div>
                </div>

                {/* ── Two-column body ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Left: info + notes */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Info card */}
                        <section className="bg-card border border-border rounded-lg p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoRow label="Email"       value={lead.email} />
                            <InfoRow label="Phone"       value={lead.phone} />
                            <InfoRow label="Source"      value={lead.source} />
                            <InfoRow label="Assigned To" value={lead.assigned_user?.name} />
                            <InfoRow label="Created By"  value={lead.created_by?.name} />
                            <InfoRow label="Created"     value={new Date(lead.created_at).toLocaleDateString()} />
                            {lead.notes && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                    <p className="text-sm text-foreground whitespace-pre-wrap">{lead.notes}</p>
                                </div>
                            )}
                        </section>

                        {/* Notes */}
                        <NotesSection lead={lead} />

                        {/* Tasks */}
                        <TaskPanel
                            tasks={tasks}
                            entityType="Lead"
                            entityId={lead.id}
                            salesUsers={salesUsers}
                            statuses={taskStatuses}
                        />
                    </div>

                    {/* Right: activity feed */}
                    <div className="lg:col-span-1">
                        <ActivityPanel activities={activities} />
                    </div>
                </div>
            </div>

            {showEdit && (
                <EditModal lead={lead} salesUsers={salesUsers} onClose={() => setShowEdit(false)} />
            )}
        </>
    );
}

LeadDetail.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ── Info row ── */
function InfoRow({ label, value }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="text-sm text-foreground">{value ?? <span className="italic text-muted-foreground">—</span>}</p>
        </div>
    );
}

/* ── Notes Section ── */
function NotesSection({ lead }) {
    const { data, setData, post, processing, reset } = useForm({ body: '' });

    const submit = (e) => {
        e.preventDefault();
        post(`/leads/${lead.id}/notes`, { onSuccess: () => reset() });
    };

    return (
        <section className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Notes</h2>
            </div>

            <div className="p-5 space-y-3">
                {lead.lead_notes?.length === 0 && (
                    <p className="text-sm text-muted-foreground">No notes yet.</p>
                )}
                {lead.lead_notes?.map((n) => (
                    <div key={n.id} className="bg-muted/40 rounded-md p-3 text-sm">
                        <p className="text-foreground whitespace-pre-wrap">{n.body}</p>
                        <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-muted-foreground">{n.author?.name ?? 'Unknown'}</span>
                            <button
                                onClick={() => router.delete(`/leads/${lead.id}/notes/${n.id}`)}
                                className="text-xs text-destructive hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={submit} className="px-5 pb-5 space-y-2">
                <textarea
                    rows={3}
                    value={data.body}
                    onChange={(e) => setData('body', e.target.value)}
                    placeholder="Add a note…"
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <button
                    type="submit"
                    disabled={processing || !data.body.trim()}
                    className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition"
                >
                    Add Note
                </button>
            </form>
        </section>
    );
}

/* ── Activity Panel ── */
function ActivityPanel({ activities }) {
    return (
        <section className="bg-card border border-border rounded-lg overflow-hidden h-fit">
            <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Activity</h2>
            </div>

            {activities.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">No activity yet.</p>
            ) : (
                <ul className="divide-y divide-border">
                    {activities.map((a) => (
                        <li key={a.id} className="px-4 py-3 flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm text-foreground font-medium">{a.action_label}</p>
                                {a.description && (
                                    <p className="text-xs text-muted-foreground">{a.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {a.user?.name ?? 'System'} · {a.created_at}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

/* ── Convert button ── */
function ConvertBtn({ lead }) {
    const { post, processing } = useForm();
    return (
        <button
            onClick={() => confirm(`Convert "${lead.name}" to a contact?`) && post(`/leads/${lead.id}/convert`)}
            disabled={processing}
            className="px-3 py-1.5 text-sm border border-border rounded-md text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 transition"
        >
            Convert
        </button>
    );
}

/* ── Delete button ── */
function DeleteBtn({ lead }) {
    const { delete: destroy, processing } = useForm();
    return (
        <button
            onClick={() => confirm(`Delete lead "${lead.name}"?`) && destroy(`/leads/${lead.id}`, { onSuccess: () => router.visit('/leads') })}
            disabled={processing}
            className="px-3 py-1.5 text-sm border border-destructive/40 rounded-md text-destructive hover:bg-destructive/5 disabled:opacity-50 transition"
        >
            Delete
        </button>
    );
}

/* ── Edit Modal ── */
function EditModal({ lead, salesUsers, onClose }) {
    const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'lost', 'converted'];

    const { data, setData, patch, processing, errors } = useForm({
        name:             lead.name             ?? '',
        email:            lead.email            ?? '',
        phone:            lead.phone            ?? '',
        source:           lead.source           ?? '',
        assigned_user_id: lead.assigned_user_id ?? '',
        status:           lead.status           ?? 'new',
        notes:            lead.notes            ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(`/leads/${lead.id}`, { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Edit Lead</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    <F label="Name" error={errors.name}>
                        <input value={data.name} onChange={(e) => setData('name', e.target.value)} className={inp()} />
                    </F>
                    <div className="grid grid-cols-2 gap-4">
                        <F label="Email" error={errors.email}>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inp()} />
                        </F>
                        <F label="Phone" error={errors.phone}>
                            <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className={inp()} />
                        </F>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <F label="Source" error={errors.source}>
                            <input value={data.source} onChange={(e) => setData('source', e.target.value)} className={inp()} />
                        </F>
                        <F label="Status" error={errors.status}>
                            <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={inp()}>
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                ))}
                            </select>
                        </F>
                    </div>
                    <F label="Assign To" error={errors.assigned_user_id}>
                        <select value={data.assigned_user_id} onChange={(e) => setData('assigned_user_id', e.target.value)} className={inp()}>
                            <option value="">— Unassigned —</option>
                            {salesUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </F>
                    <F label="Notes" error={errors.notes}>
                        <textarea rows={3} value={data.notes} onChange={(e) => setData('notes', e.target.value)} className={inp()} />
                    </F>
                    <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-sidebar-accent transition">Cancel</button>
                        <button type="submit" disabled={processing} className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition">Update</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function F({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
    );
}

function inp() {
    return 'w-full px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition';
}
