# Demo Reset

Mini CRM includes a built-in demo mode for live demo environments. It resets all CRM data to a clean, realistic state on a schedule.

## What the Demo Seeder Creates

Running `DemoSeeder` populates the entire CRM with realistic data:

| Entity | Count | Details |
|--------|-------|---------|
| Users | 4 | Admin, Manager (Sarah), Sales (Mike), Sales (Emma) |
| Companies | 8 | Tech, Finance, SaaS, Media, Healthcare, Retail… |
| Tags | 8 | VIP, Hot Lead, Cold, Partner, Enterprise, SMB, Referral, Event |
| Contacts | 15 | Linked to companies, tagged, with notes |
| Leads | 12 | All 5 statuses, all sources, some with overdue follow-ups |
| Deals | 10 | All 5 stages with line-item products and probabilities |
| Tasks | 15 | Linked to contacts, leads, deals + 2 standalone |
| Activities | 25 | Full activity feed across all entity types |

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@minicrm.test` | `password` |
| Manager | `manager@minicrm.test` | `password` |
| Sales | `mike@minicrm.test` | `password` |
| Sales | `emma@minicrm.test` | `password` |

## Seed Demo Data (One Time)

```bash
php artisan db:seed --class=DemoSeeder
```

## Reset Demo Data Manually

```bash
php artisan demo:reset
```

You will be asked to confirm. To skip the prompt:

```bash
php artisan demo:reset --force
```

## Automatic Reset Every 4 Hours

The `demo:reset --force` command is automatically scheduled to run every 4 hours via `CoreServiceProvider`. This keeps a live demo environment clean after visitors make changes.

Logs are written to `storage/logs/demo-reset.log`.

To disable the automatic reset, remove or comment out the schedule in `Modules/Core/app/Providers/CoreServiceProvider.php`:

```php
// $schedule->command('demo:reset --force')->everyFourHours()...
```

## What Gets Preserved

The reset **does not** touch:
- Spatie roles and permissions
- Application settings (logo, title, etc.)
- The `admin@minicrm.test` account

Everything else (companies, contacts, tags, leads, deals, tasks, activities, and the 3 demo users) is wiped and recreated fresh.
