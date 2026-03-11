<?php

/**
 * User Model
 *
 * Represents an authenticated user of Mini CRM.
 * Roles (admin, manager, sales_user) are managed via Spatie Permission.
 * The `is_active` flag controls whether the account can log in.
 *
 * Table     : users
 * Traits    : HasFactory, Notifiable, HasRoles (Spatie)
 * Relations : roles (via Spatie), tasks (assigned), leads (assigned), deals (assigned)
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'company',
        'timezone',
        'is_active',
        'two_factor_secret',
        'two_factor_enabled',
        'two_factor_recovery_codes',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
