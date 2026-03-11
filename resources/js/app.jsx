/**
 * Mini CRM — Application Entry Point
 *
 * Bootstraps Inertia.js with React. Pages are resolved from module directories.
 * Page name convention: "ModuleName/PageName"  e.g. "Auth/Login", "Core/Dashboard"
 * File lives at: Modules/{Module}/resources/js/Pages/{Page}.jsx
 *
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

import './bootstrap';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

createInertiaApp({
    /**
     * Resolve a page component by name.
     * name format: "ModuleName/PageName"  e.g. "Auth/Login"
     * Constructs the exact module path and returns the component.
     */
    resolve: (name) => {
        const pages = import.meta.glob(
            '../../Modules/*/resources/js/Pages/**/*.jsx',
            { eager: true }
        );

        // Split "Auth/Login" → module="Auth", page="Login"
        const [module, ...rest] = name.split('/');
        const pagePath = rest.join('/');
        const key = `../../Modules/${module}/resources/js/Pages/${pagePath}.jsx`;

        if (!pages[key]) {
            const available = Object.keys(pages).join('\n  ');
            throw new Error(
                `Inertia page not found: "${name}"\nLooked for: ${key}\nAvailable:\n  ${available}`
            );
        }

        return pages[key];
    },

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },

    progress: {
        color: '#6366f1',
    },
});
