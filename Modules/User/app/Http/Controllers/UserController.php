<?php

/**
 * UserController
 *
 * Admin user management for Mini CRM.
 * Provides CRUD for all system users, role assignment via Spatie Permission,
 * and account activation/deactivation. Only users with the `admin` role
 * can access these routes.
 *
 * Module  : User
 * Package : Modules\User\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * List all users with their assigned roles.
     * Supports search by name, email, and filter by role.
     */
    public function index(Request $request): Response
    {
        $users = User::with('roles')
            ->when($request->search, fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->when($request->role, fn ($q) => $q->whereHas('roles', fn ($q) => $q->where('name', $request->role)))
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('User/UserList', [
            'users'   => $users,
            'roles'   => Role::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'search' => $request->search,
                'role'   => $request->role,
            ],
        ]);
    }

    /**
     * Create a new user and assign their initial role.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'company'  => ['nullable', 'string', 'max:255'],
            'role'     => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'company'  => $validated['company'] ?? null,
        ]);

        $user->assignRole($validated['role']);

        return back()->with('success', 'User created successfully.');
    }

    /**
     * Update a user's profile info and role assignment.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name'    => ['required', 'string', 'max:255'],
            'email'   => ['required', 'email', 'unique:users,email,' . $user->id],
            'company' => ['nullable', 'string', 'max:255'],
            'role'    => ['required', 'string', 'exists:roles,name'],
        ]);

        $user->update([
            'name'    => $validated['name'],
            'email'   => $validated['email'],
            'company' => $validated['company'] ?? null,
        ]);

        $user->syncRoles([$validated['role']]);

        return back()->with('success', 'User updated successfully.');
    }

    /**
     * Toggle a user's active status (activate or deactivate their account).
     */
    public function toggleActive(User $user): RedirectResponse
    {
        $user->update(['is_active' => ! $user->is_active]);

        return back()->with('success', $user->is_active ? 'User activated.' : 'User deactivated.');
    }

    /**
     * Permanently delete a user.
     * Guards against self-deletion.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        $user->delete();

        return back()->with('success', 'User deleted.');
    }
}
