<?php

/**
 * AuthTest
 *
 * Feature tests for user registration and login.
 * Covers: guest page access, registration flow, login/logout.
 *
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed roles so registration (sales_user assignment) works
        Role::firstOrCreate(['name' => 'admin',      'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'manager',    'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'sales_user', 'guard_name' => 'web']);
    }

    /** GET /login returns 200 for guests. */
    public function test_login_page_is_accessible_to_guests(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    /** GET /register returns 200 for guests. */
    public function test_register_page_is_accessible_to_guests(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
    }

    /** POST /register creates a new user and redirects to dashboard. */
    public function test_user_can_register(): void
    {
        $response = $this->post('/register', [
            'name'                  => 'Test User',
            'email'                 => 'testuser@example.com',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertDatabaseHas('users', ['email' => 'testuser@example.com']);
        $this->assertAuthenticated();
    }

    /** POST /login authenticates valid credentials and redirects to dashboard. */
    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('secret123'),
        ]);
        $user->assignRole('sales_user');

        $response = $this->post('/login', [
            'email'    => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    /** POST /login with wrong password returns validation error. */
    public function test_login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('correct'),
        ]);

        $response = $this->post('/login', [
            'email'    => $user->email,
            'password' => 'wrong',
        ]);

        $response->assertSessionHasErrors(['email']);
        $this->assertGuest();
    }

    /** POST /logout logs out and redirects to login. */
    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();
        $user->assignRole('sales_user');

        $response = $this->actingAs($user)->post('/logout');

        $response->assertRedirect('/login');
        $this->assertGuest();
    }

    /** Authenticated users are redirected away from /login. */
    public function test_authenticated_user_is_redirected_from_login(): void
    {
        $user = User::factory()->create();
        $user->assignRole('sales_user');

        $response = $this->actingAs($user)->get('/login');
        $response->assertRedirect('/dashboard');
    }
}
