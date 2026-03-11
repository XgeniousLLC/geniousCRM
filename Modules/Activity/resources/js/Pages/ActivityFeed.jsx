/**
 * ActivityFeed
 *
 * Global activity feed for the Activity module.
 * Shows a paginated, reverse-chronological log of all user actions
 * across Leads, Deals, and Contacts. Filterable by entity type and action.
 * Accessible to admin and manager roles only.
 *
 * Module : Activity
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

const ENTITY_TYPES = ['Lead', 'Deal', 'Contact'];

const ENTITY_COLORS = {
    Lead:    'bg-amber-50 text-amber-700 border-amber-200',
    Deal:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    Contact: 'bg-blue-50 text-blue-700 border-blue-200',
};

const ENTITY_ICONS = {
    Lead: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    Deal: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
        </svg>
    ),
    Contact: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
};

const ACTION_COLORS = {
    created:       'text-emerald-600',
    updated:       'text-blue-600',
    deleted:       'text-red-500',
    stage_changed: 'text-purple-600',
    status_changed:'text-amber-600',
    note_added:    'text-sky-600',
    note_deleted:  'text-rose-500',
    converted:     'text-teal-600',
};

export default function ActivityFeed({ activities, actionLabels, filters }) {
    const [entityType, setEntityType] = useState(filters.entity_type ?? '');
    const [action, setAction]         = useState(filters.action ?? '');

    const applyFilters = (overrides = {}) => {
        router.get('/activities', {
            entity_type: entityType,
            action,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Activity Feed" />

            <div className="space-y-5">
                {/* Header */}
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Activity Feed</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        A log of all actions taken across the CRM.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <select
                        value={entityType}
                        onChange={(e) => { setEntityType(e.target.value); applyFilters({ entity_type: e.target.value }); }}
                        className={sel()}
                    >
                        <option value="">All entities</option>
                        {ENTITY_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    <select
                        value={action}
                        onChange={(e) => { setAction(e.target.value); applyFilters({ action: e.target.value }); }}
                        className={sel()}
                    >
                        <option value="">All actions</option>
                        {Object.entries(actionLabels).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>

                    {(entityType || action) && (
                        <button
                            onClick={() => {
                                setEntityType('');
                                setAction('');
                                applyFilters({ entity_type: '', action: '' });
                            }}
                            className="px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-md hover:bg-sidebar-accent transition"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Feed */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    {activities.data.length === 0 ? (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            No activity recorded yet.
                        </div>
                    ) : (
                        <ul className="divide-y divide-border">
                            {activities.data.map((activity) => (
                                <ActivityRow key={activity.id} activity={activity} />
                            ))}
                        </ul>
                    )}
                </div>

                {/* Pagination */}
                {activities.last_page > 1 && (
                    <div className="flex gap-1 flex-wrap">
                        {activities.links.map((link, i) => (
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
        </>
    );
}

ActivityFeed.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ── Single activity row ── */
function ActivityRow({ activity }) {
    const entityColor = ENTITY_COLORS[activity.entity_type] ?? 'bg-muted text-muted-foreground border-border';
    const entityIcon  = ENTITY_ICONS[activity.entity_type]  ?? null;
    const actionColor = ACTION_COLORS[activity.action]       ?? 'text-foreground';

    return (
        <li className="flex items-start gap-4 px-5 py-3.5 hover:bg-sidebar-accent/30 transition">
            {/* Timeline dot */}
            <div className="mt-1 w-2 h-2 rounded-full bg-muted-foreground/40 shrink-0 mt-2" />

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Entity type badge */}
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${entityColor}`}>
                        {entityIcon}
                        {activity.entity_type}
                    </span>

                    {/* Entity label */}
                    {activity.entity_label && (
                        <span className="text-sm font-medium text-foreground truncate max-w-xs">
                            {activity.entity_label}
                        </span>
                    )}

                    {/* Action */}
                    <span className={`text-sm font-medium ${actionColor}`}>
                        {activity.action_label}
                    </span>
                </div>

                {/* Description */}
                {activity.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                )}

                {/* Meta */}
                <p className="text-xs text-muted-foreground mt-1">
                    {activity.user?.name ?? 'System'} &middot; {activity.created_at}
                </p>
            </div>
        </li>
    );
}

/* ── helpers ── */
function sel() {
    return 'px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring';
}
