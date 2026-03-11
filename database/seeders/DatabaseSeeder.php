<?php

/**
 * DatabaseSeeder
 *
 * Seeds the Mini CRM database with:
 *   1. Spatie roles: admin, manager, sales_user
 *   2. Permissions per CRM module
 *   3. Default admin user (admin@minicrm.test / password)
 *   4. Default application settings (app title)
 *
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed roles, permissions, the default admin user, and base settings.
     */
    public function run(): void
    {
        // --- Permissions ---
        $permissions = [
            // Contacts
            'view contacts', 'create contacts', 'edit contacts', 'delete contacts',
            // Leads
            'view leads', 'create leads', 'edit leads', 'delete leads', 'convert leads',
            // Deals
            'view deals', 'create deals', 'edit deals', 'delete deals',
            // Tasks
            'view tasks', 'create tasks', 'edit tasks', 'delete tasks',
            // Reports
            'view reports',
            // Users
            'manage users', 'manage roles',
            // Settings
            'manage settings',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // --- Roles & Permission Assignment ---
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $salesUser = Role::firstOrCreate(['name' => 'sales_user', 'guard_name' => 'web']);

        // Admin gets everything
        $admin->syncPermissions(Permission::all());

        // Manager: CRM access + reports, no user/settings management
        $manager->syncPermissions([
            'view contacts', 'create contacts', 'edit contacts', 'delete contacts',
            'view leads', 'create leads', 'edit leads', 'delete leads', 'convert leads',
            'view deals', 'create deals', 'edit deals', 'delete deals',
            'view tasks', 'create tasks', 'edit tasks', 'delete tasks',
            'view reports',
        ]);

        // Sales User: CRM access only, no reports or admin features
        $salesUser->syncPermissions([
            'view contacts', 'create contacts', 'edit contacts',
            'view leads', 'create leads', 'edit leads', 'convert leads',
            'view deals', 'create deals', 'edit deals',
            'view tasks', 'create tasks', 'edit tasks',
        ]);

        // --- Default Admin User ---
        $user = User::firstOrCreate(
            ['email' => 'admin@minicrm.test'],
            [
                'name'     => 'Admin',
                'email'    => 'admin@minicrm.test',
                'password' => Hash::make('password'),
                'company'  => 'Xgenious',
            ]
        );
        $user->assignRole('admin');

        // --- Default Settings ---
        Setting::firstOrCreate(['key' => 'app_title'], ['value' => 'Mini CRM']);
        Setting::firstOrCreate(['key' => 'meta_description'], ['value' => 'Open source CRM by Xgenious']);
        Setting::firstOrCreate(['key' => 'meta_keywords'], ['value' => 'crm, contacts, leads, deals']);
    }
}
