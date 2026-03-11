---
title: Activity Tracking
parent: Features
nav_order: 7
---

# Activity Tracking
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Every significant action in Mini CRM is automatically recorded in the activity feed. You never have to manually log what happened — the system does it for you.

**Route:** `GET /activities`
**Module:** `Activity`
**Access:** Admin, Manager

---

## What Gets Logged

| Trigger | Activity message example |
|---------|--------------------------|
| Contact created | "Created contact John Smith" |
| Contact updated | "Updated contact John Smith" |
| Lead created | "Created lead Acme Corp" |
| Lead status changed | "Updated lead status to Qualified" |
| Lead converted | "Converted lead to contact" |
| Deal created | "Created deal Website Redesign" |
| Deal stage changed | "Moved deal to Negotiation" |
| Note added (contact) | "Added note to contact John Smith" |
| Note added (lead) | "Added note to lead Acme Corp" |
| Company created | "Created company Acme Corp" |
| Company updated | "Updated company Acme Corp" |

Activities are logged via `ActivityService::log()` — a central static method called from every controller that creates or mutates a CRM entity.

---

## Global Activity Feed

**Route:** `GET /activities`

The global feed shows all activity across every entity, newest first. Available to admin and manager roles only.

**Filters:**

| Filter | Options |
|--------|---------|
| Entity type | Contact, Lead, Deal, Company |
| Action | created, updated, deleted, stage_changed, converted, note_added |

---

## Per-Entity Activity Feed

Every entity detail page (Contact, Lead, Deal, Company) shows a filtered activity feed showing only events for that specific record.

The feed displays:
- Action description
- User who performed the action
- Relative timestamp ("2 hours ago")

---

## ActivityService

**File:** `Modules/Activity/app/Services/ActivityService.php`

```php
// Usage from any controller:
ActivityService::log(
    action:      'created',
    entityType:  'Contact',
    entityId:    $contact->id,
    description: $contact->full_name
);
```

The service writes a row to the `activities` table with:

| Column | Description |
|--------|-------------|
| `user_id` | Currently authenticated user |
| `action` | Action type string |
| `entity_type` | Model type (`Contact`, `Lead`, etc.) |
| `entity_id` | ID of the affected record |
| `description` | Human-readable context string |
| `created_at` | Timestamp |

---

## Database Table

```
activities
├── id
├── user_id (FK → users)
├── action
├── entity_type
├── entity_id
├── description (nullable)
└── created_at
```

There is no `updated_at` — activities are immutable once written.
