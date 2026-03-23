<?php

/**
 * DemoSeeder
 *
 * Seeds the Mini CRM with realistic demo data so first-time users can
 * explore all features immediately — contacts, leads, deals, tasks,
 * companies, tags, notes, and activity logs.
 *
 * Credentials seeded:
 *   admin@minicrm.test   / password  (Admin)
 *   manager@minicrm.test / password  (Manager)
 *   mike@minicrm.test    / password  (Sales User)
 *   emma@minicrm.test    / password  (Sales User)
 *
 * Run: php artisan db:seed --class=DemoSeeder
 * Reset: php artisan demo:reset
 *
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Activity\Models\Activity;
use Modules\Company\Models\Company;
use Modules\Contact\Models\Contact;
use Modules\Contact\Models\ContactNote;
use Modules\Contact\Models\Tag;
use Modules\Deal\Models\Deal;
use Modules\Deal\Models\DealProduct;
use Modules\Lead\Models\Lead;
use Modules\Lead\Models\LeadNote;
use Modules\Task\Models\Task;

class DemoSeeder extends Seeder
{
    /**
     * Seed all demo data.
     * Clears existing CRM data first so this can be re-run safely.
     */
    public function run(): void
    {
        $this->clearDemoData();

        $admin   = $this->seedUsers();
        $tags    = $this->seedTags($admin);
        $companies = $this->seedCompanies($admin);
        $contacts  = $this->seedContacts($admin, $companies, $tags);
        $leads     = $this->seedLeads($admin, $contacts);
        $deals     = $this->seedDeals($admin, $contacts);
        $this->seedTasks($admin, $contacts, $leads, $deals);
        $this->seedActivities($admin, $contacts, $leads, $deals);

        $this->command->info('Demo data seeded successfully.');
    }

    // -------------------------------------------------------------------------
    // Users
    // -------------------------------------------------------------------------

    /**
     * Create demo users (manager + 2 sales users).
     * Returns the admin user (already created by DatabaseSeeder).
     */
    private function seedUsers(): User
    {
        $admin = User::where('email', 'admin@minicrm.test')->first();

        User::firstOrCreate(
            ['email' => 'manager@minicrm.test'],
            [
                'name'      => 'Sarah Johnson',
                'password'  => Hash::make('password'),
                'company'   => 'Mini CRM',
                'is_active' => true,
                'timezone'  => 'America/New_York',
            ]
        )->syncRoles(['manager']);

        User::firstOrCreate(
            ['email' => 'mike@minicrm.test'],
            [
                'name'      => 'Mike Chen',
                'password'  => Hash::make('password'),
                'company'   => 'Mini CRM',
                'is_active' => true,
                'timezone'  => 'America/Chicago',
            ]
        )->syncRoles(['sales_user']);

        User::firstOrCreate(
            ['email' => 'emma@minicrm.test'],
            [
                'name'      => 'Emma Davis',
                'password'  => Hash::make('password'),
                'company'   => 'Mini CRM',
                'is_active' => true,
                'timezone'  => 'America/Los_Angeles',
            ]
        )->syncRoles(['sales_user']);

        return $admin;
    }

    // -------------------------------------------------------------------------
    // Tags
    // -------------------------------------------------------------------------

    /**
     * Create contact/lead tags used throughout the demo.
     */
    private function seedTags(User $admin): array
    {
        $tagNames = ['VIP', 'Hot Lead', 'Cold', 'Partner', 'Enterprise', 'SMB', 'Referral', 'Event'];
        $tags = [];

        foreach ($tagNames as $name) {
            $tags[$name] = Tag::firstOrCreate(['name' => $name]);
        }

        return $tags;
    }

    // -------------------------------------------------------------------------
    // Companies
    // -------------------------------------------------------------------------

    /**
     * Create demo companies across various industries.
     */
    private function seedCompanies(User $admin): array
    {
        $data = [
            [
                'name'       => 'Acme Corporation',
                'industry'   => 'Technology',
                'website'    => 'https://acme.example.com',
                'phone'      => '+1-555-010-1000',
                'address'    => '100 Acme Blvd, San Francisco, CA 94107',
                'created_by' => $admin->id,
            ],
            [
                'name'       => 'Global Ventures',
                'industry'   => 'Finance',
                'website'    => 'https://globalventures.example.com',
                'phone'      => '+1-555-020-2000',
                'address'    => '200 Wall Street, New York, NY 10005',
                'created_by' => $admin->id,
            ],
            [
                'name'       => 'StartupHub',
                'industry'   => 'SaaS',
                'website'    => 'https://startuphub.example.com',
                'phone'      => '+1-555-030-3000',
                'address'    => '300 Innovation Ave, Austin, TX 78701',
                'created_by' => $admin->id,
            ],
            [
                'name'       => 'MediaWorks',
                'industry'   => 'Media',
                'website'    => 'https://mediaworks.example.com',
                'phone'      => '+1-555-040-4000',
                'address'    => '400 Broadcast Ln, Los Angeles, CA 90001',
                'created_by' => $admin->id,
            ],
            [
                'name'       => 'BuildRight Construction',
                'industry'   => 'Construction',
                'website'    => 'https://buildright.example.com',
                'phone'      => '+1-555-050-5000',
                'address'    => '500 Builder Rd, Chicago, IL 60601',
                'created_by' => $admin->id,
            ],
            [
                'name'       => 'HealthFirst',
                'industry'   => 'Healthcare',
                'website'    => 'https://healthfirst.example.com',
                'phone'      => '+1-555-060-6000',
                'address'    => '600 Wellness Way, Boston, MA 02101',
                'created_by' => $admin->id,
            ],
            [
                'name'       => 'EduTech Solutions',
                'industry'   => 'Education',
                'website'    => 'https://edutech.example.com',
                'phone'      => '+1-555-070-7000',
                'address'    => '700 Campus Dr, Seattle, WA 98101',
                'created_by' => $admin->id,
            ],
            [
                'name'       => 'RetailMax',
                'industry'   => 'Retail',
                'website'    => 'https://retailmax.example.com',
                'phone'      => '+1-555-080-8000',
                'address'    => '800 Commerce St, Dallas, TX 75201',
                'created_by' => $admin->id,
            ],
        ];

        $companies = [];
        foreach ($data as $row) {
            $companies[$row['name']] = Company::create($row);
        }

        return $companies;
    }

    // -------------------------------------------------------------------------
    // Contacts
    // -------------------------------------------------------------------------

    /**
     * Create 15 realistic contacts linked to companies, with tags and notes.
     */
    private function seedContacts(User $admin, array $companies, array $tags): array
    {
        $mike  = User::where('email', 'mike@minicrm.test')->first();
        $emma  = User::where('email', 'emma@minicrm.test')->first();

        $data = [
            [
                'first_name' => 'James',
                'last_name'  => 'Morrison',
                'email'      => 'james.morrison@acme.example.com',
                'phone'      => '+1-555-101-0001',
                'company'    => 'Acme Corporation',
                'company_id' => $companies['Acme Corporation']->id,
                'created_by' => $admin->id,
                'tags'       => ['VIP', 'Enterprise'],
                'notes'      => [
                    ['user_id' => $admin->id, 'body' => 'Met at TechConf 2025. Very interested in our CRM suite.'],
                    ['user_id' => $mike->id,  'body' => 'Follow-up call scheduled for next Monday.'],
                ],
            ],
            [
                'first_name' => 'Linda',
                'last_name'  => 'Park',
                'email'      => 'linda.park@globalventures.example.com',
                'phone'      => '+1-555-102-0002',
                'company'    => 'Global Ventures',
                'company_id' => $companies['Global Ventures']->id,
                'created_by' => $admin->id,
                'tags'       => ['Enterprise', 'Partner'],
                'notes'      => [
                    ['user_id' => $admin->id, 'body' => 'Linda manages a team of 50+ sales reps. Needs advanced reporting.'],
                ],
            ],
            [
                'first_name' => 'Tom',
                'last_name'  => 'Reynolds',
                'email'      => 'tom.reynolds@startuphub.example.com',
                'phone'      => '+1-555-103-0003',
                'company'    => 'StartupHub',
                'company_id' => $companies['StartupHub']->id,
                'created_by' => $mike->id,
                'tags'       => ['Hot Lead', 'SMB'],
                'notes'      => [
                    ['user_id' => $mike->id, 'body' => 'Startup founder. Wants to close this month before Q1 ends.'],
                ],
            ],
            [
                'first_name' => 'Angela',
                'last_name'  => 'Torres',
                'email'      => 'angela.torres@mediaworks.example.com',
                'phone'      => '+1-555-104-0004',
                'company'    => 'MediaWorks',
                'company_id' => $companies['MediaWorks']->id,
                'created_by' => $emma->id,
                'tags'       => ['VIP'],
                'notes'      => [
                    ['user_id' => $emma->id, 'body' => 'Decision maker. Very responsive over email.'],
                ],
            ],
            [
                'first_name' => 'Robert',
                'last_name'  => 'Kim',
                'email'      => 'robert.kim@buildright.example.com',
                'phone'      => '+1-555-105-0005',
                'company'    => 'BuildRight Construction',
                'company_id' => $companies['BuildRight Construction']->id,
                'created_by' => $admin->id,
                'tags'       => ['SMB'],
                'notes'      => [],
            ],
            [
                'first_name' => 'Natalie',
                'last_name'  => 'Hughes',
                'email'      => 'natalie.hughes@healthfirst.example.com',
                'phone'      => '+1-555-106-0006',
                'company'    => 'HealthFirst',
                'company_id' => $companies['HealthFirst']->id,
                'created_by' => $mike->id,
                'tags'       => ['Enterprise', 'Referral'],
                'notes'      => [
                    ['user_id' => $mike->id, 'body' => 'Referred by James Morrison. Evaluating 3 CRM vendors.'],
                ],
            ],
            [
                'first_name' => 'Carlos',
                'last_name'  => 'Mendoza',
                'email'      => 'carlos.mendoza@edutech.example.com',
                'phone'      => '+1-555-107-0007',
                'company'    => 'EduTech Solutions',
                'company_id' => $companies['EduTech Solutions']->id,
                'created_by' => $emma->id,
                'tags'       => ['SMB', 'Event'],
                'notes'      => [
                    ['user_id' => $emma->id, 'body' => 'Connected at EdTech Summit. Interested in the API plan.'],
                ],
            ],
            [
                'first_name' => 'Rachel',
                'last_name'  => 'Wong',
                'email'      => 'rachel.wong@retailmax.example.com',
                'phone'      => '+1-555-108-0008',
                'company'    => 'RetailMax',
                'company_id' => $companies['RetailMax']->id,
                'created_by' => $admin->id,
                'tags'       => ['VIP', 'Partner'],
                'notes'      => [
                    ['user_id' => $admin->id, 'body' => 'Long-time partner. Renewing their enterprise subscription.'],
                    ['user_id' => $emma->id,  'body' => 'Sent contract draft on March 10th.'],
                ],
            ],
            [
                'first_name' => 'David',
                'last_name'  => 'Lee',
                'email'      => 'david.lee@acme.example.com',
                'phone'      => '+1-555-109-0009',
                'company'    => 'Acme Corporation',
                'company_id' => $companies['Acme Corporation']->id,
                'created_by' => $mike->id,
                'tags'       => ['Cold'],
                'notes'      => [
                    ['user_id' => $mike->id, 'body' => 'Initial outreach sent. No response yet.'],
                ],
            ],
            [
                'first_name' => 'Olivia',
                'last_name'  => 'Scott',
                'email'      => 'olivia.scott@globalventures.example.com',
                'phone'      => '+1-555-110-0010',
                'company'    => 'Global Ventures',
                'company_id' => $companies['Global Ventures']->id,
                'created_by' => $emma->id,
                'tags'       => ['Hot Lead'],
                'notes'      => [
                    ['user_id' => $emma->id, 'body' => 'Very enthusiastic. Wants a demo this week.'],
                ],
            ],
            [
                'first_name' => 'Brian',
                'last_name'  => 'Adams',
                'email'      => 'brian.adams@startuphub.example.com',
                'phone'      => '+1-555-111-0011',
                'company'    => 'StartupHub',
                'company_id' => $companies['StartupHub']->id,
                'created_by' => $admin->id,
                'tags'       => ['SMB', 'Referral'],
                'notes'      => [],
            ],
            [
                'first_name' => 'Megan',
                'last_name'  => 'Clark',
                'email'      => 'megan.clark@healthfirst.example.com',
                'phone'      => '+1-555-112-0012',
                'company'    => 'HealthFirst',
                'company_id' => $companies['HealthFirst']->id,
                'created_by' => $mike->id,
                'tags'       => ['Enterprise'],
                'notes'      => [
                    ['user_id' => $mike->id, 'body' => 'CTO. Interested in API integration capabilities.'],
                ],
            ],
            [
                'first_name' => 'Kevin',
                'last_name'  => 'White',
                'email'      => 'kevin.white@buildright.example.com',
                'phone'      => '+1-555-113-0013',
                'company'    => 'BuildRight Construction',
                'company_id' => $companies['BuildRight Construction']->id,
                'created_by' => $emma->id,
                'tags'       => ['Cold'],
                'notes'      => [],
            ],
            [
                'first_name' => 'Stephanie',
                'last_name'  => 'Brown',
                'email'      => 'stephanie.brown@mediaworks.example.com',
                'phone'      => '+1-555-114-0014',
                'company'    => 'MediaWorks',
                'company_id' => $companies['MediaWorks']->id,
                'created_by' => $admin->id,
                'tags'       => ['VIP', 'Hot Lead'],
                'notes'      => [
                    ['user_id' => $admin->id, 'body' => 'Board member. High priority account.'],
                ],
            ],
            [
                'first_name' => 'Andrew',
                'last_name'  => 'Nelson',
                'email'      => 'andrew.nelson@retailmax.example.com',
                'phone'      => '+1-555-115-0015',
                'company'    => 'RetailMax',
                'company_id' => $companies['RetailMax']->id,
                'created_by' => $mike->id,
                'tags'       => ['SMB'],
                'notes'      => [
                    ['user_id' => $mike->id, 'body' => 'Purchasing manager. Budget approved for Q2.'],
                ],
            ],
        ];

        $contacts = [];
        foreach ($data as $row) {
            $contactTags = $row['tags'];
            $notes       = $row['notes'];
            unset($row['tags'], $row['notes']);

            $contact = Contact::create($row);

            // Attach tags
            $tagIds = collect($contactTags)->map(fn ($t) => $tags[$t]->id)->toArray();
            $contact->tags()->sync($tagIds);

            // Add notes
            foreach ($notes as $note) {
                ContactNote::create([
                    'contact_id' => $contact->id,
                    'user_id'    => $note['user_id'],
                    'body'       => $note['body'],
                ]);
            }

            $contacts[] = $contact;
        }

        return $contacts;
    }

    // -------------------------------------------------------------------------
    // Leads
    // -------------------------------------------------------------------------

    /**
     * Create 12 leads across all statuses and sources, with notes.
     */
    private function seedLeads(User $admin, array $contacts): array
    {
        $mike = User::where('email', 'mike@minicrm.test')->first();
        $emma = User::where('email', 'emma@minicrm.test')->first();

        $data = [
            [
                'name'             => 'DataSync Pro Inquiry',
                'email'            => 'inquiry@datasync.example.com',
                'phone'            => '+1-555-201-0001',
                'source'           => 'Website',
                'assigned_user_id' => $mike->id,
                'status'           => 'new',
                'notes'            => 'Filled out our contact form asking about the Enterprise plan.',
                'follow_up_date'   => now()->addDays(2)->toDateString(),
                'created_by'       => $admin->id,
                'lead_notes'       => [
                    ['user_id' => $mike->id, 'body' => 'Form submitted via pricing page. Assigned to Mike.'],
                ],
            ],
            [
                'name'             => 'CloudBridge Networks',
                'email'            => 'sales@cloudbridge.example.com',
                'phone'            => '+1-555-202-0002',
                'source'           => 'LinkedIn',
                'assigned_user_id' => $emma->id,
                'status'           => 'contacted',
                'notes'            => 'Found us on LinkedIn. Connected and had a 15-minute intro call.',
                'follow_up_date'   => now()->addDays(5)->toDateString(),
                'created_by'       => $admin->id,
                'lead_notes'       => [
                    ['user_id' => $emma->id, 'body' => 'Intro call done. Sending proposal next week.'],
                ],
            ],
            [
                'name'             => 'PivotPoint Analytics',
                'email'            => 'ceo@pivotpoint.example.com',
                'phone'            => '+1-555-203-0003',
                'source'           => 'Referral',
                'assigned_user_id' => $mike->id,
                'status'           => 'qualified',
                'notes'            => 'Referred by Rachel Wong. Budget confirmed at $12,000/year.',
                'follow_up_date'   => now()->addDays(1)->toDateString(),
                'created_by'       => $mike->id,
                'lead_notes'       => [
                    ['user_id' => $mike->id,  'body' => 'Budget confirmed. Decision expected within 2 weeks.'],
                    ['user_id' => $admin->id, 'body' => 'High priority — fast-tracked by management.'],
                ],
            ],
            [
                'name'             => 'SkyNet Logistics',
                'email'            => 'procurement@skynet-log.example.com',
                'phone'            => '+1-555-204-0004',
                'source'           => 'Cold Outreach',
                'assigned_user_id' => $emma->id,
                'status'           => 'lost',
                'notes'            => 'Cold outreach via email campaign. Chose a competitor.',
                'follow_up_date'   => null,
                'created_by'       => $emma->id,
                'lead_notes'       => [
                    ['user_id' => $emma->id, 'body' => 'Went with SalesForce. Keep on watch list for next year.'],
                ],
            ],
            [
                'name'             => 'BrightPath Education',
                'email'            => 'admin@brightpath.example.com',
                'phone'            => '+1-555-205-0005',
                'source'           => 'Event',
                'assigned_user_id' => $mike->id,
                'status'           => 'contacted',
                'notes'            => 'Met at EdTech 2025 conference booth.',
                'follow_up_date'   => now()->addDays(3)->toDateString(),
                'created_by'       => $mike->id,
                'lead_notes'       => [
                    ['user_id' => $mike->id, 'body' => 'Wants a tailored demo for their education use case.'],
                ],
            ],
            [
                'name'             => 'NovaCraft Studios',
                'email'            => 'hello@novacraft.example.com',
                'phone'            => '+1-555-206-0006',
                'source'           => 'Website',
                'assigned_user_id' => $emma->id,
                'status'           => 'qualified',
                'notes'            => 'Signed up for trial. 22 users active on trial account.',
                'follow_up_date'   => now()->subDay()->toDateString(),
                'created_by'       => $admin->id,
                'lead_notes'       => [
                    ['user_id' => $emma->id, 'body' => 'Trial expires in 3 days. Time to push for conversion.'],
                ],
            ],
            [
                'name'             => 'Apex Consulting Group',
                'email'            => 'partner@apexcg.example.com',
                'phone'            => '+1-555-207-0007',
                'source'           => 'Referral',
                'assigned_user_id' => $admin->id,
                'status'           => 'new',
                'notes'            => 'Partner channel referral. Evaluating CRM for their clients.',
                'follow_up_date'   => now()->addDays(7)->toDateString(),
                'created_by'       => $admin->id,
                'lead_notes'       => [],
            ],
            [
                'name'             => 'TerraGrow Farms',
                'email'            => 'ops@terragrow.example.com',
                'phone'            => '+1-555-208-0008',
                'source'           => 'Advertisement',
                'assigned_user_id' => $mike->id,
                'status'           => 'new',
                'notes'            => 'Clicked on Google Ads campaign. Requested brochure.',
                'follow_up_date'   => now()->addDays(4)->toDateString(),
                'created_by'       => $mike->id,
                'lead_notes'       => [],
            ],
            [
                'name'             => 'FusionWave Tech',
                'email'            => 'dev@fusionwave.example.com',
                'phone'            => '+1-555-209-0009',
                'source'           => 'LinkedIn',
                'assigned_user_id' => $emma->id,
                'status'           => 'qualified',
                'notes'            => 'CTO reached out directly. Needs API-first CRM solution.',
                'follow_up_date'   => now()->subDays(2)->toDateString(),
                'created_by'       => $emma->id,
                'lead_notes'       => [
                    ['user_id' => $emma->id, 'body' => 'Overdue follow-up — call them tomorrow morning.'],
                ],
            ],
            [
                'name'             => 'Meridian Financial',
                'email'            => 'info@meridianfin.example.com',
                'phone'            => '+1-555-210-0010',
                'source'           => 'Event',
                'assigned_user_id' => $mike->id,
                'status'           => 'contacted',
                'notes'            => 'Met at FinTech Summit. Interested in compliance reporting.',
                'follow_up_date'   => now()->addDays(6)->toDateString(),
                'created_by'       => $admin->id,
                'lead_notes'       => [
                    ['user_id' => $mike->id, 'body' => 'Asked for compliance and audit trail features overview.'],
                ],
            ],
            [
                'name'             => 'GreenLeaf Organics',
                'email'            => 'contact@greenleaf.example.com',
                'phone'            => '+1-555-211-0011',
                'source'           => 'Cold Outreach',
                'assigned_user_id' => $emma->id,
                'status'           => 'lost',
                'notes'            => 'Outreach via email. Too small — under 5 users.',
                'follow_up_date'   => null,
                'created_by'       => $emma->id,
                'lead_notes'       => [
                    ['user_id' => $emma->id, 'body' => 'Not a fit for our pricing tier. Archive for now.'],
                ],
            ],
            [
                'name'             => 'Orbit Media Solutions',
                'email'            => 'business@orbitmedia.example.com',
                'phone'            => '+1-555-212-0012',
                'source'           => 'Website',
                'assigned_user_id' => $admin->id,
                'status'           => 'qualified',
                'notes'            => 'Inbound demo request. Team of 80. High conversion potential.',
                'follow_up_date'   => now()->addDays(2)->toDateString(),
                'created_by'       => $admin->id,
                'lead_notes'       => [
                    ['user_id' => $admin->id, 'body' => 'Demo booked for Thursday. Prepare media industry slides.'],
                ],
            ],
        ];

        $leads = [];
        foreach ($data as $row) {
            $leadNotes = $row['lead_notes'];
            unset($row['lead_notes']);

            $lead = Lead::create($row);

            foreach ($leadNotes as $note) {
                LeadNote::create([
                    'lead_id' => $lead->id,
                    'user_id' => $note['user_id'],
                    'body'    => $note['body'],
                ]);
            }

            $leads[] = $lead;
        }

        return $leads;
    }

    // -------------------------------------------------------------------------
    // Deals
    // -------------------------------------------------------------------------

    /**
     * Create 10 deals across all pipeline stages, with products.
     */
    private function seedDeals(User $admin, array $contacts): array
    {
        $mike = User::where('email', 'mike@minicrm.test')->first();
        $emma = User::where('email', 'emma@minicrm.test')->first();

        // Map contacts by full name for easy reference
        $byName = collect($contacts)->keyBy(fn ($c) => $c->first_name . ' ' . $c->last_name);

        $data = [
            [
                'title'                 => 'Acme CRM Enterprise License',
                'value'                 => 24000.00,
                'contact_id'            => $byName['James Morrison']->id,
                'stage'                 => 'negotiation',
                'expected_closing_date' => now()->addDays(10)->toDateString(),
                'assigned_user_id'      => $mike->id,
                'probability'           => 65,
                'created_by'            => $admin->id,
                'products'              => [
                    ['name' => 'Enterprise License (Annual)', 'quantity' => 1,  'unit_price' => 18000.00],
                    ['name' => 'Onboarding & Training',       'quantity' => 3,  'unit_price' => 2000.00],
                ],
            ],
            [
                'title'                 => 'Global Ventures — Expansion Pack',
                'value'                 => 9600.00,
                'contact_id'            => $byName['Linda Park']->id,
                'stage'                 => 'proposal_sent',
                'expected_closing_date' => now()->addDays(20)->toDateString(),
                'assigned_user_id'      => $emma->id,
                'probability'           => 35,
                'created_by'            => $admin->id,
                'products'              => [
                    ['name' => 'CRM Pro (50 seats)',   'quantity' => 50, 'unit_price' => 16.00],
                    ['name' => 'API Add-on (monthly)', 'quantity' => 12, 'unit_price' => 200.00],
                ],
            ],
            [
                'title'                 => 'StartupHub — Starter Plan',
                'value'                 => 1800.00,
                'contact_id'            => $byName['Tom Reynolds']->id,
                'stage'                 => 'new_deal',
                'expected_closing_date' => now()->addDays(30)->toDateString(),
                'assigned_user_id'      => $mike->id,
                'probability'           => 10,
                'created_by'            => $mike->id,
                'products'              => [
                    ['name' => 'Starter Plan (10 seats)', 'quantity' => 10, 'unit_price' => 15.00],
                ],
            ],
            [
                'title'                 => 'MediaWorks — Annual Renewal',
                'value'                 => 36000.00,
                'contact_id'            => $byName['Angela Torres']->id,
                'stage'                 => 'won',
                'expected_closing_date' => now()->subDays(5)->toDateString(),
                'assigned_user_id'      => $emma->id,
                'probability'           => 100,
                'created_by'            => $admin->id,
                'products'              => [
                    ['name' => 'Enterprise License (Annual)',   'quantity' => 1, 'unit_price' => 30000.00],
                    ['name' => 'Dedicated Support (Annual)',   'quantity' => 1, 'unit_price' => 6000.00],
                ],
            ],
            [
                'title'                 => 'HealthFirst — CRM Integration',
                'value'                 => 14500.00,
                'contact_id'            => $byName['Natalie Hughes']->id,
                'stage'                 => 'negotiation',
                'expected_closing_date' => now()->addDays(6)->toDateString(),
                'assigned_user_id'      => $mike->id,
                'probability'           => 60,
                'created_by'            => $mike->id,
                'products'              => [
                    ['name' => 'CRM Pro (30 seats)',      'quantity' => 30, 'unit_price' => 18.00],
                    ['name' => 'HIPAA Compliance Add-on', 'quantity' => 1,  'unit_price' => 4000.00],
                    ['name' => 'Onboarding Package',      'quantity' => 1,  'unit_price' => 3960.00],
                ],
            ],
            [
                'title'                 => 'EduTech — Classroom Suite',
                'value'                 => 7200.00,
                'contact_id'            => $byName['Carlos Mendoza']->id,
                'stage'                 => 'proposal_sent',
                'expected_closing_date' => now()->addDays(15)->toDateString(),
                'assigned_user_id'      => $emma->id,
                'probability'           => 30,
                'created_by'            => $emma->id,
                'products'              => [
                    ['name' => 'Team Plan (20 seats)',   'quantity' => 20, 'unit_price' => 12.00],
                    ['name' => 'LMS Integration Module', 'quantity' => 1,  'unit_price' => 4960.00],
                ],
            ],
            [
                'title'                 => 'RetailMax — Partner Renewal',
                'value'                 => 48000.00,
                'contact_id'            => $byName['Rachel Wong']->id,
                'stage'                 => 'won',
                'expected_closing_date' => now()->subDays(10)->toDateString(),
                'assigned_user_id'      => $admin->id,
                'probability'           => 100,
                'created_by'            => $admin->id,
                'products'              => [
                    ['name' => 'Enterprise License 3yr', 'quantity' => 1, 'unit_price' => 40000.00],
                    ['name' => 'White-label Add-on',     'quantity' => 1, 'unit_price' => 8000.00],
                ],
            ],
            [
                'title'                 => 'BuildRight — Field Sales CRM',
                'value'                 => 3600.00,
                'contact_id'            => $byName['Robert Kim']->id,
                'stage'                 => 'lost',
                'expected_closing_date' => now()->subDays(3)->toDateString(),
                'assigned_user_id'      => $mike->id,
                'probability'           => 0,
                'created_by'            => $admin->id,
                'products'              => [
                    ['name' => 'Business Plan (15 seats)', 'quantity' => 15, 'unit_price' => 20.00],
                ],
            ],
            [
                'title'                 => 'Stephanie Brown — Board Initiative',
                'value'                 => 18000.00,
                'contact_id'            => $byName['Stephanie Brown']->id,
                'stage'                 => 'negotiation',
                'expected_closing_date' => now()->addDays(4)->toDateString(),
                'assigned_user_id'      => $emma->id,
                'probability'           => 70,
                'created_by'            => $admin->id,
                'products'              => [
                    ['name' => 'Enterprise License',   'quantity' => 1, 'unit_price' => 15000.00],
                    ['name' => 'Executive Dashboard',  'quantity' => 1, 'unit_price' => 3000.00],
                ],
            ],
            [
                'title'                 => 'RetailMax — New Branch Setup',
                'value'                 => 5400.00,
                'contact_id'            => $byName['Andrew Nelson']->id,
                'stage'                 => 'new_deal',
                'expected_closing_date' => now()->addDays(45)->toDateString(),
                'assigned_user_id'      => $mike->id,
                'probability'           => 10,
                'created_by'            => $mike->id,
                'products'              => [
                    ['name' => 'Starter Plan (15 seats)', 'quantity' => 15, 'unit_price' => 30.00],
                ],
            ],
        ];

        $deals = [];
        foreach ($data as $row) {
            $products = $row['products'];
            unset($row['products']);

            $deal = Deal::create($row);

            foreach ($products as $product) {
                DealProduct::create(array_merge($product, ['deal_id' => $deal->id]));
            }

            $deals[] = $deal;
        }

        return $deals;
    }

    // -------------------------------------------------------------------------
    // Tasks
    // -------------------------------------------------------------------------

    /**
     * Create 15 tasks linked to contacts, leads, and deals.
     */
    private function seedTasks(User $admin, array $contacts, array $leads, array $deals): void
    {
        $mike = User::where('email', 'mike@minicrm.test')->first();
        $emma = User::where('email', 'emma@minicrm.test')->first();

        $tasks = [
            // Contact tasks
            [
                'title'            => 'Send product brochure to James Morrison',
                'description'      => 'Attach the updated Enterprise brochure PDF and pricing sheet.',
                'due_date'         => now()->addDays(1)->toDateString(),
                'assigned_user_id' => $mike->id,
                'created_by'       => $admin->id,
                'status'           => 'pending',
                'taskable_type'    => 'Modules\\Contact\\Models\\Contact',
                'taskable_id'      => $contacts[0]->id,
            ],
            [
                'title'            => 'Schedule demo call with Linda Park',
                'description'      => 'Propose 3 time slots for next week and confirm via email.',
                'due_date'         => now()->addDays(2)->toDateString(),
                'assigned_user_id' => $emma->id,
                'created_by'       => $admin->id,
                'status'           => 'in_progress',
                'taskable_type'    => 'Modules\\Contact\\Models\\Contact',
                'taskable_id'      => $contacts[1]->id,
            ],
            [
                'title'            => 'Follow up with Rachel Wong on contract',
                'description'      => 'Check if legal has reviewed the contract draft sent on March 10.',
                'due_date'         => now()->addDays(3)->toDateString(),
                'assigned_user_id' => $emma->id,
                'created_by'       => $admin->id,
                'status'           => 'pending',
                'taskable_type'    => 'Modules\\Contact\\Models\\Contact',
                'taskable_id'      => $contacts[7]->id,
            ],
            [
                'title'            => 'Research Megan Clark\'s tech stack',
                'description'      => 'Check their public job postings and LinkedIn to identify integration opportunities.',
                'due_date'         => now()->addDays(4)->toDateString(),
                'assigned_user_id' => $mike->id,
                'created_by'       => $mike->id,
                'status'           => 'done',
                'taskable_type'    => 'Modules\\Contact\\Models\\Contact',
                'taskable_id'      => $contacts[11]->id,
            ],
            // Lead tasks
            [
                'title'            => 'Call DataSync Pro inquiry',
                'description'      => 'First discovery call — qualify budget and timeline.',
                'due_date'         => now()->addDays(2)->toDateString(),
                'assigned_user_id' => $mike->id,
                'created_by'       => $admin->id,
                'status'           => 'pending',
                'taskable_type'    => 'Modules\\Lead\\Models\\Lead',
                'taskable_id'      => $leads[0]->id,
            ],
            [
                'title'            => 'Prepare CloudBridge proposal',
                'description'      => 'Draft proposal for CloudBridge Networks based on their 40-seat requirement.',
                'due_date'         => now()->addDays(5)->toDateString(),
                'assigned_user_id' => $emma->id,
                'created_by'       => $admin->id,
                'status'           => 'in_progress',
                'taskable_type'    => 'Modules\\Lead\\Models\\Lead',
                'taskable_id'      => $leads[1]->id,
            ],
            [
                'title'            => 'Follow up PivotPoint — decision pending',
                'description'      => 'Send executive summary and ROI calculator to CEO.',
                'due_date'         => now()->addDays(1)->toDateString(),
                'assigned_user_id' => $mike->id,
                'created_by'       => $mike->id,
                'status'           => 'pending',
                'taskable_type'    => 'Modules\\Lead\\Models\\Lead',
                'taskable_id'      => $leads[2]->id,
            ],
            [
                'title'            => 'NovaCraft trial conversion email',
                'description'      => 'Send personalised trial-to-paid offer before trial expires.',
                'due_date'         => now()->subDays(1)->toDateString(),
                'assigned_user_id' => $emma->id,
                'created_by'       => $emma->id,
                'status'           => 'pending',
                'taskable_type'    => 'Modules\\Lead\\Models\\Lead',
                'taskable_id'      => $leads[5]->id,
            ],
            [
                'title'            => 'Prepare Orbit Media demo deck',
                'description'      => 'Customise the slide deck with media industry case studies.',
                'due_date'         => now()->addDays(2)->toDateString(),
                'assigned_user_id' => $admin->id,
                'created_by'       => $admin->id,
                'status'           => 'in_progress',
                'taskable_type'    => 'Modules\\Lead\\Models\\Lead',
                'taskable_id'      => $leads[11]->id,
            ],
            // Deal tasks
            [
                'title'            => 'Negotiate final contract — Acme',
                'description'      => 'Review redlines from Acme legal team. Focus on SLA and data residency clauses.',
                'due_date'         => now()->addDays(3)->toDateString(),
                'assigned_user_id' => $mike->id,
                'created_by'       => $admin->id,
                'status'           => 'in_progress',
                'taskable_type'    => 'Modules\\Deal\\Models\\Deal',
                'taskable_id'      => $deals[0]->id,
            ],
            [
                'title'            => 'Send Global Ventures proposal PDF',
                'description'      => 'Attach pricing and the SLA addendum. CC Linda Park and her manager.',
                'due_date'         => now()->addDays(2)->toDateString(),
                'assigned_user_id' => $emma->id,
                'created_by'       => $admin->id,
                'status'           => 'pending',
                'taskable_type'    => 'Modules\\Deal\\Models\\Deal',
                'taskable_id'      => $deals[1]->id,
            ],
            [
                'title'            => 'HealthFirst — HIPAA compliance call',
                'description'      => 'Join call with HealthFirst IT and our compliance team to clarify data handling.',
                'due_date'         => now()->addDays(4)->toDateString(),
                'assigned_user_id' => $mike->id,
                'created_by'       => $mike->id,
                'status'           => 'pending',
                'taskable_type'    => 'Modules\\Deal\\Models\\Deal',
                'taskable_id'      => $deals[4]->id,
            ],
            [
                'title'            => 'Close Stephanie Brown deal — get signatures',
                'description'      => 'Send DocuSign contract. Follow up daily until signed.',
                'due_date'         => now()->addDays(1)->toDateString(),
                'assigned_user_id' => $emma->id,
                'created_by'       => $admin->id,
                'status'           => 'in_progress',
                'taskable_type'    => 'Modules\\Deal\\Models\\Deal',
                'taskable_id'      => $deals[8]->id,
            ],
            // Standalone tasks (no entity)
            [
                'title'            => 'Update CRM onboarding checklist',
                'description'      => 'Review and refresh the team onboarding guide for new sales hires.',
                'due_date'         => now()->addDays(7)->toDateString(),
                'assigned_user_id' => $admin->id,
                'created_by'       => $admin->id,
                'status'           => 'pending',
                'taskable_type'    => null,
                'taskable_id'      => null,
            ],
            [
                'title'            => 'Q1 pipeline review meeting',
                'description'      => 'All sales team to review Q1 closed deals and pipeline health.',
                'due_date'         => now()->addDays(5)->toDateString(),
                'assigned_user_id' => $mike->id,
                'created_by'       => $admin->id,
                'status'           => 'pending',
                'taskable_type'    => null,
                'taskable_id'      => null,
            ],
        ];

        foreach ($tasks as $taskData) {
            Task::create($taskData);
        }
    }

    // -------------------------------------------------------------------------
    // Activities
    // -------------------------------------------------------------------------

    /**
     * Create activity log entries that bring the feed to life.
     */
    private function seedActivities(User $admin, array $contacts, array $leads, array $deals): void
    {
        $mike = User::where('email', 'mike@minicrm.test')->first();
        $emma = User::where('email', 'emma@minicrm.test')->first();

        $entries = [
            // Contact activities
            ['user_id' => $admin->id, 'action' => 'created',        'entity_type' => 'Contact', 'entity_id' => $contacts[0]->id,  'entity_label' => 'James Morrison',    'description' => 'Contact James Morrison was created.'],
            ['user_id' => $mike->id,  'action' => 'note_added',     'entity_type' => 'Contact', 'entity_id' => $contacts[0]->id,  'entity_label' => 'James Morrison',    'description' => 'A note was added to James Morrison.'],
            ['user_id' => $admin->id, 'action' => 'created',        'entity_type' => 'Contact', 'entity_id' => $contacts[1]->id,  'entity_label' => 'Linda Park',        'description' => 'Contact Linda Park was created.'],
            ['user_id' => $emma->id,  'action' => 'updated',        'entity_type' => 'Contact', 'entity_id' => $contacts[3]->id,  'entity_label' => 'Angela Torres',     'description' => 'Contact Angela Torres was updated.'],
            ['user_id' => $mike->id,  'action' => 'created',        'entity_type' => 'Contact', 'entity_id' => $contacts[5]->id,  'entity_label' => 'Natalie Hughes',    'description' => 'Contact Natalie Hughes was created.'],
            ['user_id' => $admin->id, 'action' => 'note_added',     'entity_type' => 'Contact', 'entity_id' => $contacts[7]->id,  'entity_label' => 'Rachel Wong',       'description' => 'A note was added to Rachel Wong.'],
            ['user_id' => $emma->id,  'action' => 'created',        'entity_type' => 'Contact', 'entity_id' => $contacts[9]->id,  'entity_label' => 'Olivia Scott',      'description' => 'Contact Olivia Scott was created.'],
            ['user_id' => $admin->id, 'action' => 'created',        'entity_type' => 'Contact', 'entity_id' => $contacts[13]->id, 'entity_label' => 'Stephanie Brown',   'description' => 'Contact Stephanie Brown was created.'],

            // Lead activities
            ['user_id' => $admin->id, 'action' => 'created',        'entity_type' => 'Lead', 'entity_id' => $leads[0]->id,  'entity_label' => 'DataSync Pro Inquiry',  'description' => 'Lead DataSync Pro Inquiry was created.'],
            ['user_id' => $mike->id,  'action' => 'note_added',     'entity_type' => 'Lead', 'entity_id' => $leads[0]->id,  'entity_label' => 'DataSync Pro Inquiry',  'description' => 'A note was added to DataSync Pro Inquiry.'],
            ['user_id' => $admin->id, 'action' => 'created',        'entity_type' => 'Lead', 'entity_id' => $leads[1]->id,  'entity_label' => 'CloudBridge Networks',  'description' => 'Lead CloudBridge Networks was created.'],
            ['user_id' => $emma->id,  'action' => 'status_changed', 'entity_type' => 'Lead', 'entity_id' => $leads[1]->id,  'entity_label' => 'CloudBridge Networks',  'description' => 'Lead status changed to contacted.'],
            ['user_id' => $mike->id,  'action' => 'created',        'entity_type' => 'Lead', 'entity_id' => $leads[2]->id,  'entity_label' => 'PivotPoint Analytics',  'description' => 'Lead PivotPoint Analytics was created.'],
            ['user_id' => $admin->id, 'action' => 'status_changed', 'entity_type' => 'Lead', 'entity_id' => $leads[2]->id,  'entity_label' => 'PivotPoint Analytics',  'description' => 'Lead status changed to qualified.'],
            ['user_id' => $emma->id,  'action' => 'status_changed', 'entity_type' => 'Lead', 'entity_id' => $leads[3]->id,  'entity_label' => 'SkyNet Logistics',      'description' => 'Lead status changed to lost.'],
            ['user_id' => $emma->id,  'action' => 'created',        'entity_type' => 'Lead', 'entity_id' => $leads[5]->id,  'entity_label' => 'NovaCraft Studios',     'description' => 'Lead NovaCraft Studios was created.'],
            ['user_id' => $admin->id, 'action' => 'created',        'entity_type' => 'Lead', 'entity_id' => $leads[11]->id, 'entity_label' => 'Orbit Media Solutions', 'description' => 'Lead Orbit Media Solutions was created.'],

            // Deal activities
            ['user_id' => $admin->id, 'action' => 'created',        'entity_type' => 'Deal', 'entity_id' => $deals[0]->id, 'entity_label' => 'Acme CRM Enterprise License',     'description' => 'Deal Acme CRM Enterprise License was created.'],
            ['user_id' => $mike->id,  'action' => 'stage_changed',  'entity_type' => 'Deal', 'entity_id' => $deals[0]->id, 'entity_label' => 'Acme CRM Enterprise License',     'description' => 'Deal moved to Negotiation stage.'],
            ['user_id' => $admin->id, 'action' => 'created',        'entity_type' => 'Deal', 'entity_id' => $deals[1]->id, 'entity_label' => 'Global Ventures — Expansion Pack', 'description' => 'Deal Global Ventures — Expansion Pack was created.'],
            ['user_id' => $emma->id,  'action' => 'stage_changed',  'entity_type' => 'Deal', 'entity_id' => $deals[1]->id, 'entity_label' => 'Global Ventures — Expansion Pack', 'description' => 'Deal moved to Proposal Sent stage.'],
            ['user_id' => $emma->id,  'action' => 'stage_changed',  'entity_type' => 'Deal', 'entity_id' => $deals[3]->id, 'entity_label' => 'MediaWorks — Annual Renewal',       'description' => 'Deal marked as Won.'],
            ['user_id' => $admin->id, 'action' => 'stage_changed',  'entity_type' => 'Deal', 'entity_id' => $deals[6]->id, 'entity_label' => 'RetailMax — Partner Renewal',       'description' => 'Deal marked as Won.'],
            ['user_id' => $mike->id,  'action' => 'stage_changed',  'entity_type' => 'Deal', 'entity_id' => $deals[7]->id, 'entity_label' => 'BuildRight — Field Sales CRM',      'description' => 'Deal marked as Lost.'],
            ['user_id' => $emma->id,  'action' => 'created',        'entity_type' => 'Deal', 'entity_id' => $deals[8]->id, 'entity_label' => 'Stephanie Brown — Board Initiative', 'description' => 'Deal Stephanie Brown — Board Initiative was created.'],
        ];

        foreach ($entries as $i => $entry) {
            Activity::create(array_merge($entry, [
                'created_at' => now()->subHours(count($entries) - $i),
                'updated_at' => now()->subHours(count($entries) - $i),
            ]));
        }
    }

    // -------------------------------------------------------------------------
    // Clear
    // -------------------------------------------------------------------------

    /**
     * Wipe all CRM data tables before re-seeding.
     * Preserves: roles, permissions, settings, and the admin user.
     */
    public function clearDemoData(): void
    {
        // Disable FK checks so we can truncate in any order
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        DB::table('activities')->truncate();
        DB::table('tasks')->truncate();
        DB::table('deal_products')->truncate();
        DB::table('deal_tag')->truncate();
        DB::table('deals')->truncate();
        DB::table('lead_notes')->truncate();
        DB::table('lead_tag')->truncate();
        DB::table('leads')->truncate();
        DB::table('contact_notes')->truncate();
        DB::table('contact_tag')->truncate();
        DB::table('contacts')->truncate();
        DB::table('companies')->truncate();
        DB::table('tags')->truncate();

        // Remove demo users (keep admin)
        User::whereIn('email', [
            'manager@minicrm.test',
            'mike@minicrm.test',
            'emma@minicrm.test',
        ])->forceDelete();

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}
