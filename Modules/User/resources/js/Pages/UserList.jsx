/**
 * UserList
 *
 * Admin page showing all Mini CRM users in a searchable, filterable table.
 * Supports inline create (modal) and edit, deactivate/activate, and delete.
 * Role assignment is done via the role dropdown in the create/edit form.
 *
 * Module : User
 * Author : Xgenious (https://xgenious.com)
 */

import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

export default function UserList({ users, roles, filters }) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        company: '',
        role: roles[0]?.name ?? '',
    });

    function openCreate() {
        form.reset();
        setEditing(null);
        setShowForm(true);
    }

    function openEdit(user) {
        form.setData({
            name: user.name,
            email: user.email,
            password: '',
            company: user.company ?? '',
            role: user.roles[0]?.name ?? roles[0]?.name ?? '',
        });
        setEditing(user);
        setShowForm(true);
    }

    function submit(e) {
        e.preventDefault();
        if (editing) {
            form.patch(`/users/${editing.id}`, { onSuccess: () => setShowForm(false) });
        } else {
            form.post('/users', { onSuccess: () => setShowForm(false) });
        }
    }

    function toggleActive(user) {
        router.patch(`/users/${user.id}/toggle-active`);
    }

    function deleteUser(user) {
        if (confirm(`Delete ${user.name}? This cannot be undone.`)) {
            router.delete(`/users/${user.id}`);
        }
    }

    function search(e) {
        router.get('/users', { ...filters, search: e.target.value }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Users" />
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">Users</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage system users and roles.</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                    >
                        + New User
                    </button>
                </div>

                {/* Search */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        defaultValue={filters.search}
                        onChange={search}
                        placeholder="Search by name or email…"
                        className="px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring w-64"
                    />
                    <select
                        defaultValue={filters.role}
                        onChange={(e) => router.get('/users', { ...filters, role: e.target.value }, { preserveState: true, replace: true })}
                        className="px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All Roles</option>
                        {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/20">
                                    <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                    <td className="px-4 py-3">
                                        {user.roles[0] && (
                                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground rounded">
                                                {user.roles[0].name}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${
                                            user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-flex items-center gap-1">
                                            <button onClick={() => openEdit(user)} className="px-2 py-1 text-xs rounded hover:bg-accent transition">Edit</button>
                                            <button onClick={() => toggleActive(user)} className="px-2 py-1 text-xs rounded hover:bg-accent transition">
                                                {user.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button onClick={() => deleteUser(user)} className="px-2 py-1 text-xs rounded text-destructive hover:bg-destructive/10 transition">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.links && (
                    <div className="flex gap-1">
                        {users.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 text-xs rounded border ${link.active ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-accent'} disabled:opacity-40`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <h2 className="text-sm font-semibold">{editing ? 'Edit User' : 'New User'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                        <form onSubmit={submit} className="p-5 space-y-4">
                            {[
                                { label: 'Full Name', key: 'name', type: 'text' },
                                { label: 'Email', key: 'email', type: 'email' },
                                { label: 'Company', key: 'company', type: 'text' },
                                ...(!editing ? [{ label: 'Password', key: 'password', type: 'password' }] : []),
                            ].map(({ label, key, type }) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium mb-1.5">{label}</label>
                                    <input
                                        type={type}
                                        value={form.data[key]}
                                        onChange={(e) => form.setData(key, e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring"
                                    />
                                    {form.errors[key] && <p className="mt-1 text-xs text-destructive">{form.errors[key]}</p>}
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Role</label>
                                <select
                                    value={form.data.role}
                                    onChange={(e) => form.setData('role', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring"
                                >
                                    {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-sm border border-border rounded-md hover:bg-accent">Cancel</button>
                                <button type="submit" disabled={form.processing} className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50">
                                    {form.processing ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

UserList.layout = (page) => <AppLayout>{page}</AppLayout>;
