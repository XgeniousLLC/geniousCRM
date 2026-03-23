import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
    resolve: {
        alias: {
            // @modules/Core/... → Modules/Core/...
            '@modules': fileURLToPath(new URL('./Modules', import.meta.url)),
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: [
                'resources/**',
                'Modules/**/resources/**',
            ],
        }),
        react(),
        tailwindcss(),
    ],
});
