---
title: Trash & Restore
parent: Features
nav_order: 12
---

# Trash & Restore
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Contacts, Leads, and Deals use Laravel's soft-delete mechanism. When you delete a record it moves to Trash rather than being permanently removed. You can restore it or permanently delete it from the Trash page.

**Route:** `GET /trash`
**Access:** Admin only

---

## Accessing Trash

Click **Trash** in the sidebar (admin only). The Trash page has three tabs:

| Tab | Contents |
|-----|----------|
| **Contacts** | Soft-deleted contacts with count badge |
| **Leads** | Soft-deleted leads with count badge |
| **Deals** | Soft-deleted deals with count badge |

Switch between tabs to view each entity type.

---

## Soft Delete

When you click **Delete** on any Contact, Lead, or Deal:

- The record is **not** removed from the database.
- A `deleted_at` timestamp is set on the row.
- The record disappears from all regular list pages and search results.
- Related data (notes, tasks, activities) is preserved.

---

## Restoring a Record

In the Trash page, click **Restore** on any row.

- The `deleted_at` column is set back to `null`.
- The record reappears in its normal list page immediately.
- All related data (notes, tasks, activities) is intact.

| Restore Route | Description |
|---------------|-------------|
| `PATCH /contacts/{id}/restore` | Restore a soft-deleted contact |
| `PATCH /leads/{id}/restore` | Restore a soft-deleted lead |
| `PATCH /deals/{id}/restore` | Restore a soft-deleted deal |

---

## Permanently Deleting a Record

Click **Delete Permanently** on any row in the Trash page. A confirmation prompt appears before the action executes.

{: .warning }
> Permanent deletion cannot be undone. The database row is removed.

| Force-Delete Route | Description |
|--------------------|-------------|
| `DELETE /contacts/{id}/force` | Permanently delete a contact |
| `DELETE /leads/{id}/force` | Permanently delete a lead |
| `DELETE /deals/{id}/force` | Permanently delete a deal |

---

## What Is NOT Soft-Deleted

| Entity | Deletion behaviour |
|--------|--------------------|
| **Companies** | Permanent — no soft delete |
| **Tasks** | Soft-deleted (not shown in Trash UI — deleted silently) |
| **Notes** | Hard deleted immediately |
| **Activities** | Immutable — never deleted |

---

## Database Columns

Each soft-deletable table has a `deleted_at` column:

```
contacts  → deleted_at (nullable timestamp)
leads     → deleted_at (nullable timestamp)
deals     → deleted_at (nullable timestamp)
tasks     → deleted_at (nullable timestamp)
```

Laravel's `SoftDeletes` trait automatically filters out rows where `deleted_at IS NOT NULL` in all standard queries.

---

## Controller Reference

**File:** `Modules/Core/app/Http/Controllers/TrashController.php`

| Method | Route | Description |
|--------|-------|-------------|
| `index` | `GET /trash` | Unified trash page with all three entity types |

Restore and force-delete actions are handled by their respective module controllers:

- `Modules/Contact/app/Http/Controllers/ContactTrashController.php`
- `Modules/Lead/app/Http/Controllers/LeadTrashController.php`
- `Modules/Deal/app/Http/Controllers/DealTrashController.php`
