/**
 * ReportDashboard
 *
 * Main report page for the Mini CRM.
 * Shows: summary stat cards, deals-by-stage bar chart,
 * lead conversion funnel, pipeline value breakdown,
 * and CSV export buttons for contacts and leads.
 * Supports date-range filtering.
 * Accessible to admin and manager roles only.
 *
 * Module : Report
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

const LEAD_STATUS_LABELS = {
    new: 'New', contacted: 'Contacted', qualified: 'Qualified',
    lost: 'Lost', converted: 'Converted',
};

const LEAD_STATUS_COLORS = {
    new: '#6366f1', contacted: '#f59e0b', qualified: '#10b981',
    lost: '#ef4444', converted: '#8b5cf6',
};

export default function ReportDashboard({ stats, stageData, leadsByStatus, leadsBySource, conversionRate, leadsTotal, leadsConverted, filters }) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo]     = useState(filters.to   ?? '');

    const applyFilters = () => {
        router.get('/reports', { from, to }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setFrom(''); setTo('');
        router.get('/reports', {}, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Reports" />

            <div className="space-y-6">
                {/* ── Header ── */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">Reports</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Overview of your CRM pipeline</p>
                    </div>

                    {/* Export buttons */}
                    <div className="flex gap-2">
                        <a
                            href="/reports/export/contacts"
                            className="px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-sidebar-accent transition"
                        >
                            ↓ Contacts CSV
                        </a>
                        <a
                            href="/reports/export/leads"
                            className="px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-sidebar-accent transition"
                        >
                            ↓ Leads CSV
                        </a>
                    </div>
                </div>

                {/* ── Date range filter ── */}
                <div className="flex flex-wrap items-end gap-3 bg-card border border-border rounded-lg p-4">
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">From</label>
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className={inp()}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">To</label>
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className={inp()}
                        />
                    </div>
                    <button
                        onClick={applyFilters}
                        className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
                    >
                        Apply
                    </button>
                    {(filters.from || filters.to) && (
                        <button
                            onClick={clearFilters}
                            className="px-3 py-1.5 text-sm border border-border rounded-md text-muted-foreground hover:bg-sidebar-accent transition"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* ── Summary stat cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Contacts"       value={stats.contacts}                   color="bg-blue-50 text-blue-600" />
                    <StatCard label="Active Leads"   value={stats.leads}                      color="bg-amber-50 text-amber-600" />
                    <StatCard label="Open Deals"     value={stats.deals}                      color="bg-indigo-50 text-indigo-600" />
                    <StatCard label="Open Tasks"     value={stats.open_tasks}                 color="bg-purple-50 text-purple-600" />
                    <StatCard label="Pipeline Value" value={`$${fmt(stats.pipeline_value)}`}  color="bg-emerald-50 text-emerald-600" />
                    <StatCard label="Won Value"          value={`$${fmt(stats.won_value)}`}           color="bg-teal-50 text-teal-600" />
                    <StatCard label="Lost Value"         value={`$${fmt(stats.lost_value)}`}          color="bg-red-50 text-red-500" />
                    <StatCard label="Weighted Pipeline"  value={`$${fmt(stats.weighted_pipeline)}`}   color="bg-orange-50 text-orange-600" />
                    <StatCard label="Conversion Rate"    value={`${conversionRate}%`}                 color="bg-violet-50 text-violet-600" />
                </div>

                {/* ── Charts row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <DealsStageChart stageData={stageData} />
                    <LeadStatusChart leadsByStatus={leadsByStatus} leadsTotal={leadsTotal} leadsConverted={leadsConverted} conversionRate={conversionRate} />
                </div>

                {/* ── Pipeline value by stage ── */}
                <PipelineValueChart stageData={stageData} />

                {/* ── Leads by source ── */}
                {leadsBySource?.length > 0 && (
                    <LeadsBySourceChart leadsBySource={leadsBySource} />
                )}
            </div>
        </>
    );
}

ReportDashboard.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ── Stat Card ── */
function StatCard({ label, value, color }) {
    return (
        <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color.split(' ')[1]}`}>{value}</p>
        </div>
    );
}

/* ── Deals by Stage — Count Bar Chart ── */
function DealsStageChart({ stageData }) {
    const maxCount = Math.max(...stageData.map((s) => s.count), 1);

    return (
        <section className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Deals by Stage</h2>

            <div className="space-y-3">
                {stageData.map((s) => (
                    <div key={s.stage}>
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-foreground font-medium">{s.label}</span>
                            <span className="text-muted-foreground">{s.count} deal{s.count !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="h-6 bg-muted rounded-md overflow-hidden">
                            <div
                                className="h-full rounded-md transition-all duration-500"
                                style={{
                                    width: `${Math.max((s.count / maxCount) * 100, s.count > 0 ? 4 : 0)}%`,
                                    backgroundColor: s.color,
                                }}
                            />
                        </div>
                    </div>
                ))}
                {stageData.every((s) => s.count === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No deals yet.</p>
                )}
            </div>
        </section>
    );
}

/* ── Lead Conversion Rate ── */
function LeadStatusChart({ leadsByStatus, leadsTotal, leadsConverted, conversionRate }) {
    const statuses  = Object.entries(LEAD_STATUS_LABELS);
    const maxCount  = Math.max(...statuses.map(([k]) => leadsByStatus[k] ?? 0), 1);

    return (
        <section className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Lead Pipeline</h2>
                <span className="text-xs text-muted-foreground">
                    {leadsConverted} / {leadsTotal} converted ({conversionRate}%)
                </span>
            </div>

            {/* Conversion rate bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Conversion rate</span>
                    <span className="font-semibold text-violet-600">{conversionRate}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${conversionRate}%` }}
                    />
                </div>
            </div>

            {/* Per-status bars */}
            <div className="space-y-3">
                {statuses.map(([status, label]) => {
                    const count = leadsByStatus[status] ?? 0;
                    return (
                        <div key={status}>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-foreground">{label}</span>
                                <span className="text-muted-foreground">{count}</span>
                            </div>
                            <div className="h-5 bg-muted rounded-md overflow-hidden">
                                <div
                                    className="h-full rounded-md transition-all duration-500"
                                    style={{
                                        width: `${Math.max((count / maxCount) * 100, count > 0 ? 4 : 0)}%`,
                                        backgroundColor: LEAD_STATUS_COLORS[status],
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

/* ── Pipeline Value by Stage ── */
function PipelineValueChart({ stageData }) {
    const maxValue = Math.max(...stageData.map((s) => s.total_value), 1);

    return (
        <section className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Pipeline Value by Stage</h2>

            <div className="space-y-3">
                {stageData.map((s) => (
                    <div key={s.stage} className="flex items-center gap-4">
                        <div className="w-28 shrink-0 text-xs text-foreground text-right">{s.label}</div>
                        <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden">
                            <div
                                className="h-full rounded-md flex items-center px-2 transition-all duration-500"
                                style={{
                                    width: `${Math.max((s.total_value / maxValue) * 100, s.total_value > 0 ? 4 : 0)}%`,
                                    backgroundColor: s.color + '99', // semi-transparent
                                }}
                            />
                        </div>
                        <div className="w-24 shrink-0 text-xs text-muted-foreground text-right">
                            ${fmt(s.total_value)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals row */}
            <div className="mt-4 pt-4 border-t border-border flex gap-6 flex-wrap">
                {stageData.filter((s) => s.total_value > 0).map((s) => (
                    <div key={s.stage} className="text-xs">
                        <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: s.color }} />
                        <span className="text-muted-foreground">{s.label}: </span>
                        <span className="font-medium text-foreground">${fmt(s.total_value)}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ── Leads by Source ── */
const SOURCE_COLORS = [
    '#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899',
];

function LeadsBySourceChart({ leadsBySource }) {
    const maxCount = Math.max(...leadsBySource.map((s) => s.count), 1);

    return (
        <section className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Leads by Source</h2>

            <div className="space-y-3">
                {leadsBySource.map((s, i) => (
                    <div key={s.source}>
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-foreground font-medium">{s.source}</span>
                            <span className="text-muted-foreground">{s.count} lead{s.count !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="h-6 bg-muted rounded-md overflow-hidden">
                            <div
                                className="h-full rounded-md transition-all duration-500"
                                style={{
                                    width: `${Math.max((s.count / maxCount) * 100, 4)}%`,
                                    backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length],
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ── helpers ── */
function fmt(n) {
    return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function inp() {
    return 'px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition';
}
