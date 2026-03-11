/**
 * AppLayout
 *
 * Root admin layout shell for Mini CRM.
 * Composes Sidebar + TopHeader + main content area.
 * Manages sidebar collapsed state and mobile drawer open state.
 * Renders auto-dismissing flash toast notifications (success / error).
 * Handles global keyboard shortcuts:
 *   /  — focus global search bar
 *   ?  — open keyboard shortcuts help modal
 *   N  — open quick-create dropdown
 *   Escape — close help modal / quick-create
 * Wrap any authenticated page with this layout.
 *
 * Usage:
 *   Dashboard.jsx: AppLayout.layout = (page) => <AppLayout>{page}</AppLayout>
 *
 * Module : Core
 * Author : Xgenious (https://xgenious.com)
 */

import { useEffect, useRef, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

/**
 * useKeyboardShortcuts
 *
 * Global keyboard shortcut hook for Mini CRM.
 * Listens for ?, N, and Escape keys at the document level
 * and exposes state for the shortcut help modal and quick-create panel.
 */
function useKeyboardShortcuts() {
    const [showHelp, setShowHelp]         = useState(false);
    const [showQuickCreate, setShowQuickCreate] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            const tag = document.activeElement?.tagName;
            const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
                || document.activeElement?.isContentEditable;

            if (e.key === 'Escape') {
                setShowHelp(false);
                setShowQuickCreate(false);
                return;
            }
            if (inInput) return;

            if (e.key === '?') {
                e.preventDefault();
                setShowHelp((prev) => !prev);
                setShowQuickCreate(false);
            } else if (e.key === 'n' || e.key === 'N') {
                e.preventDefault();
                setShowQuickCreate((prev) => !prev);
                setShowHelp(false);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    return { showHelp, setShowHelp, showQuickCreate, setShowQuickCreate };
}

export default function AppLayout({ children }) {
    const [collapsed, setCollapsed]   = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { auth, flash }             = usePage().props;
    const { showHelp, setShowHelp, showQuickCreate, setShowQuickCreate } = useKeyboardShortcuts();

    const userRoles = auth?.user?.roles?.map((r) => r.name) ?? [];

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop sidebar */}
            <div className="hidden md:flex flex-col shrink-0">
                <Sidebar
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    userRoles={userRoles}
                />
            </div>

            {/* Mobile sidebar drawer */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 z-30 bg-black/40 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 z-40 flex flex-col md:hidden">
                        <Sidebar
                            collapsed={false}
                            onCollapse={() => setMobileOpen(false)}
                            userRoles={userRoles}
                        />
                    </div>
                </>
            )}

            {/* Main area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <TopHeader onMenuToggle={() => setMobileOpen(!mobileOpen)} />

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>

            {/* Flash toast */}
            <FlashToast flash={flash} />

            {/* Keyboard shortcuts help modal */}
            {showHelp && <ShortcutsHelpModal onClose={() => setShowHelp(false)} />}

            {/* Quick-create panel */}
            {showQuickCreate && (
                <QuickCreatePanel onClose={() => setShowQuickCreate(false)} />
            )}
        </div>
    );
}

/* ── Keyboard shortcuts help modal ── */
function ShortcutsHelpModal({ onClose }) {
    const shortcuts = [
        { key: '/', description: 'Focus global search' },
        { key: '?', description: 'Open keyboard shortcuts help' },
        { key: 'N', description: 'Open quick-create panel' },
        { key: 'Esc', description: 'Close modal / panel' },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-foreground">Keyboard Shortcuts</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-muted-foreground hover:bg-accent transition"
                        aria-label="Close"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-3">
                    {shortcuts.map(({ key, description }) => (
                        <div key={key} className="flex items-center justify-between gap-4">
                            <span className="text-sm text-muted-foreground">{description}</span>
                            <kbd className="shrink-0 px-2 py-1 text-xs font-mono bg-muted border border-border rounded-md text-foreground">
                                {key}
                            </kbd>
                        </div>
                    ))}
                </div>
                <p className="mt-5 text-xs text-muted-foreground text-center">
                    Shortcuts are disabled when typing in inputs.
                </p>
            </div>
        </div>
    );
}

/* ── Quick-create panel — N key ── */
const QUICK_CREATE_ITEMS = [
    { label: 'New Contact', href: '/contacts', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'New Lead',    href: '/leads',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'New Deal',    href: '/pipeline', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'New Task',    href: '/tasks',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { label: 'New Company', href: '/companies', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
];

function QuickCreatePanel({ onClose }) {
    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-xs mx-4 overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Create</p>
                </div>
                <div className="py-1">
                    {QUICK_CREATE_ITEMS.map(({ label, href, icon }) => (
                        <button
                            key={href}
                            onClick={() => { onClose(); router.visit(href); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition text-left"
                        >
                            <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                            </svg>
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Flash toast — auto-dismisses after 3 s ── */
function FlashToast({ flash }) {
    const [visible, setVisible] = useState(false);
    const [msg, setMsg]         = useState('');
    const [type, setType]       = useState('success');

    useEffect(() => {
        const message = flash?.success || flash?.error;
        if (!message) return;

        setMsg(message);
        setType(flash?.success ? 'success' : 'error');
        setVisible(true);

        const timer = setTimeout(() => setVisible(false), 3500);
        return () => clearTimeout(timer);
    }, [flash?.success, flash?.error]);

    if (!visible) return null;

    const base = 'fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all';
    const styles = type === 'success'
        ? `${base} bg-emerald-600 text-white`
        : `${base} bg-destructive text-white`;

    return (
        <div className={styles} role="alert">
            <span>{type === 'success' ? '✓' : '✕'}</span>
            <span>{msg}</span>
            <button
                onClick={() => setVisible(false)}
                className="ml-2 opacity-70 hover:opacity-100 text-white"
                aria-label="Dismiss"
            >
                ✕
            </button>
        </div>
    );
}
