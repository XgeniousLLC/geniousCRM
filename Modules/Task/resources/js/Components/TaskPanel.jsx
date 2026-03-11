/**
 * TaskPanel
 *
 * Reusable embedded task panel for entity detail pages.
 * Displays tasks linked to a specific entity (Lead, Contact, Deal).
 * Supports inline create, status cycling, and delete.
 *
 * Props:
 *   tasks         — array of task objects for this entity
 *   entityType    — 'Lead' | 'Contact' | 'Deal'
 *   entityId      — numeric ID of the entity
 *   salesUsers    — array of {id, name} for the assign dropdown
 *   statuses      — status meta object from Task::$statuses
 *
 * Module : Task
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';

export default function TaskPanel({ tasks = [], entityType, entityId, salesUsers = [], statuses = {} }) {
    const [showForm, setShowForm] = useState(false);

    return (
        <section className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Tasks</h2>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="text-xs text-primary hover:underline"
                >
                    {showForm ? 'Cancel' : '+ Add'}
                </button>
            </div>

            {showForm && (
                <CreateForm
                    entityType={entityType}
                    entityId={entityId}
                    salesUsers={salesUsers}
                    onDone={() => setShowForm(false)}
                />
            )}

            {tasks.length === 0 && !showForm ? (
                <p className="px-4 py-5 text-sm text-muted-foreground">No tasks yet.</p>
            ) : (
                <ul className="divide-y divide-border">
                    {tasks.map((task) => (
                        <TaskRow key={task.id} task={task} statuses={statuses} />
                    ))}
                </ul>
            )}
        </section>
    );
}

function CreateForm({ entityType, entityId, salesUsers, onDone }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title:            '',
        description:      '',
        due_date:         '',
        assigned_user_id: '',
        status:           'pending',
        taskable_type:    entityType ?? '',
        taskable_id:      entityId   ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/tasks', { onSuccess: () => { reset(); onDone(); } });
    };

    return (
        <form onSubmit={submit} className="p-4 space-y-3 bg-muted/30 border-b border-border">
            <input
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Task title *"
                required
                className={inp()}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}

            <div className="grid grid-cols-2 gap-2">
                <input
                    type="date"
                    value={data.due_date}
                    onChange={(e) => setData('due_date', e.target.value)}
                    className={inp()}
                />
                <select
                    value={data.assigned_user_id}
                    onChange={(e) => setData('assigned_user_id', e.target.value)}
                    className={inp()}
                >
                    <option value="">Assign to…</option>
                    {salesUsers.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
            </div>

            <textarea
                rows={2}
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />

            <button
                type="submit"
                disabled={processing || !data.title.trim()}
                className="w-full py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition"
            >
                Create Task
            </button>
        </form>
    );
}

function TaskRow({ task, statuses }) {
    const meta = statuses[task.status] ?? { label: task.status, color: 'text-foreground', bg: 'bg-muted', border: 'border-border' };
    const isDone = task.status === 'done';

    return (
        <li className="px-4 py-3 flex gap-3 items-start">
            {/* Status cycle button */}
            <button
                onClick={() => router.patch(`/tasks/${task.id}/status`)}
                title={`Status: ${meta.label} — click to advance`}
                className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 transition ${
                    isDone ? 'bg-emerald-500 border-emerald-500' : `border-current ${meta.color} bg-transparent`
                }`}
            />

            <div className="flex-1 min-w-0">
                <p className={`text-sm text-foreground leading-snug ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                </p>
                {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
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

            <button
                onClick={() => router.delete(`/tasks/${task.id}`)}
                className="text-xs text-muted-foreground hover:text-destructive transition shrink-0 mt-0.5"
                title="Delete task"
            >
                ✕
            </button>
        </li>
    );
}

function inp() {
    return 'w-full px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition';
}
