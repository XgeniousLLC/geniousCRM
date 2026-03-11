/**
 * ForgotPassword
 *
 * Displays the forgot-password form where users enter their email address.
 * On submission, a reset link is sent if the email is registered.
 * The status message is intentionally vague for security.
 *
 * Module : Auth
 * Author : Xgenious (https://xgenious.com)
 */

import { useForm, Head, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    function submit(e) {
        e.preventDefault();
        post('/forgot-password');
    }

    return (
        <>
            <Head title="Forgot Password — Mini CRM" />
            <div className="min-h-screen bg-muted flex items-center justify-center px-4">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary mb-4">
                            <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-semibold text-foreground">Forgot Password</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Enter your email and we'll send a reset link.
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        {status && (
                            <div className="mb-4 px-4 py-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring transition"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50"
                            >
                                {processing ? 'Sending…' : 'Send Reset Link'}
                            </button>
                        </form>

                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Remember your password?{' '}
                            <Link href="/login" className="font-medium text-foreground underline underline-offset-2">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
