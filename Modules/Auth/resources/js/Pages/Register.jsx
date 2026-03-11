/**
 * Register
 *
 * New user self-registration page for Mini CRM.
 * On success, the user is assigned the `sales_user` role and redirected
 * to the dashboard. Admins can upgrade the role from the Users page.
 *
 * Module : Auth
 * Author : Xgenious (https://xgenious.com)
 */

import { useForm, Head, Link } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/register');
    }

    return (
        <>
            <Head title="Create Account — Mini CRM" />
            <div className="min-h-screen bg-muted flex items-center justify-center px-4">
                <div className="w-full max-w-sm">
                    {/* Brand */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary mb-4">
                            <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-semibold text-foreground">Create Account</h1>
                        <p className="text-sm text-muted-foreground mt-1">Join Mini CRM — it's free</p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <form onSubmit={submit} className="space-y-4">
                            {[
                                { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', key: 'name' },
                                { id: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com', key: 'email' },
                                { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••', key: 'password' },
                                { id: 'password_confirmation', label: 'Confirm Password', type: 'password', placeholder: '••••••••', key: 'password_confirmation' },
                            ].map(({ id, label, type, placeholder, key }) => (
                                <div key={id}>
                                    <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
                                        {label}
                                    </label>
                                    <input
                                        id={id}
                                        type={type}
                                        value={data[key]}
                                        onChange={(e) => setData(key, e.target.value)}
                                        placeholder={placeholder}
                                        className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring transition"
                                    />
                                    {errors[key] && (
                                        <p className="mt-1 text-xs text-destructive">{errors[key]}</p>
                                    )}
                                </div>
                            ))}

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50"
                            >
                                {processing ? 'Creating account…' : 'Create account'}
                            </button>
                        </form>

                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-foreground underline underline-offset-2">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                        Mini CRM by{' '}
                        <a href="https://xgenious.com" className="underline underline-offset-2 hover:text-foreground">Xgenious</a>
                        {' '}— open source, MIT license
                    </p>
                </div>
            </div>
        </>
    );
}
