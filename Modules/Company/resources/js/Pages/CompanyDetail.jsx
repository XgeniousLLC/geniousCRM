/**
 * CompanyDetail
 *
 * Shows a single company profile with linked contacts,
 * linked deals, activity feed, and task list.
 *
 * Module : Company
 * Author : Xgenious (https://xgenious.com)
 */

import { Link } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

const STAGE_COLORS = {
    new_deal:      'bg-blue-100 text-blue-700',
    proposal_sent: 'bg-yellow-100 text-yellow-700',
    negotiation:   'bg-purple-100 text-purple-700',
    won:           'bg-green-100 text-green-700',
    lost:          'bg-red-100 text-red-700',
};

const STATUS_COLORS = {
    pending:     'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    done:        'bg-green-100 text-green-700',
};

export default function CompanyDetail({ company, deals, activities, tasks, taskStatuses }) {
    return (
        <div className="p-6 space-y-6">
            <Link href="/companies" className="text-sm text-muted-foreground hover:text-foreground transition">
                Back to Companies
            </Link>

            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
                <h1 className="text-xl font-semibold text-foreground">{company.name}</h1>
                {company.industry && (
                    <p className="text-sm text-muted-foreground">{company.industry}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {company.website && <InfoRow label="Website" value={company.website} />}
                    {company.phone   && <InfoRow label="Phone" value={company.phone} />}
                    {company.address && <InfoRow label="Address" value={company.address} />}
                    {company.created_by && <InfoRow label="Created by" value={company.created_by.name} />}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Section title={`Contacts (${company.contacts.length})`}>
                        {company.contacts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No contacts linked.</p>
                        ) : (
                            <div className="divide-y divide-border">
                                {company.contacts.map((c) => (
                                    <div key={c.id} className="py-2 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {c.first_name} {c.last_name}
                                            </p>
                                            {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                                        </div>
                                        {c.phone && <span className="text-xs text-muted-foreground">{c.phone}</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>

                    <Section title={`Deals (${deals.length})`}>
                        {deals.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No deals linked.</p>
                        ) : (
                            <div className="divide-y divide-border">
                                {deals.map((d) => (
                                    <div key={d.id} className="py-2 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <Link href={`/deals/${d.id}`} className="text-sm font-medium text-foreground hover:underline truncate block">
                                                {d.title}
                                            </Link>
                                            {d.assigned_user && (
                                                <p className="text-xs text-muted-foreground">{d.assigned_user.name}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {d.value != null && (
                                                <span className="text-sm font-medium text-foreground">
                                                    ${Number(d.value).toLocaleString()}
                                                </span>
                                            )}
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[d.stage] ?? 'bg-muted text-muted-foreground'}`}>
                                                {d.stage_label}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>

                    <Section title={`Tasks (${tasks.length})`}>
                        {tasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No tasks linked.</p>
                        ) : (
                            <div className="divide-y divide-border">
                                {tasks.map((t) => (
                                    <div key={t.id} className="py-2 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                                            {t.due_date_label && (
                                                <p className="text-xs text-muted-foreground">Due {t.due_date_label}</p>
                                            )}
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status] ?? 'bg-muted text-muted-foreground'}`}>
                                            {taskStatuses[t.status] ?? t.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>
                </div>

                <div>
                    <Section title="Activity">
                        {activities.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No activity yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {activities.map((a) => (
                                    <div key={a.id} className="text-xs space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            <span className="font-medium text-foreground">{a.action_label}</span>
                                        </div>
                                        {a.description && (
                                            <p className="pl-3 text-muted-foreground">{a.description}</p>
                                        )}
                                        <p className="pl-3 text-muted-foreground">
                                            {a.user ? a.user.name : 'System'} — {a.created_at}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>
                </div>
            </div>
        </div>
    );
}

CompanyDetail.layout = (page) => <AppLayout>{page}</AppLayout>;

function Section({ title, children }) {
    return (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {children}
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm text-foreground">{value}</p>
        </div>
    );
}
