/**
 * DealDetail
 *
 * Full detail page for a single CRM deal.
 * Left column : deal info card + plain notes
 * Right column: manual activity log (email, sms, call, todo, note) + system feed
 *
 * Module : Deal
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';
import TaskPanel from '@modules/Task/resources/js/Components/TaskPanel';

/* ── Type meta ─────────────────────────────────────────────── */
const TYPE_ICONS = {
    note:  '📝',
    email: '✉️',
    sms:   '💬',
    call:  '📞',
    todo:  '✅',
};

/* ═══════════════════════════════════════════════════════════ */
export default function DealDetail({ deal, activities, logTypes, stages, contacts, salesUsers, tasks = [], taskStatuses = {}, stageProbabilities = {} }) {
    const [showEdit, setShowEdit] = useState(false);
    const stage = stages[deal.stage] ?? { label: deal.stage, color: '#94a3b8' };

    return (
        <>
            <Head title={`Deal — ${deal.title}`} />

            <div className="space-y-5 max-w-6xl mx-auto">

                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Link href="/deals" className="text-sm text-muted-foreground hover:text-foreground transition">
                            ← Deals
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <h1 className="text-lg font-semibold text-foreground">{deal.title}</h1>
                        <span className="px-2 py-0.5 rounded-full text-xs text-white font-medium" style={{ backgroundColor: stage.color }}>
                            {stage.label}
                        </span>
                        {deal.value > 0 && (
                            <span className="text-sm font-semibold text-emerald-600">
                                ${Number(deal.value).toLocaleString()}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowEdit(true)}
                            className="px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-sidebar-accent transition"
                        >
                            Edit
                        </button>
                        <DeleteBtn deal={deal} />
                    </div>
                </div>

                {/* ── Three-column body ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Col 1: info + products + notes + tasks */}
                    <div className="space-y-5">
                        <InfoCard deal={deal} stage={stage} />
                        <ProductsSection deal={deal} />
                        <NotesSection deal={deal} />
                        <TaskPanel
                            tasks={tasks}
                            entityType="Deal"
                            entityId={deal.id}
                            salesUsers={salesUsers}
                            statuses={taskStatuses}
                        />
                    </div>

                    {/* Col 2: manual activity log */}
                    <div className="lg:col-span-1">
                        <ActivityLogSection deal={deal} logTypes={logTypes} />
                    </div>

                    {/* Col 3: system feed */}
                    <div className="lg:col-span-1">
                        <SystemFeed activities={activities} />
                    </div>
                </div>
            </div>

            {showEdit && (
                <EditModal deal={deal} contacts={contacts} salesUsers={salesUsers} stages={stages} onClose={() => setShowEdit(false)} />
            )}
        </>
    );
}

DealDetail.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ── Info Card ── */
function InfoCard({ deal, stage }) {
    return (
        <section className="bg-card border border-border rounded-lg p-5 grid grid-cols-1 gap-3">
            <InfoRow label="Stage"       value={stage.label} />
            <InfoRow label="Probability" value={`${deal.probability ?? 0}%`} />
            <InfoRow label="Value"       value={deal.value > 0 ? `$${Number(deal.value).toLocaleString()}` : null} />
            <InfoRow label="Contact"     value={deal.contact ? `${deal.contact.first_name} ${deal.contact.last_name}` : null} />
            <InfoRow label="Assigned"    value={deal.assigned_user?.name} />
            <InfoRow label="Created By"  value={deal.created_by?.name} />
            <InfoRow
                label="Expected Close"
                value={deal.expected_closing_date ? new Date(deal.expected_closing_date).toLocaleDateString() : null}
            />
            <InfoRow label="Created"  value={new Date(deal.created_at).toLocaleDateString()} />
        </section>
    );
}

/* ── Products / Line Items ── */
function ProductsSection({ deal }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name:       '',
        quantity:   1,
        unit_price: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/deals/${deal.id}/products`, { onSuccess: () => reset() });
    };

    const total = (deal.deal_products ?? []).reduce((sum, p) => sum + p.quantity * p.unit_price, 0);

    return (
        <section className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Products / Line Items</h2>
                {total > 0 && (
                    <span className="text-xs font-semibold text-emerald-600">${Number(total).toLocaleString()}</span>
                )}
            </div>

            <div className="divide-y divide-border">
                {(deal.deal_products ?? []).length === 0 && (
                    <p className="px-4 py-3 text-sm text-muted-foreground">No products yet.</p>
                )}
                {(deal.deal_products ?? []).map((p) => (
                    <div key={p.id} className="px-4 py-2.5 flex items-center justify-between gap-2 text-sm">
                        <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {p.quantity} x ${Number(p.unit_price).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="font-semibold text-foreground">
                                ${Number(p.quantity * p.unit_price).toLocaleString()}
                            </span>
                            <button
                                onClick={() => router.delete(`/deals/${deal.id}/products/${p.id}`)}
                                className="text-xs text-destructive hover:underline"
                            >Remove</button>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={submit} className="px-4 py-3 border-t border-border space-y-2">
                <div className="grid grid-cols-3 gap-2">
                    <input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Product name"
                        className="col-span-3 px-2.5 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                        type="number" min="1"
                        value={data.quantity}
                        onChange={(e) => setData('quantity', Number(e.target.value))}
                        placeholder="Qty"
                        className="px-2.5 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                        type="number" min="0" step="0.01"
                        value={data.unit_price}
                        onChange={(e) => setData('unit_price', e.target.value)}
                        placeholder="Unit price"
                        className="col-span-2 px-2.5 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <button
                    type="submit"
                    disabled={processing || !data.name.trim() || !data.unit_price}
                    className="w-full py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition"
                >
                    Add Product
                </button>
            </form>
        </section>
    );
}

function InfoRow({ label, value }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm text-foreground mt-0.5">
                {value ?? <span className="italic text-muted-foreground">—</span>}
            </p>
        </div>
    );
}

/* ── Plain Notes ── */
function NotesSection({ deal }) {
    const { data, setData, post, processing, reset } = useForm({ body: '' });

    const submit = (e) => {
        e.preventDefault();
        post(`/deals/${deal.id}/notes`, { onSuccess: () => reset() });
    };

    return (
        <section className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Notes</h2>
            </div>

            <div className="p-4 space-y-3">
                {!deal.deal_notes?.length && (
                    <p className="text-sm text-muted-foreground">No notes yet.</p>
                )}
                {deal.deal_notes?.map((n) => (
                    <div key={n.id} className="bg-muted/40 rounded-md p-3 text-sm">
                        <p className="text-foreground whitespace-pre-wrap">{n.body}</p>
                        <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-muted-foreground">{n.author?.name ?? 'Unknown'}</span>
                            <button
                                onClick={() => router.delete(`/deals/${deal.id}/notes/${n.id}`)}
                                className="text-xs text-destructive hover:underline"
                            >Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={submit} className="px-4 pb-4 space-y-2">
                <textarea
                    rows={2}
                    value={data.body}
                    onChange={(e) => setData('body', e.target.value)}
                    placeholder="Add a note…"
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <button
                    type="submit"
                    disabled={processing || !data.body.trim()}
                    className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition"
                >
                    Add Note
                </button>
            </form>
        </section>
    );
}

/* ── Manual Activity Log ── */
const LOG_TYPES = ['note', 'email', 'sms', 'call', 'todo'];

function ActivityLogSection({ deal, logTypes }) {
    const [activeType, setActiveType] = useState('note');
    const { data, setData, post, processing, reset } = useForm({
        type:     'note',
        subject:  '',
        body:     '',
        due_date: '',
    });

    const selectType = (t) => {
        setActiveType(t);
        setData('type', t);
    };

    const submit = (e) => {
        e.preventDefault();
        post(`/deals/${deal.id}/logs`, { onSuccess: () => { reset(); setData('type', activeType); } });
    };

    const logs = [...(deal.deal_logs ?? [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <section className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Activity Log</h2>
            </div>

            {/* Type picker */}
            <div className="flex border-b border-border overflow-x-auto">
                {LOG_TYPES.map((t) => {
                    const meta = logTypes[t] ?? { label: t };
                    return (
                        <button
                            key={t}
                            onClick={() => selectType(t)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition border-b-2 ${
                                activeType === t
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <span>{TYPE_ICONS[t]}</span>
                            {meta.label}
                        </button>
                    );
                })}
            </div>

            {/* Log form */}
            <form onSubmit={submit} className="p-4 space-y-3 border-b border-border">
                {(activeType === 'email' || activeType === 'call' || activeType === 'todo') && (
                    <input
                        value={data.subject}
                        onChange={(e) => setData('subject', e.target.value)}
                        placeholder={
                            activeType === 'email' ? 'Subject…' :
                            activeType === 'call'  ? 'Call summary…' :
                            'Todo title…'
                        }
                        className={inp()}
                    />
                )}

                <textarea
                    rows={activeType === 'todo' ? 2 : 3}
                    value={data.body}
                    onChange={(e) => setData('body', e.target.value)}
                    placeholder={
                        activeType === 'note'  ? 'Write a note…' :
                        activeType === 'email' ? 'Email body…' :
                        activeType === 'sms'   ? 'SMS message…' :
                        activeType === 'call'  ? 'Call notes…' :
                        'Todo description…'
                    }
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />

                {activeType === 'todo' && (
                    <input
                        type="date"
                        value={data.due_date}
                        onChange={(e) => setData('due_date', e.target.value)}
                        className={inp()}
                        placeholder="Due date (optional)"
                    />
                )}

                <button
                    type="submit"
                    disabled={processing || (!data.body.trim() && !data.subject.trim())}
                    className="w-full py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition"
                >
                    Log {logTypes[activeType]?.label ?? activeType}
                </button>
            </form>

            {/* Timeline */}
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-muted-foreground">No activity logged yet.</p>
                ) : logs.map((log) => (
                    <LogEntry key={log.id} log={log} deal={deal} logTypes={logTypes} />
                ))}
            </div>
        </section>
    );
}

function LogEntry({ log, deal, logTypes }) {
    const meta = logTypes[log.type] ?? { label: log.type, color: 'text-foreground', bg: 'bg-muted' };
    const icon = TYPE_ICONS[log.type] ?? '•';

    return (
        <div className="px-4 py-3 flex gap-3">
            {/* Type icon */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${meta.bg}`}>
                {icon}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold uppercase tracking-wide ${meta.color}`}>
                        {meta.label}
                    </span>
                    {log.type === 'todo' && (
                        <button
                            onClick={() => router.patch(`/deals/${deal.id}/logs/${log.id}/toggle`)}
                            className={`text-xs px-2 py-0.5 rounded-full border transition ${
                                log.completed
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                    : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                            }`}
                        >
                            {log.completed ? '✓ Done' : 'Mark done'}
                        </button>
                    )}
                </div>

                {log.subject && (
                    <p className={`text-sm font-medium text-foreground mt-0.5 ${log.type === 'todo' && log.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {log.subject}
                    </p>
                )}
                {log.body && (
                    <p className="text-sm text-foreground whitespace-pre-wrap mt-0.5">{log.body}</p>
                )}
                {log.due_date && (
                    <p className="text-xs text-amber-600 mt-0.5">
                        Due: {new Date(log.due_date).toLocaleDateString()}
                    </p>
                )}

                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                        {log.author?.name ?? 'Unknown'} · {new Date(log.created_at).toLocaleDateString()}
                    </span>
                    <button
                        onClick={() => router.delete(`/deals/${deal.id}/logs/${log.id}`)}
                        className="text-xs text-destructive hover:underline"
                    >Delete</button>
                </div>
            </div>
        </div>
    );
}

/* ── System Activity Feed ── */
function SystemFeed({ activities }) {
    return (
        <section className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">System Activity</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Auto-logged events</p>
            </div>

            {activities.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">No system events yet.</p>
            ) : (
                <ul className="divide-y divide-border max-h-[600px] overflow-y-auto">
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

/* ── Delete button ── */
function DeleteBtn({ deal }) {
    const { delete: destroy, processing } = useForm();
    return (
        <button
            onClick={() => confirm(`Delete deal "${deal.title}"?`) && destroy(`/deals/${deal.id}`, { onSuccess: () => router.visit('/deals') })}
            disabled={processing}
            className="px-3 py-1.5 text-sm border border-destructive/40 rounded-md text-destructive hover:bg-destructive/5 disabled:opacity-50 transition"
        >
            Delete
        </button>
    );
}

/* ── Edit Modal ── */
function EditModal({ deal, contacts, salesUsers, stages, onClose }) {
    const { data, setData, patch, processing, errors } = useForm({
        title:                 deal.title                 ?? '',
        value:                 deal.value                 ?? '',
        contact_id:            deal.contact_id            ?? '',
        stage:                 deal.stage                 ?? 'new_deal',
        expected_closing_date: deal.expected_closing_date ?? '',
        assigned_user_id:      deal.assigned_user_id      ?? '',
        probability:           deal.probability           ?? 10,
    });

    const STAGE_PROBS = { new_deal: 10, proposal_sent: 30, negotiation: 60, won: 100, lost: 0 };
    const handleStageChange = (stage) => {
        setData((prev) => ({ ...prev, stage, probability: STAGE_PROBS[stage] ?? prev.probability }));
    };

    const submit = (e) => {
        e.preventDefault();
        patch(`/deals/${deal.id}`, { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Edit Deal</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    <F label="Title" error={errors.title}>
                        <input value={data.title} onChange={(e) => setData('title', e.target.value)} className={inp()} />
                    </F>
                    <div className="grid grid-cols-2 gap-4">
                        <F label="Value ($)" error={errors.value}>
                            <input type="number" min="0" step="0.01" value={data.value} onChange={(e) => setData('value', e.target.value)} className={inp()} />
                        </F>
                        <F label="Stage" error={errors.stage}>
                            <select value={data.stage} onChange={(e) => handleStageChange(e.target.value)} className={inp()}>
                                {Object.entries(stages).map(([val, meta]) => (
                                    <option key={val} value={val}>{meta.label}</option>
                                ))}
                            </select>
                        </F>
                    </div>
                    <F label={`Win Probability: ${data.probability}%`} error={errors.probability}>
                        <input
                            type="range" min="0" max="100" step="5"
                            value={data.probability}
                            onChange={(e) => setData('probability', Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                    </F>
                    <div className="grid grid-cols-2 gap-4">
                        <F label="Contact" error={errors.contact_id}>
                            <select value={data.contact_id} onChange={(e) => setData('contact_id', e.target.value)} className={inp()}>
                                <option value="">— None —</option>
                                {contacts.map((c) => (
                                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                ))}
                            </select>
                        </F>
                        <F label="Assign To" error={errors.assigned_user_id}>
                            <select value={data.assigned_user_id} onChange={(e) => setData('assigned_user_id', e.target.value)} className={inp()}>
                                <option value="">— Unassigned —</option>
                                {salesUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </F>
                    </div>
                    <F label="Expected Closing Date" error={errors.expected_closing_date}>
                        <input type="date" value={data.expected_closing_date} onChange={(e) => setData('expected_closing_date', e.target.value)} className={inp()} />
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
