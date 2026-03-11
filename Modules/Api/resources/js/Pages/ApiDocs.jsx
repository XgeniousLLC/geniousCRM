/**
 * ApiDocs
 *
 * In-admin REST API documentation page for Mini CRM.
 * Swagger-inspired layout: left sidebar navigation + expandable endpoint cards.
 * Shows authentication guide, request/response schemas, and copy-to-clipboard URLs.
 * Accessible to all authenticated users.
 *
 * Module : Api
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

/* ── Method badge colours ── */
const METHOD_STYLES = {
    GET:    'bg-blue-100   text-blue-700   border-blue-200',
    POST:   'bg-emerald-100 text-emerald-700 border-emerald-200',
    PUT:    'bg-amber-100   text-amber-700   border-amber-200',
    PATCH:  'bg-amber-100   text-amber-700   border-amber-200',
    DELETE: 'bg-red-100     text-red-700     border-red-200',
};

export default function ApiDocs({ baseUrl, endpoints, version }) {
    const [activeGroup, setActiveGroup]   = useState(endpoints[0]?.group ?? '');
    const [openItems, setOpenItems]       = useState({});
    const [copiedPath, setCopiedPath]     = useState(null);

    const toggleItem = (key) =>
        setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedPath(key);
            setTimeout(() => setCopiedPath(null), 2000);
        });
    };

    const scrollToGroup = (group) => {
        setActiveGroup(group);
        document.getElementById(`group-${group}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <>
            <Head title="API Documentation" />

            <div className="max-w-6xl mx-auto">

                {/* ── Page header ── */}
                <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">API Documentation</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            REST API {version} · Base URL:&nbsp;
                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">{baseUrl}</code>
                        </p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        {version.toUpperCase()} · Live
                    </span>
                </div>

                <div className="flex gap-6 items-start">

                    {/* ── Left sidebar ── */}
                    <aside className="hidden lg:block w-52 shrink-0 sticky top-0">
                        <nav className="bg-card border border-border rounded-lg overflow-hidden">
                            <div className="px-4 py-3 border-b border-border">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sections</p>
                            </div>
                            <ul className="py-1">
                                <li>
                                    <button
                                        onClick={() => document.getElementById('section-overview')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition"
                                    >
                                        Overview
                                    </button>
                                </li>
                                {endpoints.map((group) => (
                                    <li key={group.group}>
                                        <button
                                            onClick={() => scrollToGroup(group.group)}
                                            className={`w-full text-left px-4 py-2 text-sm transition ${
                                                activeGroup === group.group
                                                    ? 'text-primary font-medium bg-primary/5'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                                            }`}
                                        >
                                            {group.group}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>

                    {/* ── Main content ── */}
                    <div className="flex-1 min-w-0 space-y-8">

                        {/* Overview */}
                        <section id="section-overview" className="bg-card border border-border rounded-lg overflow-hidden">
                            <div className="px-5 py-4 border-b border-border bg-muted/30">
                                <h2 className="font-semibold text-foreground">Overview</h2>
                            </div>
                            <div className="p-5 space-y-5">

                                {/* Auth guide */}
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground mb-2">Authentication</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        All protected endpoints require a <strong>Bearer token</strong> obtained via <code className="bg-muted px-1 rounded text-xs">POST /api/v1/login</code>.
                                        Include the token in every request header:
                                    </p>
                                    <CodeBlock code={`Authorization: Bearer YOUR_TOKEN_HERE\nContent-Type: application/json\nAccept: application/json`} language="http" />
                                </div>

                                {/* Rate limits */}
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground mb-2">Rate Limiting</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-muted/40 rounded-md p-3">
                                            <p className="text-xs font-semibold text-foreground mb-0.5">Public endpoints</p>
                                            <p className="text-xs text-muted-foreground">60 requests / minute per IP</p>
                                            <p className="text-xs text-muted-foreground">login, register</p>
                                        </div>
                                        <div className="bg-muted/40 rounded-md p-3">
                                            <p className="text-xs font-semibold text-foreground mb-0.5">Authenticated endpoints</p>
                                            <p className="text-xs text-muted-foreground">120 requests / minute per user</p>
                                            <p className="text-xs text-muted-foreground">all resource endpoints</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Error format */}
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground mb-2">Error Responses</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { code: 401, label: 'Unauthenticated', body: '{"message":"Unauthenticated."}' },
                                            { code: 403, label: 'Forbidden',       body: '{"message":"Forbidden."}' },
                                            { code: 404, label: 'Not Found',       body: '{"message":"Resource not found."}' },
                                            { code: 422, label: 'Validation Error', body: '{"message":"Validation failed.","errors":{"email":["The email field is required."]}}' },
                                            { code: 429, label: 'Too Many Requests', body: '{"message":"Too Many Attempts."}' },
                                        ].map(({ code, label, body }) => (
                                            <div key={code} className="flex items-start gap-2 bg-muted/40 rounded-md p-3">
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${code < 500 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{code}</span>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-foreground">{label}</p>
                                                    <code className="text-xs text-muted-foreground break-all">{body}</code>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pagination */}
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground mb-2">Pagination</h3>
                                    <p className="text-sm text-muted-foreground mb-2">All list endpoints return paginated responses (15 items/page):</p>
                                    <CodeBlock code={JSON.stringify({
                                        data: ['...items...'],
                                        links: { first: '...', last: '...', prev: null, next: '...' },
                                        meta: { current_page: 1, last_page: 5, per_page: 15, total: 72 },
                                    }, null, 2)} language="json" />
                                </div>
                            </div>
                        </section>

                        {/* Endpoint groups */}
                        {endpoints.map((group) => (
                            <section key={group.group} id={`group-${group.group}`}>
                                <div className="mb-3 flex items-center gap-3">
                                    <h2 className="text-base font-bold text-foreground">{group.group}</h2>
                                    <div className="flex-1 h-px bg-border" />
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">{group.description}</p>

                                <div className="space-y-2">
                                    {group.items.map((ep, idx) => {
                                        const key     = `${group.group}-${idx}`;
                                        const isOpen  = openItems[key] ?? false;
                                        const fullUrl = `${baseUrl}${ep.path.replace('/api/v1', '')}`;
                                        const copied  = copiedPath === key;

                                        return (
                                            <div
                                                key={key}
                                                className="bg-card border border-border rounded-lg overflow-hidden"
                                            >
                                                {/* Endpoint header row */}
                                                <button
                                                    onClick={() => toggleItem(key)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition text-left"
                                                >
                                                    <MethodBadge method={ep.method} />
                                                    <code className="text-sm font-mono text-foreground flex-1 min-w-0 truncate">{ep.path}</code>
                                                    {ep.auth && (
                                                        <span className="hidden sm:inline text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                                                            🔒 Bearer
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">{ep.summary}</span>
                                                    <svg
                                                        className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                {/* Expanded details */}
                                                {isOpen && (
                                                    <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/10">

                                                        {/* Summary + copy URL */}
                                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                                            <p className="text-sm text-muted-foreground">{ep.summary}</p>
                                                            <button
                                                                onClick={() => copyToClipboard(fullUrl, key)}
                                                                className={`text-xs px-2.5 py-1 rounded border transition shrink-0 ${
                                                                    copied
                                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                                        : 'border-border text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                                                                }`}
                                                            >
                                                                {copied ? '✓ Copied' : 'Copy URL'}
                                                            </button>
                                                        </div>

                                                        {/* Full URL */}
                                                        <div>
                                                            <Label>Full URL</Label>
                                                            <CodeBlock code={fullUrl} language="text" compact />
                                                        </div>

                                                        {/* Query params */}
                                                        {ep.query && Object.keys(ep.query).length > 0 && (
                                                            <div>
                                                                <Label>Query Parameters</Label>
                                                                <ParamTable params={ep.query} />
                                                            </div>
                                                        )}

                                                        {/* Request body */}
                                                        {ep.body && Object.keys(ep.body).length > 0 && (
                                                            <div>
                                                                <Label>Request Body <span className="font-normal text-muted-foreground">(JSON)</span></Label>
                                                                <ParamTable params={ep.body} />
                                                            </div>
                                                        )}

                                                        {/* Example curl */}
                                                        <div>
                                                            <Label>Example cURL</Label>
                                                            <CodeBlock code={buildCurl(ep, fullUrl)} language="bash" />
                                                        </div>

                                                        {/* Response */}
                                                        <div>
                                                            <Label>
                                                                Response&nbsp;
                                                                <span className="font-normal text-muted-foreground">
                                                                    ({ep.status})
                                                                </span>
                                                            </Label>
                                                            <CodeBlock code={JSON.stringify(ep.response, null, 2)} language="json" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}

                    </div>
                </div>
            </div>
        </>
    );
}

ApiDocs.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ── Method badge ── */
function MethodBadge({ method }) {
    const cls = METHOD_STYLES[method] ?? 'bg-muted text-foreground border-border';
    return (
        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border w-16 text-center shrink-0 ${cls}`}>
            {method}
        </span>
    );
}

/* ── Section label ── */
function Label({ children }) {
    return <p className="text-xs font-semibold text-foreground mb-1.5">{children}</p>;
}

/* ── Parameter table ── */
function ParamTable({ params }) {
    return (
        <div className="rounded-md border border-border overflow-hidden text-xs">
            <table className="w-full">
                <thead>
                    <tr className="bg-muted/50 text-left">
                        <th className="px-3 py-2 font-semibold text-muted-foreground w-1/3">Parameter</th>
                        <th className="px-3 py-2 font-semibold text-muted-foreground">Type / Description</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {Object.entries(params).map(([key, desc]) => (
                        <tr key={key} className="bg-card">
                            <td className="px-3 py-2 font-mono text-foreground">{key}</td>
                            <td className="px-3 py-2 text-muted-foreground">{desc}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ── Code block ── */
function CodeBlock({ code, language, compact = false }) {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="relative group rounded-md overflow-hidden border border-border">
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b border-border">
                <span className="text-xs text-muted-foreground font-mono">{language}</span>
                <button
                    onClick={copy}
                    className={`text-xs transition ${copied ? 'text-emerald-600' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    {copied ? '✓ Copied' : 'Copy'}
                </button>
            </div>
            <pre className={`px-3 font-mono text-xs text-foreground overflow-x-auto bg-card ${compact ? 'py-2' : 'py-3'}`}>
                <code>{code}</code>
            </pre>
        </div>
    );
}

/* ── Build example cURL ── */
function buildCurl(ep, url) {
    const lines = [`curl -X ${ep.method} "${url}"`];

    if (ep.auth) {
        lines.push(`  -H "Authorization: Bearer YOUR_TOKEN"`);
    }

    lines.push(`  -H "Content-Type: application/json"`);
    lines.push(`  -H "Accept: application/json"`);

    if (ep.body && Object.keys(ep.body).length > 0) {
        const example = {};
        for (const [k, v] of Object.entries(ep.body)) {
            // Extract a sensible placeholder from the description
            if (v.includes('required') && !v.includes('optional')) {
                example[k] = v.startsWith('integer') ? 1 : v.startsWith('number') ? 100 : v.startsWith('date') ? '2026-03-15' : v.startsWith('array') ? [] : 'example';
            }
        }
        if (Object.keys(example).length > 0) {
            lines.push(`  -d '${JSON.stringify(example)}'`);
        }
    }

    return lines.join(' \\\n');
}
