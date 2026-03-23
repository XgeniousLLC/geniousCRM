<?php

/**
 * ResetDemoData
 *
 * Artisan command that wipes all CRM demo data and re-seeds it fresh.
 * Intended for live demo environments so visitors always see a clean,
 * realistic dataset — not data polluted by previous visitors.
 *
 * Scheduled: every 4 hours via CoreServiceProvider.
 * Can also be run manually: php artisan demo:reset
 *
 * What is preserved:
 *   - Spatie roles & permissions
 *   - Application settings (app title, logo, etc.)
 *   - The default admin@minicrm.test account
 *
 * What is reset:
 *   - All companies, contacts, tags, leads, deals, tasks, activities
 *   - Demo users (manager, mike, emma) — recreated fresh
 *
 * Module  : Core
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Core\Console\Commands;

use Database\Seeders\DemoSeeder;
use Illuminate\Console\Command;

class ResetDemoData extends Command
{
    protected $signature = 'demo:reset
                            {--force : Skip the confirmation prompt (useful for scheduled runs)}';

    protected $description = 'Reset all CRM demo data to a clean, realistic state';

    /**
     * Clear and re-seed demo data.
     * Asks for confirmation unless --force is passed or running in non-interactive mode.
     */
    public function handle(): int
    {
        if (! $this->option('force') && $this->input->isInteractive()) {
            if (! $this->confirm('This will delete ALL CRM data and re-seed demo records. Continue?')) {
                $this->info('Aborted.');
                return self::FAILURE;
            }
        }

        $this->info('Resetting demo data…');

        $seeder = new DemoSeeder();
        $seeder->setCommand($this);
        $seeder->run();

        $this->info('Demo data has been reset successfully.');
        $this->line('');
        $this->line('  <comment>Demo credentials</comment>');
        $this->line('  Admin   : admin@minicrm.test   / password');
        $this->line('  Manager : manager@minicrm.test / password');
        $this->line('  Sales   : mike@minicrm.test    / password');
        $this->line('  Sales   : emma@minicrm.test    / password');

        return self::SUCCESS;
    }
}
