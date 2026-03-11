/**
 * RoleList
 *
 * Admin page listing all Spatie roles with their permission counts.
 * Links to create/edit role forms.
 *
 * Module : User
 * Author : Xgenious (https://xgenious.com)
 */

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

export default function RoleList({ roles }) {
    function deleteRole(role) {
        if (confirm(`Delete role "${role.name}"?`)) {
            router.delete(`/roles/${role.id}`);
        }
    }

    return (
        <>
            <Head title="Roles" />
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">Roles & Permissions</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage roles and their permission sets.</p>
                    </div>
                    <Link
                        href="/roles/create"
                        className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                    >
                        + New Role
                    </Link>
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role Name</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Permissions</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {roles.map((role) => (
                                <tr key={role.id} className="hover:bg-muted/20">
                                    <td className="px-4 py-3 font-medium text-foreground capitalize">{role.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{role.permissions_count}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-flex gap-1">
                                            <Link href={`/roles/${role.id}/edit`} className="px-2 py-1 text-xs rounded hover:bg-accent transition">Edit</Link>
                                            <button onClick={() => deleteRole(role)} className="px-2 py-1 text-xs rounded text-destructive hover:bg-destructive/10 transition">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

RoleList.layout = (page) => <AppLayout>{page}</AppLayout>;
