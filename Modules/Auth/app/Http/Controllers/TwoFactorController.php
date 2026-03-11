<?php

/**
 * TwoFactorController
 *
 * Manages TOTP-based two-factor authentication for Mini CRM users.
 * Users enable 2FA from their profile page; on next login they are
 * redirected to a challenge page before gaining access.
 *
 * Flow:
 *   1. User enables 2FA on Profile → secret generated, QR code shown
 *   2. User scans QR code with Authenticator app and confirms with OTP
 *   3. Recovery codes shown once — user stores them safely
 *   4. On subsequent logins: credentials OK → 2FA challenge → dashboard
 *
 * Routes (all require auth except the challenge):
 *   POST   /two-factor/enable           — generate secret, show QR
 *   POST   /two-factor/confirm          — verify OTP and activate
 *   DELETE /two-factor/disable          — deactivate 2FA
 *   GET    /two-factor/challenge        — show challenge form (guest session)
 *   POST   /two-factor/challenge        — verify OTP or recovery code
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
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use PragmaRX\Google2FALaravel\Support\Authenticator;

class TwoFactorController extends Controller
{
    /**
     * Generate a new TOTP secret and return QR code SVG for the profile page.
     * The secret is stored on the user but 2FA is NOT yet enabled until confirmed.
     */
    public function enable(Request $request): RedirectResponse
    {
        $google2fa = app('pragmarx.google2fa');
        $secret    = $google2fa->generateSecretKey();

        $request->user()->update([
            'two_factor_secret'  => encrypt($secret),
            'two_factor_enabled' => false,
        ]);

        return back()->with('2fa_setup', [
            'secret' => $secret,
            'qr_url' => $google2fa->getQRCodeUrl(
                config('app.name'),
                $request->user()->email,
                $secret
            ),
        ]);
    }

    /**
     * Confirm that the user has scanned the QR code by verifying the first OTP.
     * On success: 2FA is activated and recovery codes are generated and shown.
     */
    public function confirm(Request $request): RedirectResponse
    {
        $request->validate(['code' => 'required|string|digits:6']);

        $user   = $request->user();
        $secret = decrypt($user->two_factor_secret);

        if (! app('pragmarx.google2fa')->verifyKey($secret, $request->code)) {
            return back()->withErrors(['code' => 'Invalid verification code. Please try again.']);
        }

        // Generate 8 recovery codes
        $plain    = collect(range(1, 8))->map(fn() => strtoupper(substr(str_replace(['+', '/', '='], '', base64_encode(random_bytes(10))), 0, 10)))->all();
        $hashed   = array_map(fn($c) => Hash::make($c), $plain);

        $user->update([
            'two_factor_enabled'        => true,
            'two_factor_recovery_codes' => json_encode($hashed),
        ]);

        return back()->with('recovery_codes', $plain);
    }

    /**
     * Disable 2FA for the current user and clear all 2FA data.
     */
    public function disable(Request $request): RedirectResponse
    {
        $request->user()->update([
            'two_factor_secret'         => null,
            'two_factor_enabled'        => false,
            'two_factor_recovery_codes' => null,
        ]);

        return back()->with('success', 'Two-factor authentication disabled.');
    }

    /**
     * Show the 2FA challenge page after successful password authentication.
     * Requires a pending user ID stored in the session by LoginController.
     */
    public function showChallenge(): Response|RedirectResponse
    {
        if (! session()->has('2fa.user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactor');
    }

    /**
     * Verify the OTP (or recovery code) submitted on the challenge page.
     * On success: log the user in and clear the 2FA session state.
     */
    public function verifyChallenge(Request $request): RedirectResponse
    {
        $request->validate(['code' => 'required|string']);

        $userId = session('2fa.user_id');
        if (! $userId) {
            return redirect()->route('login');
        }

        $user   = \App\Models\User::findOrFail($userId);
        $secret = decrypt($user->two_factor_secret);
        $code   = trim($request->code);

        // Try TOTP first, then recovery codes
        $valid = app('pragmarx.google2fa')->verifyKey($secret, $code);

        if (! $valid) {
            $valid = $this->tryRecoveryCode($user, $code);
        }

        if (! $valid) {
            return back()->withErrors(['code' => 'Invalid code. Please try again.']);
        }

        Auth::loginUsingId($userId, session('2fa.remember', false));
        session()->forget(['2fa.user_id', '2fa.remember']);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Attempt to match a plaintext recovery code against the stored hashed codes.
     * Burns (removes) the code if matched.
     */
    private function tryRecoveryCode(\App\Models\User $user, string $input): bool
    {
        $hashed = json_decode($user->two_factor_recovery_codes ?? '[]', true);

        foreach ($hashed as $i => $hash) {
            if (Hash::check(strtoupper($input), $hash)) {
                unset($hashed[$i]);
                $user->update(['two_factor_recovery_codes' => json_encode(array_values($hashed))]);
                return true;
            }
        }

        return false;
    }
}
