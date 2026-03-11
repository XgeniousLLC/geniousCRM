/**
 * LeadList
 *
 * Displays a paginated table of CRM leads with status badges.
 * Supports search by name/email, filter by status, inline create/edit modal,
 * notes side-drawer, and one-click "Convert to Contact" action.
 *
 * Module : Lead
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

const STATUS_LABELS = {
    new:       'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    lost:      'Lost',
    converted: 'Converted',
};

export default function LeadList({ leads, salesUsers, statuses, sources, tags, filters }) {
    const [search, setSearch]         = useState(filters.search ?? '');
    const [statusFilter, setStatus]   = useState(filters.status ?? '');
    const [tagFilter, setTagFilter]   = useState(filters.tag    ?? '');
    const [sort, setSort]             = useState(filters.sort   ?? 'created_at');
    const [dir,  setDir]              = useState(filters.dir    ?? 'desc');
    const [showModal, setShowModal]   = useState(false);
    const [editing, setEditing]       = useState(null);
    const [noteTarget, setNoteTarget] = useState(null);
    const [selected, setSelected]     = useState([]);
    const [bulkAction, setBulkAction] = useState('');  // 'assign' | 'status'
    const [bulkAssignee, setBulkAssignee] = useState('');
    const [bulkStatus,   setBulkStatus]   = useState('');

    const applyFilters = (overrides = {}) => {
        setSelected([]);
        router.get('/leads', { search, status: statusFilter, tag: tagFilter, sort, dir, ...overrides }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (col) => {
        const newDir = sort === col && dir === 'asc' ? 'desc' : 'asc';
        setSort(col); setDir(newDir);
        applyFilters({ sort: col, dir: newDir });
    };

    const allIds   = leads.data.map((l) => l.id);
    const allCheck = allIds.length > 0 && allIds.every((id) => selected.includes(id));
    const toggleAll = () => setSelected(allCheck ? [] : allIds);
    const toggleOne = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    const bulkDelete = () => {
        if (!confirm(`Delete ${selected.length} lead(s)?`)) return;
        router.post('/leads/bulk-destroy', { ids: selected }, { onSuccess: () => setSelected([]) });
    };

    const bulkApplyAssign = () => {
        if (!bulkAssignee) return;
        router.post('/leads/bulk-assign', { ids: selected, assigned_user_id: Number(bulkAssignee) }, {
            onSuccess: () => { setSelected([]); setBulkAction(''); setBulkAssignee(''); },
        });
    };

    const bulkApplyStatus = () => {
        if (!bulkStatus) return;
        router.post('/leads/bulk-status', { ids: selected, status: bulkStatus }, {
            onSuccess: () => { setSelected([]); setBulkAction(''); setBulkStatus(''); },
        });
    };

    const openCreate = () => { setEditing(null); setShowModal(true); };
    const openEdit   = (l) => { setEditing(l);   setShowModal(true); };

    return (
        <>
            <Head title="Leads" />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-foreground">Leads</h1>
                    <div className="flex items-center gap-2">
                        <a
                            href="/leads/import/form"
                            className="px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-sidebar-accent transition"
                        >
                            Import CSV
                        </a>
                        <button
                            onClick={openCreate}
                            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
                        >
                            + Add Lead
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <input
                        type="text"
                        placeholder="Search name, email, phone…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                        className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-60"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                        className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All statuses</option>
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                    {tags.length > 0 && (
                        <select
                            value={tagFilter}
                            onChange={(e) => { setTagFilter(e.target.value); applyFilters({ tag: e.target.value }); }}
                            className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">All tags</option>
                            {tags.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    )}
                    <button
                        onClick={() => applyFilters({ search })}
                        className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground hover:bg-sidebar-accent transition"
                    >
                        Search
                    </button>
                </div>

                {/* Bulk action toolbar */}
                {selected.length > 0 && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg text-sm flex-wrap">
                        <span className="font-medium text-foreground">{selected.length} selected</span>
                        <div className="h-4 w-px bg-border" />
                        <button onClick={bulkDelete} className="text-destructive hover:underline">Delete</button>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setBulkAction(bulkAction === 'assign' ? '' : 'assign')}
                                className="text-foreground hover:underline"
                            >
                                Assign user
                            </button>
                            {bulkAction === 'assign' && (
                                <div className="flex gap-1 ml-1">
                                    <select
                                        value={bulkAssignee}
                                        onChange={(e) => setBulkAssignee(e.target.value)}
                                        className="text-sm border border-border rounded px-2 py-0.5 bg-background text-foreground"
                                    >
                                        <option value="">— pick user —</option>
                                        {salesUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    <button onClick={bulkApplyAssign} disabled={!bulkAssignee} className="px-2 py-0.5 text-sm bg-primary text-primary-foreground rounded disabled:opacity-50">Apply</button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setBulkAction(bulkAction === 'status' ? '' : 'status')}
                                className="text-foreground hover:underline"
                            >
                                Change status
                            </button>
                            {bulkAction === 'status' && (
                                <div className="flex gap-1 ml-1">
                                    <select
                                        value={bulkStatus}
                                        onChange={(e) => setBulkStatus(e.target.value)}
                                        className="text-sm border border-border rounded px-2 py-0.5 bg-background text-foreground"
                                    >
                                        <option value="">— pick status —</option>
                                        {Object.entries(STATUS_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                                    </select>
                                    <button onClick={bulkApplyStatus} disabled={!bulkStatus} className="px-2 py-0.5 text-sm bg-primary text-primary-foreground rounded disabled:opacity-50">Apply</button>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setSelected([])} className="ml-auto text-muted-foreground hover:text-foreground">✕ Clear</button>
                    </div>
                )}

                {/* Table */}
                <div className="rounded-lg border border-border overflow-hidden bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-4 py-2.5 w-8">
                                    <input type="checkbox" checked={allCheck} onChange={toggleAll} className="rounded border-border" />
                                </th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                                    <SortButton label="Name" col="name" sort={sort} dir={dir} onClick={handleSort} />
                                </th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Source</th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Assigned To</th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                                    <SortButton label="Status" col="status" sort={sort} dir={dir} onClick={handleSort} />
                                </th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden xl:table-cell">
                                    <SortButton label="Follow-up" col="follow_up_date" sort={sort} dir={dir} onClick={handleSort} />
                                </th>
                                <th className="px-4 py-2.5 w-40"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {leads.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-muted-foreground">
                                        No leads found.
                                    </td>
                                </tr>
                            ) : leads.data.map((lead) => (
                                <tr key={lead.id} className={`hover:bg-sidebar-accent/30 transition ${selected.includes(lead.id) ? 'bg-primary/5' : ''}`}>
                                    <td className="px-4 py-2.5">
                                        <input type="checkbox" checked={selected.includes(lead.id)} onChange={() => toggleOne(lead.id)} className="rounded border-border" />
                                    </td>
                                    <td className="px-4 py-2.5 font-medium text-foreground">
                                        <Link href={`/leads/${lead.id}`} className="hover:text-primary hover:underline transition">
                                            {lead.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">{lead.email ?? '—'}</td>
                                    <td className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell">{lead.source ?? '—'}</td>
                                    <td className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell">
                                        {lead.assigned_user?.name ?? <span className="italic">Unassigned</span>}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <StatusBadge status={lead.status} colors={statuses} />
                                    </td>
                                    <td className="px-4 py-2.5 hidden xl:table-cell">
                                        <FollowUpBadge date={lead.follow_up_date} status={lead.status} />
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2 justify-end flex-wrap">
                                            <button
                                                onClick={() => setNoteTarget(lead)}
                                                className="text-xs text-muted-foreground hover:text-foreground transition"
                                            >
                                                Notes
                                            </button>
                                            {lead.status !== 'converted' && (
                                                <ConvertButton lead={lead} />
                                            )}
                                            <button
                                                onClick={() => openEdit(lead)}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <DeleteButton lead={lead} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {leads.last_page > 1 && (
                    <div className="flex gap-1 flex-wrap">
                        {leads.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url || link.active}
                                onClick={() => link.url && router.get(link.url)}
                                className={`px-3 py-1 text-sm rounded border transition ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'border-border text-foreground hover:bg-sidebar-accent disabled:opacity-40'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <LeadModal
                    lead={editing}
                    salesUsers={salesUsers}
                    sources={sources}
                    tags={tags}
                    onClose={() => setShowModal(false)}
                />
            )}

            {noteTarget && (
                <NotesPanel
                    lead={noteTarget}
                    onClose={() => setNoteTarget(null)}
                />
            )}
        </>
    );
}

LeadList.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ── Sort button ── */
function SortButton({ label, col, sort, dir, onClick }) {
    const active = sort === col;
    return (
        <button
            onClick={() => onClick(col)}
            className={`flex items-center gap-0.5 hover:text-foreground transition ${active ? 'text-foreground' : ''}`}
        >
            {label}
            <span className="text-xs">{active ? (dir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>
        </button>
    );
}

/* ── Status badge ── */
function StatusBadge({ status, colors }) {
    const color = colors[status] ?? '#94a3b8';
    return (
        <span
            className="px-2 py-0.5 rounded-full text-xs text-white font-medium"
            style={{ backgroundColor: color }}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

/* ── Convert button ── */
function ConvertButton({ lead }) {
    const { post, processing } = useForm();

    const handle = () => {
        if (!confirm(`Convert "${lead.name}" to a contact?`)) return;
        post(`/leads/${lead.id}/convert`);
    };

    return (
        <button
            onClick={handle}
            disabled={processing}
            className="text-xs text-emerald-600 hover:underline disabled:opacity-50"
        >
            Convert
        </button>
    );
}

/* ── Delete button ── */
function DeleteButton({ lead }) {
    const { delete: destroy, processing } = useForm();

    const handle = () => {
        if (!confirm(`Delete lead "${lead.name}"?`)) return;
        destroy(`/leads/${lead.id}`);
    };

    return (
        <button
            onClick={handle}
            disabled={processing}
            className="text-xs text-destructive hover:underline disabled:opacity-50"
        >
            Delete
        </button>
    );
}

/* ── Create / Edit Modal ── */
function LeadModal({ lead, salesUsers, sources, tags, onClose }) {
    const { flash } = usePage().props;
    const duplicates = !lead ? (flash?.duplicates ?? null) : null;
    const isEdit = !!lead;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name:             lead?.name             ?? '',
        email:            lead?.email            ?? '',
        phone:            lead?.phone            ?? '',
        source:           lead?.source           ?? '',
        assigned_user_id: lead?.assigned_user_id ?? '',
        status:           lead?.status           ?? 'new',
        notes:            lead?.notes            ?? '',
        follow_up_date:   lead?.follow_up_date   ?? '',
        tags:             lead?.tags?.map((t) => t.id) ?? [],
    });

    const toggleTag = (id) => {
        setData('tags', data.tags.includes(id)
            ? data.tags.filter((t) => t !== id)
            : [...data.tags, id]
        );
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(`/leads/${lead.id}`, { onSuccess: onClose });
        } else {
            post('/leads', {
                preserveState: true,
                onSuccess: (page) => {
                    if (!page.props.flash?.duplicates) { reset(); onClose(); }
                },
            });
        }
    };

    const continueAnyway = () => {
        router.post('/leads', { ...data, force: true }, {
            preserveState: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">{isEdit ? 'Edit Lead' : 'New Lead'}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    {duplicates && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2">
                            <p className="text-xs font-semibold text-amber-800">Possible duplicates found:</p>
                            <ul className="space-y-1">
                                {duplicates.map((d) => (
                                    <li key={d.id} className="text-xs text-amber-700">
                                        {d.name}
                                        {d.email ? ` · ${d.email}` : ''}
                                        {d.phone ? ` · ${d.phone}` : ''}
                                    </li>
                                ))}
                            </ul>
                            <button
                                type="button"
                                onClick={continueAnyway}
                                className="text-xs font-medium text-amber-800 underline hover:text-amber-900 transition"
                            >
                                Create anyway →
                            </button>
                        </div>
                    )}

                    <Field label="Name" error={errors.name}>
                        <input value={data.name} onChange={(e) => setData('name', e.target.value)} className={inp()} />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Email" error={errors.email}>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inp()} />
                        </Field>
                        <Field label="Phone" error={errors.phone}>
                            <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className={inp()} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Source" error={errors.source}>
                            <select value={data.source} onChange={(e) => setData('source', e.target.value)} className={inp()}>
                                <option value="">— Select source —</option>
                                {sources.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Status" error={errors.status}>
                            <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={inp()}>
                                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <Field label="Assign To" error={errors.assigned_user_id}>
                        <select value={data.assigned_user_id} onChange={(e) => setData('assigned_user_id', e.target.value)} className={inp()}>
                            <option value="">— Unassigned —</option>
                            {salesUsers.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Notes" error={errors.notes}>
                        <textarea rows={3} value={data.notes} onChange={(e) => setData('notes', e.target.value)} className={inp()} />
                    </Field>

                    <Field label="Follow-up Date" error={errors.follow_up_date}>
                        <input
                            type="date"
                            value={data.follow_up_date}
                            onChange={(e) => setData('follow_up_date', e.target.value)}
                            className={inp()}
                        />
                    </Field>

                    {tags.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-foreground mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => toggleTag(t.id)}
                                        className={`px-2 py-0.5 rounded text-xs text-white transition ring-2 ${
                                            data.tags.includes(t.id) ? 'ring-primary' : 'ring-transparent'
                                        }`}
                                        style={{ backgroundColor: t.color }}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-sidebar-accent transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition">
                            {isEdit ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Notes Panel ── */
function NotesPanel({ lead, onClose }) {
    const { data, setData, post, processing, reset } = useForm({ body: '' });

    const submit = (e) => {
        e.preventDefault();
        post(`/leads/${lead.id}/notes`, { onSuccess: () => reset() });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative bg-card border-l border-border w-full max-w-sm h-full flex flex-col shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-sm text-foreground">Notes — {lead.name}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {!lead.lead_notes?.length && (
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

                <form onSubmit={submit} className="p-4 border-t border-border space-y-2">
                    <textarea
                        rows={3}
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        placeholder="Write a note…"
                        className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                    <button
                        type="submit"
                        disabled={processing || !data.body.trim()}
                        className="w-full py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition"
                    >
                        Add Note
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ── Follow-up badge ── */
function FollowUpBadge({ date, status }) {
    if (!date) return <span className="text-xs text-muted-foreground">—</span>;

    const isActive   = !['converted', 'lost'].includes(status);
    const isOverdue  = isActive && new Date(date) <= new Date();
    const label      = new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return (
        <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isOverdue
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-muted text-muted-foreground'
            }`}
        >
            {isOverdue ? '⚠ ' : ''}{label}
        </span>
    );
}

/* ── helpers ── */
function Field({ label, error, children }) {
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
