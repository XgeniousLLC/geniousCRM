<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />

    {{-- Dynamic settings: title, meta, favicon --}}
    <title>{{ \App\Services\SettingService::get('app_title', config('app.name')) }}</title>
    <meta name="description" content="{{ \App\Services\SettingService::get('meta_description', '') }}" />
    <meta name="keywords" content="{{ \App\Services\SettingService::get('meta_keywords', '') }}" />

    @if(\App\Services\SettingService::get('favicon'))
        <link rel="icon" type="image/x-icon" href="{{ asset('storage/' . \App\Services\SettingService::get('favicon')) }}" />
    @endif

    {{-- Dark mode: restore preference from localStorage before first paint to avoid flash --}}
    <script>
        (function () {
            try {
                if (localStorage.getItem('theme') === 'dark') {
                    document.documentElement.classList.add('dark');
                }
            } catch (e) {}
        })();
    </script>

    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="antialiased bg-background text-foreground">
    @inertia
</body>
</html>
