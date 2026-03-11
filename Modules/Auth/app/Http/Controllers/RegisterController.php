<?php

/**
 * RegisterController
 *
 * Handles new user self-registration for Mini CRM.
 * Newly registered users are assigned the `sales_user` role by default.
 * Admins can change the role later via the User module.
 *
 * Module  : Auth
 * Package : Modules\Auth\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    /**
     * Show the registration page.
     * Redirects already-authenticated users to the dashboard.
     */
    public function showRegister(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Register');
    }

    /**
     * Create a new user account and log them in immediately.
     * Assigns the `sales_user` role by default.
     */
    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole('sales_user');

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
