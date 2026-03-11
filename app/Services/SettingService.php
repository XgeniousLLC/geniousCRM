<?php

/**
 * SettingService
 *
 * A simple global key/value config store for Mini CRM.
 * Settings are persisted in the `settings` database table and cached
 * in memory for the duration of the request.
 *
 * Usage:
 *   SettingService::get('app_title', 'Mini CRM');
 *   SettingService::set('app_title', 'My CRM');
 *
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    /**
     * Retrieve a setting value by key.
     * Falls back to $default if the key does not exist.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $settings = Cache::remember('app_settings', 3600, function () {
            return Setting::pluck('value', 'key')->toArray();
        });

        return $settings[$key] ?? $default;
    }

    /**
     * Persist a setting value to the database and clear the settings cache.
     */
    public static function set(string $key, mixed $value): void
    {
        Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget('app_settings');
    }
}
