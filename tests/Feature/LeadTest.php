<?php

/**
 * LeadTest
 *
 * Feature tests for the Lead module.
 * Covers: list, create, update, delete, convert lead → contact.
 *
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Lead\Models\Lead;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class LeadTest extends TestCase
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

    /** GET /leads returns 200 for authenticated users. */
    public function test_leads_list_is_accessible(): void
    {
        $response = $this->actingAs($this->admin)->get('/leads');
        $response->assertStatus(200);
    }

    /** POST /leads creates a new lead. */
    public function test_lead_can_be_created(): void
    {
        $response = $this->actingAs($this->admin)->post('/leads', [
            'name'   => 'Prospect Person',
            'email'  => 'prospect@example.com',
            'phone'  => '555-9999',
            'source' => 'Website',
            'status' => 'new',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('leads', ['email' => 'prospect@example.com']);
    }

    /** PATCH /leads/{id} updates an existing lead. */
    public function test_lead_can_be_updated(): void
    {
        $lead = Lead::create([
            'name'       => 'Old Name',
            'status'     => 'new',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->patch("/leads/{$lead->id}", [
            'name'   => 'New Name',
            'status' => 'contacted',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'name' => 'New Name', 'status' => 'contacted']);
    }

    /** DELETE /leads/{id} removes the lead. */
    public function test_lead_can_be_deleted(): void
    {
        $lead = Lead::create([
            'name'       => 'To Delete',
            'status'     => 'new',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->delete("/leads/{$lead->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('leads', ['id' => $lead->id]);
    }

    /** POST /leads/{id}/convert converts a lead to a contact and marks it converted. */
    public function test_lead_can_be_converted_to_contact(): void
    {
        $lead = Lead::create([
            'name'       => 'Convert Me',
            'email'      => 'convert@example.com',
            'status'     => 'qualified',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->post("/leads/{$lead->id}/convert");

        $response->assertRedirect();
        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'status' => 'converted']);
        $this->assertDatabaseHas('contacts', ['email' => 'convert@example.com']);
    }

    /** Converting an already-converted lead returns an error. */
    public function test_already_converted_lead_cannot_be_converted_again(): void
    {
        $lead = Lead::create([
            'name'       => 'Already Done',
            'status'     => 'converted',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->post("/leads/{$lead->id}/convert");

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }
}
