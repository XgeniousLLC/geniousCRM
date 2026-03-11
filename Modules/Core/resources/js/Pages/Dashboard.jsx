/**
 * Dashboard
 *
 * Admin dashboard home page for Mini CRM.
 * Displays summary stat cards for contacts, leads, deals, and open tasks.
 * Data is passed as props from DashboardController. Charts are wired in Phase 8.
 *
 * Module : Core
 * Author : Xgenious (https://xgenious.com)
 */

import { Head } from '@inertiajs/react';
import AppLayout from '../Components/Layout/AppLayout';

function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${color}`}>
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-semibold text-foreground">{value}</div>
        </div>
    );
}

export default function Dashboard({ stats }) {
    const cards = [
        {
            label: 'Total Contacts',
            value: stats.contacts,
            color: 'bg-blue-50 text-blue-600',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
        {
            label: 'Active Leads',
            value: stats.leads,
            color: 'bg-amber-50 text-amber-600',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
        },
        {
            label: 'Open Deals',
            value: stats.deals,
            color: 'bg-emerald-50 text-emerald-600',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            label: 'Open Tasks',
            value: stats.tasks,
            color: 'bg-purple-50 text-purple-600',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
        },
        {
            label: 'Follow-ups Due',
            value: stats.follow_up_due,
            color: 'bg-rose-50 text-rose-600',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            label: 'Closing This Week',
            value: stats.closing_this_week,
            color: 'bg-orange-50 text-orange-600',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Welcome back! Here's an overview.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
                    {cards.map((card) => (
                        <StatCard key={card.label} {...card} />
                    ))}
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <QuickLink href="/reports"    label="View Reports"       desc="Pipeline, conversion, and export" />
                    <QuickLink href="/activities" label="Activity Feed"      desc="Recent actions across all entities" />
                    <QuickLink href="/tasks"      label="My Tasks"           desc="Your pending and in-progress tasks" />
                    <QuickLink href="/leads?status=new" label="Follow-ups Due" desc="Leads with overdue follow-up dates" />
                </div>
            </div>
        </>
    );
}

function QuickLink({ href, label, desc }) {
    return (
        <a
            href={href}
            className="bg-card border border-border rounded-lg p-4 hover:bg-sidebar-accent transition block"
        >
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </a>
    );
}

// Attach persistent layout so the sidebar/header don't re-mount on navigation
Dashboard.layout = (page) => <AppLayout>{page}</AppLayout>;
