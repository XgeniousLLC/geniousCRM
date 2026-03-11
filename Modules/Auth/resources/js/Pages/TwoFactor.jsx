/**
 * TwoFactor
 *
 * TOTP challenge page shown after successful password authentication
 * when the user has two-factor authentication enabled.
 * Accepts a 6-digit OTP from an authenticator app or a recovery code.
 *
 * Module : Auth
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function TwoFactor() {
    const [useRecovery, setUseRecovery] = useState(false);
    const { data, setData, post, processing, errors } = useForm({ code: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/two-factor/challenge');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Head title="Two-Factor Authentication" />

            <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-sm p-8 space-y-6">
                {/* Header */}
                <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h1>
                    <p className="text-sm text-muted-foreground">
                        {useRecovery
                            ? 'Enter one of your recovery codes.'
                            : 'Enter the 6-digit code from your authenticator app.'}
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            {useRecovery ? 'Recovery Code' : 'Authentication Code'}
                        </label>
                        <input
                            type={useRecovery ? 'text' : 'text'}
                            inputMode={useRecovery ? 'text' : 'numeric'}
                            maxLength={useRecovery ? undefined : 6}
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            placeholder={useRecovery ? 'XXXXXXXXXX' : '000000'}
                            autoFocus
                            autoComplete="one-time-code"
                            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring transition text-center tracking-widest text-lg font-mono"
                        />
                        {errors.code && (
                            <p className="mt-1 text-xs text-destructive">{errors.code}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing || !data.code}
                        className="w-full py-2 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50"
                    >
                        {processing ? 'Verifying…' : 'Verify'}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => { setUseRecovery(!useRecovery); setData('code', ''); }}
                        className="text-xs text-muted-foreground hover:text-foreground transition"
                    >
                        {useRecovery
                            ? 'Use authenticator app instead'
                            : "Lost access? Use a recovery code"}
                    </button>
                </div>

                <div className="text-center">
                    <a href="/login" className="text-xs text-muted-foreground hover:text-foreground transition">
                        ← Back to login
                    </a>
                </div>
            </div>
        </div>
    );
}
