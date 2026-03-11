---
title: Onboarding
parent: Features
nav_order: 21
---

# Onboarding
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

The Onboarding wizard appears automatically on first login for admin users when the CRM contains no data. It guides you through the essential setup steps and can be dismissed permanently at any time.

**Route:** `GET /onboarding`
**Module:** `Core`
**Access:** Admin only

---

## When Onboarding Appears

The wizard is triggered when **all** of the following are true:

1. The logged-in user is an **admin**.
2. There are **0 contacts**, **0 leads**, and **0 deals** in the database.
3. The setting `onboarding_dismissed` has **not** been set to `"1"`.

A shared Inertia prop `onboarding_required: true` is injected by `AppServiceProvider` when these conditions are met. The `AppLayout` component automatically redirects to `/onboarding` when this prop is true.

---

## Wizard Steps

The wizard has 4 steps with a progress indicator at the top:

### Step 1 — Welcome

Introduction to Mini CRM. Brief description of the modules (Contacts, Leads, Deals, Tasks).

Action: **Get started →**

---

### Step 2 — Invite Your Team

Prompt to invite team members. Shows a button linking to the **Users** page (`/users`) where you can create accounts.

This step is informational — you can skip it.

---

### Step 3 — Import Your Data

Prompt to import existing contacts or leads via CSV. Shows buttons linking to:

- **Import Contacts** (`/contacts/import`)
- **Import Leads** (`/leads/import`)

This step is optional — most users skip it and add data manually.

---

### Step 4 — Done

Confirmation screen. Click **Go to Dashboard** to finish.

---

## Skipping the Wizard

Click **Skip setup** at any point. This immediately:

1. Calls `POST /onboarding/dismiss`.
2. Sets the `onboarding_dismissed` setting to `"1"`.
3. Redirects to the dashboard.

The wizard will never appear again for this installation.

---

## Dismissing from the Wizard

Both **Skip setup** (available on every step) and **Go to Dashboard** (final step) call the dismiss endpoint, permanently suppressing the wizard.

---

## Re-triggering Onboarding

If you want to reset the onboarding state (e.g. for testing), delete the setting record:

```sql
DELETE FROM settings WHERE `key` = 'onboarding_dismissed';
```

Or from the Laravel REPL:

```bash
php artisan tinker
>>> \Modules\Core\app\Services\SettingService::set('onboarding_dismissed', '');
```

---

## Controller Reference

**File:** `Modules/Core/app/Http/Controllers/OnboardingController.php`

| Method | Route | Description |
|--------|-------|-------------|
| `index` | `GET /onboarding` | Render wizard (redirects if already dismissed) |
| `dismiss` | `POST /onboarding/dismiss` | Set dismissed flag and redirect to dashboard |
