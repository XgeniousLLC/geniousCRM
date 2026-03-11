/**
 * TopHeader
 *
 * Top navigation bar for the Mini CRM admin layout.
 * Contains:
 *   • Mobile hamburger toggle
 *   • Global search bar (keyboard shortcut `/` to focus, Escape to close,
 *     300 ms debounce, min 2 chars, results grouped by entity type)
 *   • Dark mode toggle (sun/moon icon, persisted to localStorage)
 *   • Notification bell with unread count badge and dropdown panel
 *   • User avatar / name link to profile
 *   • Logout button
 *
 * Module : Core
 * Author : Xgenious (https://xgenious.com)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

/* ── Dark mode hook — reads/writes localStorage and toggles html.dark ── */
function useDarkMode() {
    const [dark, setDark] = useState(() => {
        try { return localStorage.getItem('theme') === 'dark'; } catch (_) { return false; }
    });

    const toggle = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle('dark', next);
        try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch (_) {}
    };

    return [dark, toggle];
}

export default function TopHeader({ onMenuToggle }) {
    const { auth, settings } = usePage().props;
    const [dark, toggleDark] = useDarkMode();

    function logout() {
        router.post('/logout');
    }

    const initials = auth?.user?.name
        ? auth.user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 gap-3">
            {/* Mobile hamburger */}
            <button
                onClick={onMenuToggle}
                className="md:hidden p-1.5 rounded-md text-muted-foreground hover:bg-accent transition shrink-0"
                aria-label="Toggle menu"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Left: Logo (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
                {settings?.logo && (
                    <img src={`/storage/${settings.logo}`} alt="Logo" className="h-6 w-auto" />
                )}
            </div>

            {/* Center: Global search */}
            <div className="flex-1 max-w-md">
                <GlobalSearch />
            </div>

            {/* Right: Dark mode toggle + Bell + User menu */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Dark mode toggle */}
                <button
                    onClick={toggleDark}
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition"
                    title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                    aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {dark ? (
                        /* Sun icon */
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                    ) : (
                        /* Moon icon */
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                <NotificationBell />

                <Link
                    href="/profile"
                    className="flex items-center gap-2 hover:opacity-80 transition"
                >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                        {initials}
                    </div>
                    <span className="hidden sm:block text-sm text-foreground font-medium truncate max-w-32">
                        {auth?.user?.name}
                    </span>
                </Link>

                <button
                    onClick={logout}
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition"
                    title="Logout"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </header>
    );
}

/* ── Global search bar ── */
const TYPE_COLORS = { Contact: '#6366f1', Lead: '#f59e0b', Deal: '#10b981' };

function GlobalSearch() {
    const inputRef   = useRef(null);
    const wrapRef    = useRef(null);
    const timerRef   = useRef(null);
    const [query,    setQuery]   = useState('');
    const [results,  setResults] = useState(null); // null = closed
    const [loading,  setLoading] = useState(false);

    // `/` key focuses the search input
    useEffect(() => {
        const handler = (e) => {
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setResults(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const runSearch = useCallback(async (q) => {
        if (q.length < 2) { setResults(null); return; }
        setLoading(true);
        try {
            const res = await fetch(`/search?q=${encodeURIComponent(q)}`, {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) setResults(await res.json());
        } catch (_) {
            setResults(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(timerRef.current);
        if (val.length < 2) { setResults(null); return; }
        timerRef.current = setTimeout(() => runSearch(val), 300);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') { setResults(null); setQuery(''); inputRef.current?.blur(); }
    };

    const navigate = (url) => {
        setResults(null);
        setQuery('');
        router.visit(url);
    };

    const allResults = results
        ? [
            ...(results.contacts ?? []),
            ...(results.leads    ?? []),
            ...(results.deals    ?? []),
          ]
        : [];
    const isEmpty = results && allResults.length === 0;

    return (
        <div className="relative" ref={wrapRef}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md bg-background text-sm focus-within:ring-2 focus-within:ring-ring transition">
                <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && runSearch(query)}
                    placeholder="Search… (press /)"
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm min-w-0"
                />
                {loading && (
                    <span className="text-xs text-muted-foreground shrink-0">…</span>
                )}
                {query && !loading && (
                    <button
                        onClick={() => { setQuery(''); setResults(null); }}
                        className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Results dropdown */}
            {results !== null && (
                <div className="absolute left-0 top-full mt-1 w-full min-w-72 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    {isEmpty ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No results for "{query}"</p>
                    ) : (
                        <div className="max-h-80 overflow-y-auto divide-y divide-border">
                            {['Contact', 'Lead', 'Deal'].map((type) => {
                                const group = allResults.filter((r) => r.type === type);
                                if (!group.length) return null;
                                return (
                                    <div key={type}>
                                        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40">
                                            {type}s
                                        </p>
                                        {group.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => navigate(item.url)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent text-left transition"
                                            >
                                                <span
                                                    className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                                                    style={{ backgroundColor: TYPE_COLORS[type] }}
                                                >
                                                    {type[0]}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-sm text-foreground truncate">{item.label}</p>
                                                    {item.sub && (
                                                        <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ── Notification bell with dropdown ── */
function NotificationBell() {
    const { notifications: initialData } = usePage().props;
    const [open, setOpen]       = useState(false);
    const [data, setData]       = useState(initialData ?? { unread_count: 0, recent: [] });
    const dropdownRef           = useRef(null);

    const openAndRefresh = async () => {
        setOpen((prev) => !prev);
        if (!open) {
            try {
                const res = await fetch('/notifications', { headers: { Accept: 'application/json' } });
                if (res.ok) setData(await res.json());
            } catch (_) { /* silent */ }
        }
    };

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markRead = async (id) => {
        try {
            await fetch(`/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '' },
            });
            setData((prev) => ({
                ...prev,
                unread_count: Math.max(0, prev.unread_count - 1),
                recent: prev.recent.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n),
            }));
        } catch (_) { /* silent */ }
    };

    const markAllRead = async () => {
        try {
            await fetch('/notifications/read-all', {
                method: 'PATCH',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '' },
            });
            setData((prev) => ({
                unread_count: 0,
                recent: prev.recent.map((n) => ({ ...n, read_at: new Date().toISOString() })),
            }));
        } catch (_) { /* silent */ }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={openAndRefresh}
                className="relative p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition"
                aria-label="Notifications"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {data.unread_count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center leading-none">
                        {data.unread_count > 99 ? '99+' : data.unread_count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                        <span className="text-sm font-semibold text-foreground">Notifications</span>
                        {data.unread_count > 0 && (
                            <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-border">
                        {data.recent.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No notifications yet.</p>
                        ) : data.recent.map((n) => (
                            <NotificationItem
                                key={n.id}
                                notification={n}
                                onMarkRead={() => markRead(n.id)}
                                onClose={() => setOpen(false)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function NotificationItem({ notification: n, onMarkRead, onClose }) {
    const isUnread = !n.read_at;

    const handleClick = () => {
        if (isUnread) onMarkRead();
        if (n.url) { router.visit(n.url); onClose(); }
    };

    return (
        <div
            onClick={handleClick}
            className={`px-4 py-3 text-sm cursor-pointer hover:bg-sidebar-accent transition ${isUnread ? 'bg-primary/5' : ''}`}
        >
            <div className="flex items-start gap-2">
                {isUnread && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />}
                <div className={isUnread ? '' : 'pl-4'}>
                    <p className="text-foreground leading-snug">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.created_at}</p>
                </div>
            </div>
        </div>
    );
}
