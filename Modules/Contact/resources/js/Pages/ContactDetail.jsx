/**
 * ContactDetail
 *
 * Full detail page for a single CRM contact.
 * Shows contact info, tags, inline notes management, and a live activity timeline.
 *
 * Module : Contact
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';
import TaskPanel from '@modules/Task/resources/js/Components/TaskPanel';

const STAGE_LABELS = {
    new_deal: 'New Deal', proposal_sent: 'Proposal Sent',
    negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
};
const STAGE_COLORS = {
    new_deal: '#6366f1', proposal_sent: '#f59e0b',
    negotiation: '#3b82f6', won: '#10b981', lost: '#ef4444',
};

export default function ContactDetail({ contact, activities, allTags, salesUsers = [], tasks = [], taskStatuses = {}, deals = [] }) {
    const [showEdit, setShowEdit] = useState(false);

    return (
        <>
            <Head title={`Contact — ${contact.first_name} ${contact.last_name}`} />

            <div className="space-y-5 max-w-5xl mx-auto">

                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Link href="/contacts" className="text-sm text-muted-foreground hover:text-foreground transition">
                            ← Contacts
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <h1 className="text-lg font-semibold text-foreground">
                            {contact.first_name} {contact.last_name}
                        </h1>
                        {contact.company && (
                            <span className="text-sm text-muted-foreground">{contact.company}</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowEdit(true)}
                            className="px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-sidebar-accent transition"
                        >
                            Edit
                        </button>
                        <DeleteBtn contact={contact} />
                    </div>
                </div>

                {/* ── Two-column body ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Left: info + notes */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Info card */}
                        <section className="bg-card border border-border rounded-lg p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoRow label="Email"   value={contact.email} />
                            <InfoRow label="Phone"   value={contact.phone} />
                            <InfoRow label="Company" value={contact.company} />
                            <InfoRow label="Created By" value={contact.created_by?.name} />
                            <InfoRow label="Created" value={new Date(contact.created_at).toLocaleDateString()} />

                            {contact.tags?.length > 0 && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-muted-foreground mb-1.5">Tags</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {contact.tags.map((t) => (
                                            <span
                                                key={t.id}
                                                className="px-2 py-0.5 rounded text-xs text-white"
                                                style={{ backgroundColor: t.color }}
                                            >
                                                {t.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {contact.notes && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                    <p className="text-sm text-foreground whitespace-pre-wrap">{contact.notes}</p>
                                </div>
                            )}
                        </section>

                        {/* Notes */}
                        <NotesSection contact={contact} />

                        {/* Linked Deals */}
                        {deals.length > 0 && <DealsPanel deals={deals} />}

                        {/* Tasks */}
                        <TaskPanel
                            tasks={tasks}
                            entityType="Contact"
                            entityId={contact.id}
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
                <EditModal contact={contact} allTags={allTags} onClose={() => setShowEdit(false)} />
            )}
        </>
    );
}

ContactDetail.layout = (page) => <AppLayout>{page}</AppLayout>;

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
function NotesSection({ contact }) {
    const { data, setData, post, processing, reset } = useForm({ body: '' });

    const submit = (e) => {
        e.preventDefault();
        post(`/contacts/${contact.id}/notes`, { onSuccess: () => reset() });
    };

    return (
        <section className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Notes</h2>
            </div>

            <div className="p-5 space-y-3">
                {contact.contact_notes?.length === 0 && (
                    <p className="text-sm text-muted-foreground">No notes yet.</p>
                )}
                {contact.contact_notes?.map((n) => (
                    <div key={n.id} className="bg-muted/40 rounded-md p-3 text-sm">
                        <p className="text-foreground whitespace-pre-wrap">{n.body}</p>
                        <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-muted-foreground">{n.author?.name ?? 'Unknown'}</span>
                            <button
                                onClick={() => router.delete(`/contacts/${contact.id}/notes/${n.id}`)}
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

/* ── Deals Panel ── */
function DealsPanel({ deals }) {
    return (
        <section className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Linked Deals ({deals.length})</h2>
            </div>
            <ul className="divide-y divide-border">
                {deals.map((d) => (
                    <li key={d.id} className="px-5 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <a href={`/deals/${d.id}`} className="text-sm font-medium text-foreground hover:underline truncate block">
                                {d.title}
                            </a>
                            {d.assigned_user && (
                                <p className="text-xs text-muted-foreground">{d.assigned_user.name}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {d.value != null && (
                                <span className="text-xs text-muted-foreground">${Number(d.value).toLocaleString()}</span>
                            )}
                            <span
                                className="px-2 py-0.5 rounded-full text-xs text-white"
                                style={{ backgroundColor: STAGE_COLORS[d.stage] ?? '#94a3b8' }}
                            >
                                {STAGE_LABELS[d.stage] ?? d.stage}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

/* ── Delete button ── */
function DeleteBtn({ contact }) {
    const { delete: destroy, processing } = useForm();
    const name = `${contact.first_name} ${contact.last_name}`;
    return (
        <button
            onClick={() => confirm(`Delete ${name}?`) && destroy(`/contacts/${contact.id}`, { onSuccess: () => router.visit('/contacts') })}
            disabled={processing}
            className="px-3 py-1.5 text-sm border border-destructive/40 rounded-md text-destructive hover:bg-destructive/5 disabled:opacity-50 transition"
        >
            Delete
        </button>
    );
}

/* ── Edit Modal ── */
function EditModal({ contact, allTags, onClose }) {
    const { data, setData, patch, processing, errors } = useForm({
        first_name: contact.first_name ?? '',
        last_name:  contact.last_name  ?? '',
        email:      contact.email      ?? '',
        phone:      contact.phone      ?? '',
        company:    contact.company    ?? '',
        notes:      contact.notes      ?? '',
        tags:       contact.tags?.map((t) => t.id) ?? [],
    });

    const toggleTag = (id) =>
        setData('tags', data.tags.includes(id) ? data.tags.filter((t) => t !== id) : [...data.tags, id]);

    const submit = (e) => {
        e.preventDefault();
        patch(`/contacts/${contact.id}`, { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Edit Contact</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <F label="First name" error={errors.first_name}>
                            <input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className={inp()} />
                        </F>
                        <F label="Last name" error={errors.last_name}>
                            <input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className={inp()} />
                        </F>
                    </div>
                    <F label="Email" error={errors.email}>
                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inp()} />
                    </F>
                    <div className="grid grid-cols-2 gap-4">
                        <F label="Phone" error={errors.phone}>
                            <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className={inp()} />
                        </F>
                        <F label="Company" error={errors.company}>
                            <input value={data.company} onChange={(e) => setData('company', e.target.value)} className={inp()} />
                        </F>
                    </div>
                    <F label="Notes" error={errors.notes}>
                        <textarea rows={3} value={data.notes} onChange={(e) => setData('notes', e.target.value)} className={inp()} />
                    </F>
                    {allTags.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-foreground mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => toggleTag(t.id)}
                                        className={`px-2 py-0.5 rounded text-xs text-white ring-2 transition ${data.tags.includes(t.id) ? 'ring-primary' : 'ring-transparent'}`}
                                        style={{ backgroundColor: t.color }}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
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
