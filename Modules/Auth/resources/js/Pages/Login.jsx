/**
 * Login
 *
 * Single unified login page for Mini CRM.
 * Used by all roles (admin, manager, sales_user) — role-based redirect
 * happens server-side in LoginController after successful authentication.
 *
 * Module : Auth
 * Author : Xgenious (https://xgenious.com)
 */

import { useForm, Head } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <>
            <Head title="Sign In — Mini CRM" />
            <div className="min-h-screen bg-muted flex items-center justify-center px-4">
                <div className="w-full max-w-sm">
                    {/* Logo / Brand */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary mb-4">
                            <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-semibold text-foreground">Mini CRM</h1>
                        <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
                    </div>

                    {/* Card */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                                    placeholder="you@example.com"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-input text-primary"
                                />
                                <label htmlFor="remember" className="text-sm text-muted-foreground">
                                    Remember me
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Signing in…' : 'Sign in'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                        Mini CRM by{' '}
                        <a href="https://xgenious.com" className="underline underline-offset-2 hover:text-foreground">
                            Xgenious
                        </a>
                        {' '}— open source, MIT license
                    </p>
                </div>
            </div>
        </>
    );
}
