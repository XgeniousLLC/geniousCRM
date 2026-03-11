/**
 * Onboarding
 *
 * First-time setup wizard for Mini CRM.
 * Shown to admin users when no contacts, leads, or deals exist
 * and the onboarding has not been dismissed.
 *
 * Steps:
 *   1. Welcome — confirm app title, links to settings
 *   2. Invite Team — link to user management to invite colleagues
 *   3. Import Data — optional quick-link to CSV import for contacts
 *   4. Done — dismiss the wizard and go to dashboard
 *
 * The wizard is dismissed by posting to /onboarding/dismiss which stores
 * a flag in the settings table so it never re-appears.
 *
 * Module : Core
 * Author : Xgenious (https://xgenious.com)
 */

import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../Components/Layout/AppLayout';

const STEPS = [
    { id: 1, title: 'Welcome',      icon: 'M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z' },
    { id: 2, title: 'Invite Team',  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 3, title: 'Import Data',  icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10' },
    { id: 4, title: 'Done',         icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export default function Onboarding({ appTitle }) {
    const [step, setStep] = useState(1);
    const [dismissing, setDismissing] = useState(false);

    const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length));
    const goPrev = () => setStep((s) => Math.max(s - 1, 1));

    const dismiss = () => {
        setDismissing(true);
        router.post('/onboarding/dismiss');
    };

    const currentStep = STEPS[step - 1];

    return (
        <>
            <Head title="Setup Wizard" />

            {/* Full-page overlay wizard */}
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-foreground">Welcome to {appTitle}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Complete these quick steps to get started. You can always skip and come back later.
                        </p>
                    </div>

                    {/* Step progress */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {STEPS.map((s, i) => (
                            <div key={s.id} className="flex items-center gap-2">
                                <button
                                    onClick={() => setStep(s.id)}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition ${
                                        step === s.id
                                            ? 'bg-primary text-primary-foreground'
                                            : step > s.id
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {step > s.id ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : s.id}
                                </button>
                                {i < STEPS.length - 1 && (
                                    <div className={`h-px w-10 ${step > s.id ? 'bg-emerald-400' : 'bg-border'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step card */}
                    <div className="bg-card border border-border rounded-xl p-8">
                        {/* Step icon */}
                        <div className="flex justify-center mb-5">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={currentStep.icon} />
                                </svg>
                            </div>
                        </div>

                        {/* Step content */}
                        {step === 1 && <StepWelcome appTitle={appTitle} />}
                        {step === 2 && <StepInviteTeam />}
                        {step === 3 && <StepImportData />}
                        {step === 4 && <StepDone />}

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                            <button
                                onClick={goPrev}
                                disabled={step === 1}
                                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Back
                            </button>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={dismiss}
                                    disabled={dismissing}
                                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
                                >
                                    Skip setup
                                </button>

                                {step < STEPS.length ? (
                                    <button
                                        onClick={goNext}
                                        className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        onClick={dismiss}
                                        disabled={dismissing}
                                        className="px-5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                                    >
                                        {dismissing ? 'Saving...' : 'Go to Dashboard'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Onboarding.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ── Step 1: Welcome ── */
function StepWelcome({ appTitle }) {
    return (
        <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-foreground">You're almost ready!</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Mini CRM is installed and running. This wizard will help you configure the basics
                and get your team started quickly.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2 max-w-sm mx-auto">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Quick checklist</p>
                <ChecklistItem done>App installed successfully</ChecklistItem>
                <ChecklistItem done>Admin account created</ChecklistItem>
                <ChecklistItem>
                    <a href="/settings" className="text-primary hover:underline">Configure general settings</a>
                    <span className="text-muted-foreground"> (logo, title)</span>
                </ChecklistItem>
            </div>
        </div>
    );
}

/* ── Step 2: Invite Team ── */
function StepInviteTeam() {
    return (
        <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Invite your team</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Add colleagues so they can manage contacts, leads, and deals.
                Assign them roles: Manager or Sales User.
            </p>
            <a
                href="/users"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Go to User Management
            </a>
            <p className="text-xs text-muted-foreground">You can do this later from the Users menu.</p>
        </div>
    );
}

/* ── Step 3: Import Data ── */
function StepImportData() {
    return (
        <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Import your data</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Have existing contacts or leads in a spreadsheet? Import them via CSV to hit the ground running.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                    href="/contacts/import"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-accent transition"
                >
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Import Contacts
                </a>
                <a
                    href="/leads/import"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-accent transition"
                >
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Import Leads
                </a>
            </div>
            <p className="text-xs text-muted-foreground">
                Supports CSV files. A column mapping step helps you match headers to fields.
            </p>
        </div>
    );
}

/* ── Step 4: Done ── */
function StepDone() {
    return (
        <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-foreground">You're all set!</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Mini CRM is ready to use. Click "Go to Dashboard" to start managing
                your contacts, leads, and deals.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 max-w-sm mx-auto">
                <p className="text-sm text-emerald-800 font-medium">Tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded text-xs font-mono">?</kbd> at any time to see keyboard shortcuts.</p>
            </div>
        </div>
    );
}

/* ── Small helper components ── */
function ChecklistItem({ done = false, children }) {
    return (
        <div className="flex items-start gap-2 text-sm">
            <svg
                className={`w-4 h-4 shrink-0 mt-0.5 ${done ? 'text-emerald-500' : 'text-muted-foreground/40'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
                {done ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
            </svg>
            <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{children}</span>
        </div>
    );
}
