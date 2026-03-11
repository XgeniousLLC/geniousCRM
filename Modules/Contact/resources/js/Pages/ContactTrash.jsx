/**
 * ContactTrash
 *
 * Displays soft-deleted contacts with restore and force-delete actions.
 * Admin-only view for recovering or permanently removing contacts.
 *
 * Module : Contact
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

export default function ContactTrash({ contacts }) {
    return (
        <>
            <Head title="Contact Trash" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">Contact Trash</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Deleted contacts. Restore to bring them back, or force-delete to remove permanently.
                        </p>
                    </div>
                    <a
                        href="/contacts"
                        className="text-sm text-primary hover:underline"
                    >
                        ← Back to Contacts
                    </a>
                </div>

                <div className="rounded-lg border border-border overflow-hidden bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Name</th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Company</th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Deleted</th>
                                <th className="px-4 py-2.5 w-36"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {contacts.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-muted-foreground">
                                        Trash is empty.
                                    </td>
                                </tr>
                            ) : contacts.data.map((contact) => (
                                <tr key={contact.id} className="hover:bg-sidebar-accent/30 transition">
                                    <td className="px-4 py-2.5 font-medium text-foreground">
                                        {contact.first_name} {contact.last_name}
                                    </td>
                                    <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">
                                        {contact.email ?? '—'}
                                    </td>
                                    <td className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell">
                                        {contact.company ?? '—'}
                                    </td>
                                    <td className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell text-xs">
                                        {contact.deleted_at
                                            ? new Date(contact.deleted_at).toLocaleDateString()
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2 justify-end">
                                            <RestoreButton id={contact.id} url={`/contacts/${contact.id}/restore`} />
                                            <ForceDeleteButton id={contact.id} url={`/contacts/${contact.id}/force`} label="contact" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {contacts.last_page > 1 && (
                    <div className="flex gap-1 flex-wrap">
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
        </>
    );
}

ContactTrash.layout = (page) => <AppLayout>{page}</AppLayout>;

function RestoreButton({ url }) {
    const { patch, processing } = useForm();
    return (
        <button
            onClick={() => patch(url)}
            disabled={processing}
            className="text-xs text-emerald-600 hover:underline disabled:opacity-50"
        >
            Restore
        </button>
    );
}

function ForceDeleteButton({ url, label }) {
    const { delete: destroy, processing } = useForm();
    return (
        <button
            onClick={() => {
                if (!confirm(`Permanently delete this ${label}? This cannot be undone.`)) return;
                destroy(url);
            }}
            disabled={processing}
            className="text-xs text-destructive hover:underline disabled:opacity-50"
        >
            Delete Forever
        </button>
    );
}
