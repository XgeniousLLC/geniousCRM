/**
 * Profile
 *
 * Allows the currently authenticated user to update their own profile
 * information (name, email, company), change their password,
 * manage two-factor authentication (enable/disable, QR code, recovery codes),
 * and view/revoke active login sessions.
 *
 * Module : Core
 * Author : Xgenious (https://xgenious.com)
 */

import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../Components/Layout/AppLayout';

export default function Profile({ user, timezones = [], twoFactorSetup, recoveryCodes, sessions }) {
    const profileForm = useForm({
        name:     user.name     ?? '',
        email:    user.email    ?? '',
        company:  user.company  ?? '',
        timezone: user.timezone ?? '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function updateProfile(e) {
        e.preventDefault();
        profileForm.patch('/profile');
    }

    function updatePassword(e) {
        e.preventDefault();
        passwordForm.patch('/profile/password', {
            onSuccess: () => passwordForm.reset(),
        });
    }

    return (
        <>
            <Head title="Profile" />
            <div className="max-w-2xl space-y-6">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Profile</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage your account information and security.</p>
                </div>

                {/* Profile info */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-sm font-semibold text-foreground mb-4">Personal Information</h2>
                    <form onSubmit={updateProfile} className="space-y-4">
                        <Field label="Full Name" error={profileForm.errors.name}>
                            <input
                                type="text"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Email" error={profileForm.errors.email}>
                            <input
                                type="email"
                                value={profileForm.data.email}
                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Company" error={profileForm.errors.company}>
                            <input
                                type="text"
                                value={profileForm.data.company}
                                onChange={(e) => profileForm.setData('company', e.target.value)}
                                className={inputClass}
                                placeholder="Optional"
                            />
                        </Field>
                        <Field label="Timezone" error={profileForm.errors.timezone}>
                            <select
                                value={profileForm.data.timezone}
                                onChange={(e) => profileForm.setData('timezone', e.target.value)}
                                className={inputClass}
                            >
                                <option value="">-- System default --</option>
                                {timezones.map((tz) => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </Field>
                        <div className="flex justify-end">
                            <SaveButton processing={profileForm.processing} />
                        </div>
                    </form>
                </div>

                {/* Password change */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-sm font-semibold text-foreground mb-4">Change Password</h2>
                    <form onSubmit={updatePassword} className="space-y-4">
                        <Field label="Current Password" error={passwordForm.errors.current_password}>
                            <input
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="New Password" error={passwordForm.errors.password}>
                            <input
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Confirm New Password" error={passwordForm.errors.password_confirmation}>
                            <input
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                        <div className="flex justify-end">
                            <SaveButton processing={passwordForm.processing} label="Change Password" />
                        </div>
                    </form>
                </div>

                {/* Two-Factor Authentication */}
                <TwoFactorSection
                    enabled={user.two_factor_enabled}
                    setup={twoFactorSetup}
                    recoveryCodes={recoveryCodes}
                />

                {/* Active Sessions */}
                <SessionsSection sessions={sessions ?? []} />
            </div>
        </>
    );
}

Profile.layout = (page) => <AppLayout>{page}</AppLayout>;

/* ── Two-Factor Authentication Section ── */
function TwoFactorSection({ enabled, setup, recoveryCodes }) {
    const confirmForm = useForm({ code: '' });
    const [showRecovery, setShowRecovery] = useState(!!recoveryCodes);

    const handleEnable = () => router.post('/two-factor/enable');
    const handleDisable = () => {
        if (!confirm('Disable two-factor authentication? This will make your account less secure.')) return;
        router.delete('/two-factor/disable');
    };
    const handleConfirm = (e) => {
        e.preventDefault();
        confirmForm.post('/two-factor/confirm', {
            onSuccess: () => { confirmForm.reset(); setShowRecovery(true); },
        });
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">Two-Factor Authentication</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Add an extra layer of security with a TOTP authenticator app.
                    </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                }`}>
                    {enabled ? 'Enabled' : 'Disabled'}
                </span>
            </div>

            {/* Recovery codes — shown once after enabling */}
            {recoveryCodes && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 space-y-2">
                    <p className="text-xs font-semibold text-amber-800">Save your recovery codes now — they won't be shown again.</p>
                    <div className="grid grid-cols-2 gap-1">
                        {recoveryCodes.map((code) => (
                            <code key={code} className="text-xs font-mono bg-white border border-amber-200 rounded px-2 py-1 text-amber-900">
                                {code}
                            </code>
                        ))}
                    </div>
                </div>
            )}

            {/* QR code setup — shown after clicking Enable */}
            {setup && !enabled && (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code below to confirm.
                    </p>
                    <div className="flex justify-center">
                        <QrCode url={setup.qr_url} />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                        Manual key: <code className="font-mono bg-muted px-1 rounded">{setup.secret}</code>
                    </p>
                    <form onSubmit={handleConfirm} className="flex gap-2">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={confirmForm.data.code}
                            onChange={(e) => confirmForm.setData('code', e.target.value)}
                            placeholder="000000"
                            className={`${inputClass} text-center font-mono tracking-widest flex-1`}
                        />
                        <button
                            type="submit"
                            disabled={confirmForm.processing || !confirmForm.data.code}
                            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition"
                        >
                            Confirm
                        </button>
                    </form>
                    {confirmForm.errors.code && (
                        <p className="text-xs text-destructive">{confirmForm.errors.code}</p>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                {!enabled && !setup && (
                    <button
                        onClick={handleEnable}
                        className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
                    >
                        Enable 2FA
                    </button>
                )}
                {enabled && (
                    <button
                        onClick={handleDisable}
                        className="px-4 py-1.5 text-sm border border-destructive text-destructive rounded-md hover:bg-destructive/5 transition"
                    >
                        Disable 2FA
                    </button>
                )}
            </div>
        </div>
    );
}

/* ── QR Code via Google Chart API (no external dependency in JS) ── */
function QrCode({ url }) {
    const encoded = encodeURIComponent(url);
    return (
        <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encoded}`}
            alt="2FA QR Code"
            className="w-44 h-44 rounded-md border border-border"
        />
    );
}

/* ── Active Sessions Section ── */
function SessionsSection({ sessions }) {
    const revokeOthers = () => {
        if (!confirm('Log out all other devices?')) return;
        router.delete('/sessions/revoke-others');
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">Active Sessions</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        All devices currently logged in to your account.
                    </p>
                </div>
                {sessions.length > 1 && (
                    <button
                        onClick={revokeOthers}
                        className="text-xs text-destructive hover:underline"
                    >
                        Log out other devices
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {sessions.length === 0 && (
                    <p className="text-sm text-muted-foreground">No session data available.</p>
                )}
                {sessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${s.is_current ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                            <div className="min-w-0">
                                <p className="text-sm text-foreground truncate">{s.ip_address}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-xs">{s.user_agent}</p>
                                <p className="text-xs text-muted-foreground">{s.last_active}</p>
                            </div>
                        </div>
                        <div className="shrink-0 ml-3">
                            {s.is_current ? (
                                <span className="text-xs text-emerald-600 font-medium">Current</span>
                            ) : (
                                <button
                                    onClick={() => router.delete(`/sessions/${s.id}/revoke`)}
                                    className="text-xs text-destructive hover:underline"
                                >
                                    Revoke
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- small reusable sub-components ---

const inputClass =
    'w-full px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring transition';

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
    );
}

function SaveButton({ processing, label = 'Save Changes' }) {
    return (
        <button
            type="submit"
            disabled={processing}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50"
        >
            {processing ? 'Saving…' : label}
        </button>
    );
}
