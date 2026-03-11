<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds two-factor authentication columns to the users table.
 * two_factor_secret  — encrypted TOTP secret (Google Authenticator / Authy compatible)
 * two_factor_enabled — quick boolean gate for the login flow
 * two_factor_recovery_codes — JSON array of hashed recovery codes (shown once)
 *
 * Module  : Auth
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('two_factor_secret')->nullable()->after('password');
            $table->boolean('two_factor_enabled')->default(false)->after('two_factor_secret');
            $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['two_factor_secret', 'two_factor_enabled', 'two_factor_recovery_codes']);
        });
    }
};
