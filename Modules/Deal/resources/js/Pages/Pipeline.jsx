/**
 * Pipeline
 *
 * Deal pipeline page for the Mini CRM.
 * Renders two views toggled by the user:
 *   • Kanban board — columns per stage, drag-and-drop to move deals
 *   • List view    — sortable table of all deals with stage badges
 *
 * Kanban drag is handled with the HTML5 Drag & Drop API (no extra lib needed).
 * Stage updates are sent via PATCH /deals/{id}/stage (Inertia redirect, preserves scroll).
 *
 * Module : Deal
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { useState, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

export default function Pipeline({ kanban, deals, stages, contacts, salesUsers, tags, filters }) {
    const [view, setView]         = useState('kanban'); // 'kanban' | 'list'
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing]   = useState(null);
    const [sort, setSort]         = useState(filters.sort ?? 'created_at');
    const [dir,  setDir]          = useState(filters.dir  ?? 'desc');

    const handleSort = (col) => {
        const newDir = sort === col && dir === 'asc' ? 'desc' : 'asc';
        setSort(col); setDir(newDir);
        router.get('/deals', { ...filters, sort: col, dir: newDir }, { preserveState: true, replace: true });
    };

    const openCreate = () => { setEditing(null); setShowModal(true); };
    const openEdit   = (d) => { setEditing(d);   setShowModal(true); };

    return (
        <>
            <Head title="Deals — Pipeline" />

            <div className="space-y-4 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between flex-shrink-0">
                    <h1 className="text-lg font-semibold text-foreground">Deals</h1>
                    <div className="flex items-center gap-2">
                        {/* View toggle */}
                        <div className="flex border border-border rounded-md overflow-hidden text-sm">
                            <button
                                onClick={() => setView('kanban')}
                                className={`px-3 py-1.5 transition ${view === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-sidebar-accent'}`}
                            >
                                Board
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`px-3 py-1.5 transition ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-sidebar-accent'}`}
                            >
                                List
                            </button>
                        </div>
                        <button
                            onClick={openCreate}
                            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
                        >
                            + Add Deal
                        </button>
                    </div>
                </div>

                {/* Views */}
                {view === 'kanban'
                    ? <KanbanBoard kanban={kanban} onEdit={openEdit} />
                    : <ListView deals={deals} stages={stages} sort={sort} dir={dir} onSort={handleSort} onEdit={openEdit} />
                }
            </div>

            {showModal && (
                <DealModal
                    deal={editing}
                    contacts={contacts}
                    salesUsers={salesUsers}
                    stages={stages}
                    tags={tags ?? []}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}

Pipeline.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ─────────────────────────────────────────────────
   Kanban Board
───────────────────────────────────────────────── */
function KanbanBoard({ kanban, onEdit }) {
    const dragId = useRef(null);

    const onDragStart = (dealId) => { dragId.current = dealId; };

    const onDrop = (stage) => {
        if (!dragId.current) return;
        router.patch(
            `/deals/${dragId.current}/stage`,
            { stage },
            { preserveScroll: true }
        );
        dragId.current = null;
    };

    return (
        <div className="flex gap-3 overflow-x-auto pb-4 flex-1 min-h-0">
            {Object.entries(kanban).map(([stage, col]) => (
                <KanbanColumn
                    key={stage}
                    stage={stage}
                    col={col}
                    onDragStart={onDragStart}
                    onDrop={onDrop}
                    onEdit={onEdit}
                />
            ))}
        </div>
    );
}

function KanbanColumn({ stage, col, onDragStart, onDrop, onEdit }) {
    const [over, setOver] = useState(false);

    return (
        <div
            className={`flex flex-col flex-shrink-0 w-64 rounded-lg border transition ${
                over ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
            }`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={() => { setOver(false); onDrop(stage); }}
        >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                    <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: col.color }}
                    />
                    <span className="text-sm font-medium text-foreground">{col.label}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                    {col.deals.length}
                </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 p-2 overflow-y-auto flex-1">
                {col.deals.map((deal) => (
                    <DealCard
                        key={deal.id}
                        deal={deal}
                        color={col.color}
                        onDragStart={onDragStart}
                        onEdit={onEdit}
                    />
                ))}
                {col.deals.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-6">
                        Drop deals here
                    </p>
                )}
            </div>
        </div>
    );
}

function DealCard({ deal, color, onDragStart, onEdit }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const closeDate = deal.expected_closing_date ? new Date(deal.expected_closing_date) : null;
    const isOpenStage = !['won', 'lost'].includes(deal.stage);
    const isOverdue   = closeDate && closeDate < today && isOpenStage;

    return (
        <div
            draggable
            onDragStart={() => onDragStart(deal.id)}
            className={`bg-card border rounded-md p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition group ${
                isOverdue ? 'border-red-300' : 'border-border'
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                <Link
                    href={`/deals/${deal.id}`}
                    className="text-sm font-medium text-foreground leading-tight hover:text-primary hover:underline transition"
                >
                    {deal.title}
                </Link>
                <button
                    onClick={() => onEdit(deal)}
                    className="text-xs text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                >
                    Edit
                </button>
            </div>

            {isOverdue && (
                <span className="inline-block mt-1 text-[10px] font-semibold text-white bg-red-500 px-1.5 py-0.5 rounded">
                    Overdue
                </span>
            )}

            {deal.value > 0 && (
                <p className="text-xs font-semibold mt-1.5" style={{ color }}>
                    ${Number(deal.value).toLocaleString()}
                </p>
            )}

            <div className="mt-2 flex items-center justify-between">
                {deal.contact && (
                    <span className="text-xs text-muted-foreground truncate">
                        {deal.contact.first_name} {deal.contact.last_name}
                    </span>
                )}
                {closeDate && (
                    <span className={`text-xs ml-auto ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                        {closeDate.toLocaleDateString()}
                    </span>
                )}
            </div>

            <div className="mt-1.5 flex items-center justify-between">
                {deal.assigned_user && (
                    <div className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold">
                            {deal.assigned_user.name[0]}
                        </span>
                        <span className="text-xs text-muted-foreground">{deal.assigned_user.name}</span>
                    </div>
                )}
                {deal.probability != null && (
                    <span className="text-[10px] text-muted-foreground ml-auto">{deal.probability}%</span>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────
   List View
───────────────────────────────────────────────── */
function ListView({ deals, stages, sort, dir, onSort, onEdit }) {
    return (
        <div className="rounded-lg border border-border overflow-hidden bg-card">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                    <tr>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                            <SortButton label="Title" col="title" sort={sort} dir={dir} onClick={onSort} />
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">
                            <SortButton label="Value" col="value" sort={sort} dir={dir} onClick={onSort} />
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Contact</th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Assigned To</th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                            <SortButton label="Stage" col="stage" sort={sort} dir={dir} onClick={onSort} />
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">
                            <SortButton label="Close Date" col="expected_closing_date" sort={sort} dir={dir} onClick={onSort} />
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">%</th>
                        <th className="px-4 py-2.5 w-24"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {deals.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-10 text-muted-foreground">
                                No deals yet.
                            </td>
                        </tr>
                    ) : deals.map((deal) => {
                        const today2 = new Date(); today2.setHours(0,0,0,0);
                        const cd = deal.expected_closing_date ? new Date(deal.expected_closing_date) : null;
                        const openStage = !['won','lost'].includes(deal.stage);
                        const withinWeek = cd && cd >= today2 && (cd - today2) <= 7 * 86400000 && openStage;
                        const pastDue    = cd && cd < today2 && openStage;
                        const rowCls = pastDue ? 'bg-red-50 hover:bg-red-100' : withinWeek ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-sidebar-accent/30';
                        return (
                        <tr key={deal.id} className={`transition ${rowCls}`}>
                            <td className="px-4 py-2.5 font-medium text-foreground">
                                <Link href={`/deals/${deal.id}`} className="hover:text-primary hover:underline transition">
                                    {deal.title}
                                </Link>
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">
                                {deal.value > 0 ? `$${Number(deal.value).toLocaleString()}` : '—'}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell">
                                {deal.contact ? `${deal.contact.first_name} ${deal.contact.last_name}` : '—'}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell">
                                {deal.assigned_user?.name ?? '—'}
                            </td>
                            <td className="px-4 py-2.5">
                                <StageBadge stage={deal.stage} stages={stages} />
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">
                                {deal.expected_closing_date
                                    ? new Date(deal.expected_closing_date).toLocaleDateString()
                                    : '—'}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell">
                                {deal.probability != null ? `${deal.probability}%` : '—'}
                            </td>
                            <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2 justify-end">
                                    <button
                                        onClick={() => onEdit(deal)}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <DeleteButton deal={deal} />
                                </div>
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function StageBadge({ stage, stages }) {
    const meta = stages[stage] ?? { label: stage, color: '#94a3b8' };
    return (
        <span
            className="px-2 py-0.5 rounded-full text-xs text-white font-medium"
            style={{ backgroundColor: meta.color }}
        >
            {meta.label}
        </span>
    );
}

/* ─────────────────────────────────────────────────
   Delete button
───────────────────────────────────────────────── */
function DeleteButton({ deal }) {
    const { delete: destroy, processing } = useForm();

    const handle = () => {
        if (!confirm(`Delete deal "${deal.title}"?`)) return;
        destroy(`/deals/${deal.id}`);
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

/* ─────────────────────────────────────────────────
   Create / Edit Modal
───────────────────────────────────────────────── */
const STAGE_PROBS = { new_deal: 10, proposal_sent: 30, negotiation: 60, won: 100, lost: 0 };

function DealModal({ deal, contacts, salesUsers, stages, tags, onClose }) {
    const isEdit = !!deal;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        title:                 deal?.title                 ?? '',
        value:                 deal?.value                 ?? '',
        contact_id:            deal?.contact_id            ?? '',
        stage:                 deal?.stage                 ?? 'new_deal',
        expected_closing_date: deal?.expected_closing_date ?? '',
        assigned_user_id:      deal?.assigned_user_id      ?? '',
        probability:           deal?.probability           ?? 10,
        tags:                  deal?.tags?.map((t) => t.id) ?? [],
    });

    const handleStageChange = (stage) => {
        setData((prev) => ({ ...prev, stage, probability: STAGE_PROBS[stage] ?? prev.probability }));
    };

    const toggleTag = (id) => {
        setData('tags', data.tags.includes(id)
            ? data.tags.filter((t) => t !== id)
            : [...data.tags, id]
        );
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(`/deals/${deal.id}`, { onSuccess: onClose });
        } else {
            post('/deals', { onSuccess: () => { reset(); onClose(); } });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">{isEdit ? 'Edit Deal' : 'New Deal'}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    <Field label="Title" error={errors.title}>
                        <input value={data.title} onChange={(e) => setData('title', e.target.value)} className={inp()} />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Value ($)" error={errors.value}>
                            <input type="number" min="0" step="0.01" value={data.value} onChange={(e) => setData('value', e.target.value)} className={inp()} />
                        </Field>
                        <Field label="Stage" error={errors.stage}>
                            <select value={data.stage} onChange={(e) => handleStageChange(e.target.value)} className={inp()}>
                                {Object.entries(stages).map(([val, meta]) => (
                                    <option key={val} value={val}>{meta.label}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Contact" error={errors.contact_id}>
                            <select value={data.contact_id} onChange={(e) => setData('contact_id', e.target.value)} className={inp()}>
                                <option value="">— None —</option>
                                {contacts.map((c) => (
                                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Assign To" error={errors.assigned_user_id}>
                            <select value={data.assigned_user_id} onChange={(e) => setData('assigned_user_id', e.target.value)} className={inp()}>
                                <option value="">— Unassigned —</option>
                                {salesUsers.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <Field label="Expected Closing Date" error={errors.expected_closing_date}>
                        <input type="date" value={data.expected_closing_date} onChange={(e) => setData('expected_closing_date', e.target.value)} className={inp()} />
                    </Field>

                    <Field label={`Win Probability: ${data.probability}%`} error={errors.probability}>
                        <input
                            type="range"
                            min="0" max="100" step="5"
                            value={data.probability}
                            onChange={(e) => setData('probability', Number(e.target.value))}
                            className="w-full accent-primary"
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
