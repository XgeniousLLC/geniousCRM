/**
 * MyTasks
 *
 * Shows all tasks assigned to the currently logged-in user.
 * Tasks are grouped/sorted by urgency: in_progress first, then pending, then done.
 * Supports filter by status and inline create.
 *
 * Module : Task
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

const ENTITY_LABELS = { Lead: 'Lead', Contact: 'Contact', Deal: 'Deal' };
const ENTITY_URLS   = { Lead: '/leads', Contact: '/contacts', Deal: '/deals' };

export default function MyTasks({ tasks, statuses, salesUsers, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [showCreate, setShowCreate]     = useState(false);

    const applyFilter = (s) => {
        setStatusFilter(s);
        router.get('/tasks', { status: s }, { preserveState: true, replace: true });
    };

    const pending    = tasks.filter((t) => t.status === 'pending');
    const inProgress = tasks.filter((t) => t.status === 'in_progress');
    const done       = tasks.filter((t) => t.status === 'done');

    const groups = statusFilter
        ? [{ label: statuses[statusFilter]?.label ?? statusFilter, items: tasks }]
        : [
            { label: 'In Progress', items: inProgress },
            { label: 'Pending',     items: pending },
            { label: 'Done',        items: done },
          ].filter((g) => g.items.length > 0);

    return (
        <>
            <Head title="My Tasks" />

            <div className="space-y-5 max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">My Tasks</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Tasks assigned to you</p>
                    </div>
                    <button
                        onClick={() => setShowCreate((v) => !v)}
                        className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
                    >
                        {showCreate ? 'Cancel' : '+ New Task'}
                    </button>
                </div>

                {/* Status filter pills */}
                <div className="flex gap-2 flex-wrap">
                    {[{ value: '', label: 'All' }, ...Object.entries(statuses).map(([v, m]) => ({ value: v, label: m.label }))].map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => applyFilter(value)}
                            className={`px-3 py-1 text-sm rounded-full border transition ${
                                statusFilter === value
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border text-muted-foreground hover:bg-sidebar-accent'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Inline create form */}
                {showCreate && (
                    <CreateForm salesUsers={salesUsers} onDone={() => setShowCreate(false)} />
                )}

                {/* Task groups */}
                {tasks.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg py-16 text-center text-sm text-muted-foreground">
                        No tasks assigned to you.
                    </div>
                ) : groups.map((group) => (
                    <div key={group.label} className="space-y-2">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                            {group.label} ({group.items.length})
                        </h2>
                        <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
                            {group.items.map((task) => (
                                <TaskRow key={task.id} task={task} statuses={statuses} salesUsers={salesUsers} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

MyTasks.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ── Create Form ── */
function CreateForm({ salesUsers, onDone }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title:            '',
        description:      '',
        due_date:         '',
        assigned_user_id: '',
        status:           'pending',
        taskable_type:    '',
        taskable_id:      '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/tasks', { onSuccess: () => { reset(); onDone(); } });
    };

    return (
        <form onSubmit={submit} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <input
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Task title *"
                required
                className={inp()}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}

            <textarea
                rows={2}
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />

            <div className="grid grid-cols-2 gap-3">
                <input
                    type="date"
                    value={data.due_date}
                    onChange={(e) => setData('due_date', e.target.value)}
                    className={inp()}
                />
                <select value={data.assigned_user_id} onChange={(e) => setData('assigned_user_id', e.target.value)} className={inp()}>
                    <option value="">Assign to…</option>
                    {salesUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>

            <div className="flex justify-end gap-2">
                <button type="button" onClick={onDone} className="px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-sidebar-accent transition">Cancel</button>
                <button type="submit" disabled={processing || !data.title.trim()} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition">Create</button>
            </div>
        </form>
    );
}

/* ── Task Row ── */
function TaskRow({ task, statuses, salesUsers }) {
    const [editing, setEditing] = useState(false);
    const meta   = statuses[task.status] ?? { label: task.status, color: 'text-foreground', bg: 'bg-muted', border: 'border-border' };
    const isDone = task.status === 'done';

    return (
        <div className="px-4 py-3">
            {editing ? (
                <EditForm task={task} salesUsers={salesUsers} statuses={statuses} onDone={() => setEditing(false)} />
            ) : (
                <div className="flex gap-3 items-start">
                    {/* Status cycle */}
                    <button
                        onClick={() => router.patch(`/tasks/${task.id}/status`)}
                        title={`${meta.label} — click to advance`}
                        className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 transition ${
                            isDone ? 'bg-emerald-500 border-emerald-500' : `border-current ${meta.color}`
                        }`}
                    />

                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                        </p>
                        {task.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                        )}

                        {/* Entity context link */}
                        {task.taskable_type && (
                            <a
                                href={`${ENTITY_URLS[task.taskable_type] ?? '#'}/${task.taskable_id}`}
                                className="text-xs text-primary hover:underline mt-0.5 inline-block"
                            >
                                {ENTITY_LABELS[task.taskable_type]} #{task.taskable_id}
                            </a>
                        )}

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-1.5 py-0.5 rounded border ${meta.bg} ${meta.color} ${meta.border}`}>
                                {meta.label}
                            </span>
                            {task.due_date_label && (
                                <span className="text-xs text-muted-foreground">Due {task.due_date_label}</span>
                            )}
                            {task.assigned_user && (
                                <span className="text-xs text-muted-foreground">{task.assigned_user.name}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                        <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline">Edit</button>
                        <button onClick={() => router.delete(`/tasks/${task.id}`)} className="text-xs text-destructive hover:underline">Delete</button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Inline Edit Form ── */
function EditForm({ task, salesUsers, statuses, onDone }) {
    const { data, setData, patch, processing, errors } = useForm({
        title:            task.title            ?? '',
        description:      task.description      ?? '',
        due_date:         task.due_date         ?? '',
        assigned_user_id: task.assigned_user_id ?? '',
        status:           task.status           ?? 'pending',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(`/tasks/${task.id}`, { onSuccess: onDone });
    };

    return (
        <form onSubmit={submit} className="space-y-2">
            <input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Title *" required className={inp()} />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            <textarea rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <div className="grid grid-cols-3 gap-2">
                <input type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className={inp()} />
                <select value={data.assigned_user_id} onChange={(e) => setData('assigned_user_id', e.target.value)} className={inp()}>
                    <option value="">Assign…</option>
                    {salesUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={inp()}>
                    {Object.entries(statuses).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                </select>
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={processing} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition">Save</button>
                <button type="button" onClick={onDone} className="px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-sidebar-accent transition">Cancel</button>
            </div>
        </form>
    );
}

function inp() {
    return 'w-full px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition';
}
