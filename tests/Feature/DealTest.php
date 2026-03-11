<?php

/**
 * DealTest
 *
 * Feature tests for the Deal module.
 * Covers: list, create, update, delete, and stage change via PATCH.
 *
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Deal\Models\Deal;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DealTest extends TestCase
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

    /** GET /deals returns 200 for authenticated users. */
    public function test_deals_list_is_accessible(): void
    {
        $response = $this->actingAs($this->admin)->get('/deals');
        $response->assertStatus(200);
    }

    /** POST /deals creates a new deal. */
    public function test_deal_can_be_created(): void
    {
        $response = $this->actingAs($this->admin)->post('/deals', [
            'title'  => 'Big Enterprise Deal',
            'value'  => 50000,
            'stage'  => 'new_deal',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('deals', ['title' => 'Big Enterprise Deal']);
    }

    /** PATCH /deals/{id} updates an existing deal. */
    public function test_deal_can_be_updated(): void
    {
        $deal = Deal::create([
            'title'      => 'Old Title',
            'stage'      => 'new_deal',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->patch("/deals/{$deal->id}", [
            'title' => 'Updated Title',
            'value' => 99000,
            'stage' => 'proposal_sent',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('deals', ['id' => $deal->id, 'title' => 'Updated Title', 'stage' => 'proposal_sent']);
    }

    /** PATCH /deals/{id}/stage moves a deal to a new stage (Kanban drag). */
    public function test_deal_stage_can_be_changed(): void
    {
        $deal = Deal::create([
            'title'      => 'Stage Test Deal',
            'stage'      => 'new_deal',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->patch("/deals/{$deal->id}/stage", [
            'stage' => 'negotiation',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('deals', ['id' => $deal->id, 'stage' => 'negotiation']);
    }

    /** DELETE /deals/{id} removes the deal. */
    public function test_deal_can_be_deleted(): void
    {
        $deal = Deal::create([
            'title'      => 'Delete This Deal',
            'stage'      => 'lost',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->delete("/deals/{$deal->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('deals', ['id' => $deal->id]);
    }

    /** GET /deals requires authentication. */
    public function test_deals_requires_auth(): void
    {
        $response = $this->get('/deals');
        $response->assertRedirect('/login');
    }
}
