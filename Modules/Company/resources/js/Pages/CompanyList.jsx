/**
 * CompanyList
 *
 * Displays a searchable, sortable list of CRM companies.
 * Supports create, edit, and delete via inline modals.
 * Each row links to the company detail page.
 *
 * Module : Company
 * Author : Xgenious (https://xgenious.com)
 */

import { useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

export default function CompanyList({ companies, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch]     = useState(filters?.search ?? '');
    const [sort, setSort]         = useState(filters?.sort ?? 'name');
    const [dir, setDir]           = useState(filters?.dir ?? 'asc');
    const [modalOpen, setModalOpen]     = useState(false);
    const [editing, setEditing]         = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const applyFilters = (overrides = {}) => {
        router.get('/companies', { search, sort, dir, ...overrides }, { preserveState: true, replace: true });
    };

    const handleSort = (col) => {
        const newDir = sort === col && dir === 'asc' ? 'desc' : 'asc';
        setSort(col);
        setDir(newDir);
        applyFilters({ sort: col, dir: newDir });
    };

    const openCreate = () => { setEditing(null); setModalOpen(true); };
    const openEdit   = (c) => { setEditing(c); setModalOpen(true); };
    const closeModal = () => { setEditing(null); setModalOpen(false); };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/companies/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <>
            <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold text-foreground">Companies</h1>
                    <button
                        onClick={openCreate}
                        className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:opacity-90 transition"
                    >
                        + New Company
                    </button>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                        {flash.success}
                    </div>
                )}

                {/* Search */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                        placeholder="Search companies…"
                        className="border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-64"
                    />
                    <button
                        onClick={() => applyFilters({ search })}
                        className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-md hover:opacity-90 transition"
                    >
                        Search
                    </button>
                    {search && (
                        <button
                            onClick={() => { setSearch(''); applyFilters({ search: '' }); }}
                            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                                    <SortButton col="name" sort={sort} dir={dir} onClick={handleSort}>Name</SortButton>
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                                    <SortButton col="industry" sort={sort} dir={dir} onClick={handleSort}>Industry</SortButton>
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Website</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contacts</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                                    <SortButton col="created_at" sort={sort} dir={dir} onClick={handleSort}>Created</SortButton>
                                </th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {companies.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No companies found.
                                    </td>
                                </tr>
                            ) : companies.data.map((c) => (
                                <tr key={c.id} className="hover:bg-muted/20 transition">
                                    <td className="px-4 py-3">
                                        <Link href={`/companies/${c.id}`} className="font-medium text-foreground hover:underline">
                                            {c.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.industry ?? '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{c.website ?? '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.phone ?? '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.contacts_count}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(c.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 justify-end">
                                            <button onClick={() => openEdit(c)} className="text-xs text-primary hover:underline">Edit</button>
                                            <button onClick={() => setDeleteTarget(c)} className="text-xs text-destructive hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {companies.last_page > 1 && (
                    <div className="flex items-center gap-2 text-sm">
                        {companies.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className={`px-3 py-1.5 rounded-md border transition ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {modalOpen && (
                <CompanyModal company={editing} onClose={closeModal} />
            )}

            {/* Delete Confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-card border border-border rounded-lg shadow-xl p-6 w-96 space-y-4">
                        <h2 className="text-base font-semibold text-foreground">Delete Company</h2>
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
                            This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1.5 text-sm bg-destructive text-white rounded-md hover:opacity-90 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

CompanyList.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ── Company Create/Edit Modal ── */
function CompanyModal({ company, onClose }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name:     company?.name     ?? '',
        industry: company?.industry ?? '',
        website:  company?.website  ?? '',
        phone:    company?.phone    ?? '',
        address:  company?.address  ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (company) {
            put(`/companies/${company.id}`, { onSuccess: onClose });
        } else {
            post('/companies', { onSuccess: () => { reset(); onClose(); } });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">
                        {company ? 'Edit Company' : 'New Company'}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>
                <form onSubmit={submit} className="p-5 space-y-4">
                    <Field label="Company Name *" error={errors.name}>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={inputCls(errors.name)}
                            placeholder="Acme Corp"
                        />
                    </Field>
                    <Field label="Industry" error={errors.industry}>
                        <input
                            type="text"
                            value={data.industry}
                            onChange={(e) => setData('industry', e.target.value)}
                            className={inputCls(errors.industry)}
                            placeholder="Technology"
                        />
                    </Field>
                    <Field label="Website" error={errors.website}>
                        <input
                            type="text"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value)}
                            className={inputCls(errors.website)}
                            placeholder="https://example.com"
                        />
                    </Field>
                    <Field label="Phone" error={errors.phone}>
                        <input
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className={inputCls(errors.phone)}
                        />
                    </Field>
                    <Field label="Address" error={errors.address}>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            rows={2}
                            className={inputCls(errors.address) + ' resize-none'}
                        />
                    </Field>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition disabled:opacity-60">
                            {company ? 'Save Changes' : 'Create Company'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

function SortButton({ col, sort, dir, onClick, children }) {
    const active = sort === col;
    return (
        <button
            onClick={() => onClick(col)}
            className="flex items-center gap-1 hover:text-foreground transition"
        >
            {children}
            <span className="text-[10px]">
                {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
            </span>
        </button>
    );
}

const inputCls = (err) =>
    `w-full px-3 py-1.5 text-sm border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${err ? 'border-destructive' : 'border-border'}`;
