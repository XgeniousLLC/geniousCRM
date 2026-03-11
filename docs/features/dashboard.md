---
title: Dashboard
parent: Features
nav_order: 1
---

# Dashboard
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

The Dashboard is the first page you see after logging in. It provides a real-time snapshot of your CRM data so you can spot trends and act quickly without digging into individual modules.

**Route:** `GET /dashboard`
**Module:** `Core`
**Access:** All roles (admin, manager, sales_user)

---

## Stat Cards

Six summary cards are displayed at the top of the dashboard:

| Card | Description |
|------|-------------|
| **Total Contacts** | Count of all active (non-deleted) contacts |
| **Open Leads** | Leads with status `new`, `contacted`, or `qualified` |
| **Active Deals** | Deals not in `won` or `lost` stage |
| **Open Tasks** | Tasks with status `pending` or `in_progress` |
| **Follow-ups Due** | Leads with a `follow_up_date` on or before today |
| **Closing This Week** | Open deals whose `expected_closing_date` falls within the next 7 days |

Each card is colour-coded and links directly to the relevant list page with the appropriate filter pre-applied.

---

## Role-Based Visibility

Dashboard counts respect role permissions:

- **Admin / Manager** — see all records across all users
- **Sales User** — sees only records assigned to or created by themselves

This is enforced at the query level in `DashboardController::index()`, not just the UI.

---

## Data Freshness

Stats are computed on every page load — no caching — so figures always reflect the current state of the database.

---

## Controller Reference

**File:** `Modules/Core/app/Http/Controllers/DashboardController.php`

```php
public function index(): Response
{
    return Inertia::render('Core/Dashboard', [
        'stats' => [
            'contacts'         => Contact::count(),
            'open_leads'       => Lead::whereIn('status', ['new','contacted','qualified'])->count(),
            'active_deals'     => Deal::whereNotIn('stage', ['won','lost'])->count(),
            'open_tasks'       => Task::whereIn('status', ['pending','in_progress'])->count(),
            'follow_up_due'    => Lead::whereDate('follow_up_date', '<=', today())->count(),
            'closing_this_week'=> Deal::whereBetween('expected_closing_date', [today(), today()->addDays(7)])
                                       ->whereNotIn('stage', ['won','lost'])->count(),
        ],
    ]);
}
```
