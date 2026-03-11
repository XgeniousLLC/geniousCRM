<?php

/**
 * RoleController
 *
 * Manages Spatie roles and permissions for Mini CRM.
 * Admins can create/edit roles, assign permissions via checkboxes,
 * and delete roles that are not currently assigned to any user.
 *
 * Module  : User
 * Package : Modules\User\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * List all roles with their permission counts.
     */
    public function index(): Response
    {
        return Inertia::render('User/RoleList', [
            'roles' => Role::withCount('permissions')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the create role form with all available permissions as checkboxes.
     */
    public function create(): Response
    {
        return Inertia::render('User/RoleForm', [
            'permissions' => Permission::orderBy('name')->get(['id', 'name']),
            'role'        => null,
        ]);
    }

    /**
     * Create a new role and assign the selected permissions.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:100', 'unique:roles,name'],
            'permissions' => ['array'],
            'permissions.*' => ['exists:permissions,name'],
        ]);

        $role = Role::create(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('roles.index')->with('success', 'Role created successfully.');
    }

    /**
     * Show the edit form for an existing role pre-filled with its permissions.
     */
    public function edit(Role $role): Response
    {
        return Inertia::render('User/RoleForm', [
            'role'        => $role->load('permissions'),
            'permissions' => Permission::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update a role's name and sync its permissions.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:100', 'unique:roles,name,' . $role->id],
            'permissions'   => ['array'],
            'permissions.*' => ['exists:permissions,name'],
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
    }

    /**
     * Delete a role. Guards against deleting roles that are still assigned to users.
     */
    public function destroy(Role $role): RedirectResponse
    {
        if ($role->users()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete a role that is assigned to users.']);
        }

        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Role deleted.');
    }
}
