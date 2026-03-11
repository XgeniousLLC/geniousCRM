/**
 * RoleForm
 *
 * Create or edit a Spatie role with permission checkboxes.
 * When `role` prop is null, the form creates a new role.
 * When `role` is provided, the form edits the existing role.
 *
 * Module : User
 * Author : Xgenious (https://xgenious.com)
 */

import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@modules/Core/resources/js/Components/Layout/AppLayout';

export default function RoleForm({ role, permissions }) {
    const isEditing = !!role;

    const { data, setData, post, patch, processing, errors } = useForm({
        name: role?.name ?? '',
        permissions: role?.permissions?.map((p) => p.name) ?? [],
    });

    function submit(e) {
        e.preventDefault();
        if (isEditing) {
            patch(`/roles/${role.id}`);
        } else {
            post('/roles');
        }
    }

    function togglePermission(name) {
        setData('permissions',
            data.permissions.includes(name)
                ? data.permissions.filter((p) => p !== name)
                : [...data.permissions, name]
        );
    }

    // Group permissions by module prefix (e.g. "view contacts" → "contacts")
    const grouped = permissions.reduce((acc, perm) => {
        const parts = perm.name.split(' ');
        const group = parts.length > 1 ? parts[parts.length - 1] : 'general';
        if (!acc[group]) acc[group] = [];
        acc[group].push(perm);
        return acc;
    }, {});

    return (
        <>
            <Head title={isEditing ? 'Edit Role' : 'New Role'} />
            <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/roles" className="text-muted-foreground hover:text-foreground text-sm">← Roles</Link>
                    <h1 className="text-lg font-semibold text-foreground">
                        {isEditing ? `Edit: ${role.name}` : 'New Role'}
                    </h1>
                </div>

                <form onSubmit={submit} className="bg-card border border-border rounded-lg p-6 space-y-5">
                    {/* Role Name */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Role Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g. manager"
                        />
                        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                    </div>

                    {/* Permissions */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-3">Permissions</label>
                        {Object.entries(grouped).map(([group, perms]) => (
                            <div key={group} className="mb-4">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 capitalize">{group}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {perms.map((perm) => (
                                        <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.permissions.includes(perm.name)}
                                                onChange={() => togglePermission(perm.name)}
                                                className="h-4 w-4 rounded border-input text-primary"
                                            />
                                            <span className="text-sm text-foreground">{perm.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {permissions.length === 0 && (
                            <p className="text-sm text-muted-foreground">No permissions seeded yet. Run the permission seeder first.</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Link href="/roles" className="px-3 py-2 text-sm border border-border rounded-md hover:bg-accent">Cancel</Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : isEditing ? 'Update Role' : 'Create Role'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

RoleForm.layout = (page) => <AppLayout>{page}</AppLayout>;
