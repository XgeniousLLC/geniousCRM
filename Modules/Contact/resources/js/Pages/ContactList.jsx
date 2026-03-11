/**
 * ContactList
 *
 * Displays a searchable, filterable, paginated table of CRM contacts.
 * Supports:
 *   • Inline create/edit modal with duplicate detection
 *   • Per-contact note management (side drawer)
 *   • Row checkboxes with bulk actions (delete, tag, export CSV)
 *   • Column sorting by name, company, or created date
 *   • Tag filter
 *
 * Module : Contact
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

export default function ContactList({ contacts, tags, companies, filters }) {
    const [search,    setSearch]    = useState(filters.search ?? '');
    const [tagFilter, setTagFilter] = useState(filters.tag    ?? '');
    const [sort,      setSort]      = useState(filters.sort   ?? 'created_at');
    const [dir,       setDir]       = useState(filters.dir    ?? 'desc');
    const [showModal, setShowModal] = useState(false);
    const [editing,   setEditing]   = useState(null);
    const [noteContact, setNoteContact] = useState(null);
    const [selected,  setSelected]  = useState([]);  // selected IDs
    const [bulkTag,   setBulkTag]   = useState('');
    const [showBulkTagPicker, setShowBulkTagPicker] = useState(false);

    const applyFilters = (overrides = {}) => {
        setSelected([]);
        router.get('/contacts', { search, tag: tagFilter, sort, dir, ...overrides }, {
            preserveState: true, replace: true,
        });
    };

    const handleSort = (col) => {
        const newDir = sort === col && dir === 'asc' ? 'desc' : 'asc';
        setSort(col); setDir(newDir);
        applyFilters({ sort: col, dir: newDir });
    };

    const openCreate = () => { setEditing(null); setShowModal(true); };
    const openEdit   = (c) => { setEditing(c);   setShowModal(true); };
    const closeModal = () => setShowModal(false);

    const allIds   = contacts.data.map((c) => c.id);
    const allCheck = allIds.length > 0 && allIds.every((id) => selected.includes(id));

    const toggleAll = () => setSelected(allCheck ? [] : allIds);
    const toggleOne = (id) => setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

    const bulkDelete = () => {
        if (!confirm(`Delete ${selected.length} contact(s)?`)) return;
        router.post('/contacts/bulk-destroy', { ids: selected }, {
            onSuccess: () => setSelected([]),
        });
    };

    const bulkApplyTag = () => {
        if (!bulkTag) return;
        router.post('/contacts/bulk-tag', { ids: selected, tag_id: Number(bulkTag) }, {
            onSuccess: () => { setSelected([]); setBulkTag(''); setShowBulkTagPicker(false); },
        });
    };

    const bulkExport = () => {
        window.location = '/contacts/bulk-export?ids=' + selected.join(',');
    };

    const sortIcon = (col) => sort === col ? (dir === 'asc' ? ' ↑' : ' ↓') : ' ↕';

    return (
        <>
            <Head title="Contacts" />

            <div className="space-y-4">
                {/* Page header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-foreground">Contacts</h1>
                    <div className="flex items-center gap-2">
                        <a
                            href="/contacts/import/form"
                            className="px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-sidebar-accent transition"
                        >
                            Import CSV
                        </a>
                        <button
                            onClick={openCreate}
                            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
                        >
                            + Add Contact
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <input
                        type="text"
                        placeholder="Search name, email, company…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                        className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-64"
                    />
                    <select
                        value={tagFilter}
                        onChange={(e) => { setTagFilter(e.target.value); applyFilters({ tag: e.target.value }); }}
                        className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All tags</option>
                        {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button
                        onClick={() => applyFilters({ search })}
                        className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground hover:bg-sidebar-accent transition"
                    >
                        Search
                    </button>
                </div>

                {/* Bulk action toolbar */}
                {selected.length > 0 && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                        <span className="font-medium text-foreground">{selected.length} selected</span>
                        <div className="h-4 w-px bg-border" />
                        <button onClick={bulkDelete} className="text-destructive hover:underline">Delete</button>
                        <div className="relative">
                            <button
                                onClick={() => setShowBulkTagPicker((p) => !p)}
                                className="text-foreground hover:underline"
                            >
                                Assign tag
                            </button>
                            {showBulkTagPicker && (
                                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-md p-2 flex gap-2 z-10 min-w-max">
                                    <select
                                        value={bulkTag}
                                        onChange={(e) => setBulkTag(e.target.value)}
                                        className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
                                    >
                                        <option value="">— pick tag —</option>
                                        {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <button
                                        onClick={bulkApplyTag}
                                        disabled={!bulkTag}
                                        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded disabled:opacity-50"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}
                        </div>
                        <button onClick={bulkExport} className="text-foreground hover:underline">Export CSV</button>
                        <button onClick={() => setSelected([])} className="ml-auto text-muted-foreground hover:text-foreground">✕ Clear</button>
                    </div>
                )}

                {/* Table */}
                <div className="rounded-lg border border-border overflow-hidden bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-4 py-2.5 w-8">
                                    <input type="checkbox" checked={allCheck} onChange={toggleAll} className="rounded border-border" />
                                </th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                                    <SortButton label="Name" col="first_name" sort={sort} dir={dir} onClick={handleSort} />
                                </th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Email</th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">
                                    <SortButton label="Company" col="company" sort={sort} dir={dir} onClick={handleSort} />
                                </th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Tags</th>
                                <th className="px-4 py-2.5 w-32"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {contacts.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-muted-foreground">No contacts found.</td>
                                </tr>
                            ) : contacts.data.map((c) => (
                                <tr key={c.id} className={`hover:bg-sidebar-accent/30 transition ${selected.includes(c.id) ? 'bg-primary/5' : ''}`}>
                                    <td className="px-4 py-2.5">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(c.id)}
                                            onChange={() => toggleOne(c.id)}
                                            className="rounded border-border"
                                        />
                                    </td>
                                    <td className="px-4 py-2.5 font-medium text-foreground">
                                        <Link href={`/contacts/${c.id}`} className="hover:text-primary hover:underline transition">
                                            {c.first_name} {c.last_name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2.5 text-muted-foreground">{c.email ?? '—'}</td>
                                    <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">{c.phone ?? '—'}</td>
                                    <td className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell">{c.company ?? '—'}</td>
                                    <td className="px-4 py-2.5 hidden lg:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {c.tags?.map((t) => (
                                                <span key={t.id} className="px-1.5 py-0.5 rounded text-xs text-white" style={{ backgroundColor: t.color }}>
                                                    {t.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2 justify-end">
                                            <button onClick={() => setNoteContact(c)} className="text-xs text-muted-foreground hover:text-foreground transition">Notes</button>
                                            <button onClick={() => openEdit(c)} className="text-xs text-primary hover:underline">Edit</button>
                                            <DeleteButton contact={c} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {contacts.last_page > 1 && (
                    <div className="flex gap-1">
                        {contacts.links.map((link, i) => (
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

            {/* Create / Edit modal */}
            {showModal && <ContactModal contact={editing} tags={tags} companies={companies} onClose={closeModal} />}

            {/* Notes panel */}
            {noteContact && <NotesPanel contact={noteContact} onClose={() => setNoteContact(null)} />}
        </>
    );
}

ContactList.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ── Sort button ── */
function SortButton({ label, col, sort, dir, onClick }) {
    const active = sort === col;
    return (
        <button
            onClick={() => onClick(col)}
            className={`flex items-center gap-0.5 hover:text-foreground transition ${active ? 'text-foreground' : ''}`}
        >
            {label}
            <span className="text-xs">{active ? (dir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>
        </button>
    );
}

/* ── Delete button ── */
function DeleteButton({ contact }) {
    const { delete: destroy, processing } = useForm();
    const handle = () => {
        if (!confirm(`Delete ${contact.first_name} ${contact.last_name}?`)) return;
        destroy(`/contacts/${contact.id}`);
    };
    return (
        <button onClick={handle} disabled={processing} className="text-xs text-destructive hover:underline disabled:opacity-50">
            Delete
        </button>
    );
}

/* ── Create / Edit Modal ── */
function ContactModal({ contact, tags, companies, onClose }) {
    const { flash } = usePage().props;
    const duplicates = !contact ? (flash?.duplicates ?? null) : null;
    const isEdit = !!contact;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        first_name: contact?.first_name ?? '',
        last_name:  contact?.last_name  ?? '',
        email:      contact?.email      ?? '',
        phone:      contact?.phone      ?? '',
        company:    contact?.company    ?? '',
        company_id: contact?.company_id ?? '',
        notes:      contact?.notes      ?? '',
        tags:       contact?.tags?.map((t) => t.id) ?? [],
    });

    const toggleTag = (id) => {
        setData('tags', data.tags.includes(id) ? data.tags.filter((t) => t !== id) : [...data.tags, id]);
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(`/contacts/${contact.id}`, { onSuccess: onClose });
        } else {
            post('/contacts', {
                preserveState: true,
                onSuccess: (page) => { if (!page.props.flash?.duplicates) { reset(); onClose(); } },
            });
        }
    };

    const continueAnyway = () => {
        router.post('/contacts', { ...data, force: true }, {
            preserveState: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">{isEdit ? 'Edit Contact' : 'New Contact'}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">✕</button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    {duplicates && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2">
                            <p className="text-xs font-semibold text-amber-800">Possible duplicates found:</p>
                            <ul className="space-y-1">
                                {duplicates.map((d) => (
                                    <li key={d.id} className="text-xs text-amber-700">
                                        {d.first_name} {d.last_name}
                                        {d.email ? ` · ${d.email}` : ''}
                                        {d.phone ? ` · ${d.phone}` : ''}
                                    </li>
                                ))}
                            </ul>
                            <button type="button" onClick={continueAnyway} className="text-xs font-medium text-amber-800 underline hover:text-amber-900 transition">
                                Create anyway →
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="First name" error={errors.first_name}>
                            <input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className={input()} />
                        </Field>
                        <Field label="Last name" error={errors.last_name}>
                            <input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className={input()} />
                        </Field>
                    </div>

                    <Field label="Email" error={errors.email}>
                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={input()} />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Phone" error={errors.phone}>
                            <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className={input()} />
                        </Field>
                        <Field label="Company (text)" error={errors.company}>
                            <input value={data.company} onChange={(e) => setData('company', e.target.value)} className={input()} />
                        </Field>
                    </div>

                    {companies?.length > 0 && (
                        <Field label="Link to Company" error={errors.company_id}>
                            <select
                                value={data.company_id}
                                onChange={(e) => setData('company_id', e.target.value)}
                                className={input()}
                            >
                                <option value="">— None —</option>
                                {companies.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </Field>
                    )}

                    <Field label="Notes" error={errors.notes}>
                        <textarea rows={3} value={data.notes} onChange={(e) => setData('notes', e.target.value)} className={input()} />
                    </Field>

                    {tags.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-foreground mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => toggleTag(t.id)}
                                        className={`px-2 py-0.5 rounded text-xs text-white transition ring-2 ${data.tags.includes(t.id) ? 'ring-primary' : 'ring-transparent'}`}
                                        style={{ backgroundColor: t.color }}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-sidebar-accent transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition">
                            {isEdit ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Notes Panel ── */
function NotesPanel({ contact, onClose }) {
    const { data, setData, post, processing, reset } = useForm({ body: '' });

    const submit = (e) => {
        e.preventDefault();
        post(`/contacts/${contact.id}/notes`, { onSuccess: () => reset() });
    };

    const deleteNote = (noteId) => router.delete(`/contacts/${contact.id}/notes/${noteId}`);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative bg-card border-l border-border w-full max-w-sm h-full flex flex-col shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-sm text-foreground">Notes — {contact.first_name} {contact.last_name}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {contact.contact_notes?.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
                    {contact.contact_notes?.map((n) => (
                        <div key={n.id} className="bg-muted/40 rounded-md p-3 text-sm">
                            <p className="text-foreground whitespace-pre-wrap">{n.body}</p>
                            <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs text-muted-foreground">{n.author?.name ?? 'Unknown'}</span>
                                <button onClick={() => deleteNote(n.id)} className="text-xs text-destructive hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={submit} className="p-4 border-t border-border space-y-2">
                    <textarea
                        rows={3}
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        placeholder="Write a note…"
                        className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                    <button
                        type="submit"
                        disabled={processing || !data.body.trim()}
                        className="w-full py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition"
                    >
                        Add Note
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ── helpers ── */
function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
    );
}

function input() {
    return 'w-full px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition';
}
