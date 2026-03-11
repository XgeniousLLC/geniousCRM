/**
 * ResetPassword Page
 *
 * Displays the new password form after the user clicks the reset link in their email.
 * Submits token + email + new password to complete the password reset flow.
 *
 * Module : Auth
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { useForm, Head } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/reset-password', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Set New Password" />

            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-md">

                    {/* Card */}
                    <div className="bg-card border border-border rounded-xl shadow-sm p-8">

                        {/* Heading */}
                        <div className="mb-6">
                            <h1 className="text-xl font-semibold text-foreground">Set new password</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Choose a strong password for your account.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">

                            {/* Hidden token */}
                            <input type="hidden" value={data.token} />

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    autoComplete="username"
                                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* New password */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    New password
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="At least 8 characters"
                                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Confirm new password
                                </label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="Repeat your password"
                                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                                />
                                {errors.password_confirmation && (
                                    <p className="text-xs text-destructive mt-1">{errors.password_confirmation}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2.5 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {processing ? 'Resetting…' : 'Reset password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
