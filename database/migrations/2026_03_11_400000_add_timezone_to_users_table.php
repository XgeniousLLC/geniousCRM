<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: add_timezone_to_users_table
 *
 * Adds a nullable timezone column to the users table so each user
 * can store their preferred IANA timezone identifier (e.g. "America/New_York").
 * Used by AppServiceProvider to set per-user date.timezone on each request.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('timezone')->nullable()->after('company');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('timezone');
        });
    }
};
