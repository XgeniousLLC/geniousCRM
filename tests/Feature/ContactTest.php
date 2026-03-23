<?php

/**
 * ContactTest
 *
 * Feature tests for the Contact module CRUD.
 * Covers: list, create, update, delete.
 *
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Contact\Models\Contact;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin',      'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'manager',    'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'sales_user', 'guard_name' => 'web']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    /** GET /contacts returns 200 for authenticated users. */
    public function test_contacts_list_is_accessible(): void
    {
        $response = $this->actingAs($this->admin)->get('/contacts');
        $response->assertStatus(200);
    }

    /** POST /contacts creates a new contact. */
    public function test_contact_can_be_created(): void
    {
        $response = $this->actingAs($this->admin)->post('/contacts', [
            'first_name' => 'Jane',
            'last_name'  => 'Doe',
            'email'      => 'jane@example.com',
            'phone'      => '555-1234',
            'company'    => 'Acme Corp',
            'tags'       => [],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('contacts', ['email' => 'jane@example.com']);
    }

    /** PATCH /contacts/{id} updates an existing contact. */
    public function test_contact_can_be_updated(): void
    {
        $contact = Contact::create([
            'first_name' => 'John',
            'last_name'  => 'Smith',
            'email'      => 'john@example.com',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->patch("/contacts/{$contact->id}", [
            'first_name' => 'Johnny',
            'last_name'  => 'Smith',
            'email'      => 'john@example.com',
            'tags'       => [],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('contacts', ['first_name' => 'Johnny']);
    }

    /** DELETE /contacts/{id} removes the contact. */
    public function test_contact_can_be_deleted(): void
    {
        $contact = Contact::create([
            'first_name' => 'Del',
            'last_name'  => 'Me',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->delete("/contacts/{$contact->id}");

        $response->assertRedirect();
        $this->assertSoftDeleted('contacts', ['id' => $contact->id]);
    }

    /** GET /contacts requires authentication. */
    public function test_contacts_requires_auth(): void
    {
        $response = $this->get('/contacts');
        $response->assertRedirect('/login');
    }
}
