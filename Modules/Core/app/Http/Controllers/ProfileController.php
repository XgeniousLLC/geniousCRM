<?php

/**
 * ProfileController
 *
 * Manages the currently authenticated user's own profile and password.
 * Users can only edit their own data — no cross-user access is allowed here.
 * Admin-level user management lives in the User module (UserController).
 *
 * Module  : Core
 * Package : Modules\Core\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Core\Http\Controllers\SessionController;

class ProfileController extends Controller
{
    /**
     * Show the profile edit page for the currently authenticated user.
     * Includes 2FA status, active sessions, and available IANA timezones.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Core/Profile', [
            'user' => array_merge(
                $user->only('id', 'name', 'email', 'company', 'timezone'),
                ['two_factor_enabled' => (bool) $user->two_factor_enabled]
            ),
            'timezones'      => \DateTimeZone::listIdentifiers(),
            'twoFactorSetup' => session('2fa_setup'),
            'recoveryCodes'  => session('recovery_codes'),
            'sessions'       => SessionController::getForUser($request),
        ]);
    }

    /**
     * Update the authenticated user's own profile information.
     * Accepts name, email, company, and an optional IANA timezone.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email,' . $request->user()->id],
            'company'  => ['nullable', 'string', 'max:255'],
            'timezone' => ['nullable', 'string', 'timezone'],
        ]);

        $request->user()->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update the authenticated user's password.
     * Requires current password verification before accepting the new password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password changed successfully.');
    }
}
