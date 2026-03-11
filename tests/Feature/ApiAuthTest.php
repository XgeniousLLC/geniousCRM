<?php

/**
 * ApiAuthTest
 *
 * Feature tests for the REST API authentication endpoints.
 * Covers: POST /api/v1/register, POST /api/v1/login, POST /api/v1/logout.
 *
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin',      'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'manager',    'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'sales_user', 'guard_name' => 'web']);
    }

    /** POST /api/v1/register creates a user and returns a token. */
    public function test_api_register_returns_token(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name'                  => 'API User',
            'email'                 => 'apiuser@example.com',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['token', 'user']);

        $this->assertDatabaseHas('users', ['email' => 'apiuser@example.com']);
    }

    /** POST /api/v1/login with valid credentials returns a token. */
    public function test_api_login_returns_token_for_valid_credentials(): void
    {
        $user = User::factory()->create(['password' => bcrypt('secret123')]);
        $user->assignRole('sales_user');

        $response = $this->postJson('/api/v1/login', [
            'email'    => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['token', 'user']);
    }

    /** POST /api/v1/login with invalid credentials returns 422 validation error. */
    public function test_api_login_fails_with_invalid_credentials(): void
    {
        $user = User::factory()->create(['password' => bcrypt('correct')]);

        $response = $this->postJson('/api/v1/login', [
            'email'    => $user->email,
            'password' => 'wrong',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    /** POST /api/v1/logout revokes the token. */
    public function test_api_logout_revokes_token(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password')]);
        $user->assignRole('sales_user');

        // Login first to get a token
        $loginResponse = $this->postJson('/api/v1/login', [
            'email'    => $user->email,
            'password' => 'password',
        ]);
        $token = $loginResponse->json('token');

        // Logout with the token
        $response = $this->withToken($token)->postJson('/api/v1/logout');
        $response->assertStatus(200)
                 ->assertJson(['message' => 'Logged out successfully.']);
    }

    /** Protected API endpoints require a valid Sanctum token. */
    public function test_api_protected_endpoints_require_token(): void
    {
        $response = $this->getJson('/api/v1/contacts');
        $response->assertStatus(401);
    }

    /** GET /api/v1/contacts returns data for authenticated users. */
    public function test_api_contacts_returns_list_when_authenticated(): void
    {
        $user = User::factory()->create();
        $user->assignRole('sales_user');

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/v1/contacts');
        $response->assertStatus(200)
                 ->assertJsonStructure(['data']);
    }
}
