<?php

/**
 * LoginController
 *
 * Handles user authentication for Mini CRM.
 * A single login page serves all roles (admin, manager, sales_user).
 * After successful login, users are redirected to their role-appropriate dashboard.
 *
 * Module  : Auth
 * Package : Modules\Auth\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    /**
     * Show the login page.
     * Redirects already-authenticated users to the dashboard.
     */
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Authenticate the user and redirect based on their role.
     * If the user has 2FA enabled, store their ID in the session and
     * redirect to the challenge page instead of the dashboard.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $user = Auth::user();

            // 2FA gate — log back out and send to challenge page
            if ($user->two_factor_enabled) {
                $remember = $request->boolean('remember');
                Auth::logout();
                session(['2fa.user_id' => $user->id, '2fa.remember' => $remember]);

                return redirect()->route('two-factor.challenge');
            }

            $request->session()->regenerate();

            return redirect()->intended(route('dashboard'));
        }

        return back()->withErrors([
            'email' => 'These credentials do not match our records.',
        ])->onlyInput('email');
    }

    /**
     * Log the user out and invalidate their session.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
