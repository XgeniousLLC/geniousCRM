<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Change the leads.source column from free-text varchar to a controlled enum.
 * Any existing rows with unrecognised source values are set to NULL first.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Nullify existing rows whose source is not in the allowed set
        DB::statement(
            "UPDATE leads SET source = NULL
             WHERE source IS NOT NULL
               AND source NOT IN ('Website','Referral','LinkedIn','Cold Outreach','Event','Advertisement','Other')"
        );

        // SQLite does not support MODIFY COLUMN or ENUM — validation is
        // enforced at the application level ($sources array on the Lead model).
        // The ENUM constraint is applied only on MySQL/MariaDB in production.
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement(
                "ALTER TABLE leads
                 MODIFY COLUMN source
                 ENUM('Website','Referral','LinkedIn','Cold Outreach','Event','Advertisement','Other')
                 NULL"
            );
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE leads MODIFY COLUMN source VARCHAR(191) NULL");
        }
    }
};
