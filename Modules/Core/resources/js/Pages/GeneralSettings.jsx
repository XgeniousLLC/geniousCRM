/**
 * GeneralSettings
 *
 * Admin-only page to configure global application settings for Mini CRM.
 * Includes: app title, meta description, meta keywords, logo upload, favicon upload.
 * Settings are stored in the `settings` table and cached globally.
 *
 * Module : Core
 * Author : Xgenious (https://xgenious.com)
 */

import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../Components/Layout/AppLayout';

export default function GeneralSettings({ settings }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH',
        app_title: settings.app_title ?? '',
        meta_description: settings.meta_description ?? '',
        meta_keywords: settings.meta_keywords ?? '',
        logo: null,
        favicon: null,
    });

    function submit(e) {
        e.preventDefault();
        post('/settings', { forceFormData: true });
    }

    return (
        <>
            <Head title="General Settings" />
            <div className="max-w-2xl space-y-6">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">General Settings</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Configure the application title, meta info, logo and favicon.
                    </p>
                </div>

                {flash?.success && (
                    <div className="px-4 py-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
                        {flash.success}
                    </div>
                )}

                <div className="bg-card border border-border rounded-lg p-6">
                    <form onSubmit={submit} className="space-y-5">
                        {/* App Title */}
                        <Field label="Application Title" error={errors.app_title}>
                            <input
                                type="text"
                                value={data.app_title}
                                onChange={(e) => setData('app_title', e.target.value)}
                                className={inputClass}
                                placeholder="Mini CRM"
                            />
                        </Field>

                        {/* Meta Description */}
                        <Field label="Meta Description" error={errors.meta_description}>
                            <textarea
                                value={data.meta_description}
                                onChange={(e) => setData('meta_description', e.target.value)}
                                rows={3}
                                className={inputClass}
                                placeholder="Brief description for search engines…"
                            />
                        </Field>

                        {/* Meta Keywords */}
                        <Field label="Meta Keywords" error={errors.meta_keywords}>
                            <input
                                type="text"
                                value={data.meta_keywords}
                                onChange={(e) => setData('meta_keywords', e.target.value)}
                                className={inputClass}
                                placeholder="crm, contacts, leads"
                            />
                        </Field>

                        {/* Logo */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Logo</label>
                            {settings.logo && (
                                <img src={`/storage/${settings.logo}`} alt="Current logo" className="h-8 mb-2" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('logo', e.target.files[0])}
                                className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                            />
                            {errors.logo && <p className="mt-1 text-xs text-destructive">{errors.logo}</p>}
                        </div>

                        {/* Favicon */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Favicon</label>
                            {settings.favicon && (
                                <img src={`/storage/${settings.favicon}`} alt="Current favicon" className="h-6 mb-2" />
                            )}
                            <input
                                type="file"
                                accept=".ico,.png,.jpg"
                                onChange={(e) => setData('favicon', e.target.files[0])}
                                className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                            />
                            {errors.favicon && <p className="mt-1 text-xs text-destructive">{errors.favicon}</p>}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50"
                            >
                                {processing ? 'Saving…' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

GeneralSettings.layout = (page) => <AppLayout>{page}</AppLayout>;

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
