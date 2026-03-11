/**
 * NotePanel
 *
 * Reusable note panel for entity detail pages.
 * Renders a list of notes and an add-note form.
 *
 * Props:
 *   notes      — array of note objects [{id, body, author, created_at}]
 *   storeUrl   — POST URL to create a note
 *   deleteBase — base URL for DELETE, appended with /{noteId}
 *
 * Module : Task
 * Author : Xgenious (https://xgenious.com)
 * License: MIT
 */

import { router, useForm } from '@inertiajs/react';

export default function NotePanel({ notes = [], storeUrl, deleteBase }) {
    const { data, setData, post, processing, reset } = useForm({ body: '' });

    const submit = (e) => {
        e.preventDefault();
        post(storeUrl, { onSuccess: () => reset() });
    };

    return (
        <section className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Notes</h2>
            </div>

            <div className="p-4 space-y-3">
                {notes.length === 0 && (
                    <p className="text-sm text-muted-foreground">No notes yet.</p>
                )}
                {notes.map((n) => (
                    <div key={n.id} className="bg-muted/40 rounded-md p-3 text-sm">
                        <p className="text-foreground whitespace-pre-wrap">{n.body}</p>
                        <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-muted-foreground">{n.author?.name ?? 'Unknown'}</span>
                            <button
                                onClick={() => router.delete(`${deleteBase}/${n.id}`)}
                                className="text-xs text-destructive hover:underline"
                            >Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={submit} className="px-4 pb-4 space-y-2">
                <textarea
                    rows={2}
                    value={data.body}
                    onChange={(e) => setData('body', e.target.value)}
                    placeholder="Add a note…"
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <button
                    type="submit"
                    disabled={processing || !data.body.trim()}
                    className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition"
                >Add Note</button>
            </form>
        </section>
    );
}
