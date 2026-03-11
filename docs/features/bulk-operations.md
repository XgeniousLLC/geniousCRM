---
title: Bulk Operations
parent: Features
nav_order: 18
---

# Bulk Operations
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Bulk operations let you perform actions on multiple records at once from the list pages, saving time when managing large datasets.

**Modules:** `Contact`, `Lead`
**Access:** Admin, Manager

---

## Selecting Records

Each list page (Contacts, Leads) has a checkbox column:

- **Header checkbox** — selects or deselects all records on the current page.
- **Row checkbox** — selects an individual record.

When one or more records are selected, a **Bulk Actions** toolbar appears above the table.

---

## Available Bulk Actions

### Contacts

| Action | Description |
|--------|-------------|
| **Delete selected** | Soft-delete all selected contacts |
| **Assign tag** | Attach a tag to all selected contacts |
| **Export selected** | Download a CSV of the selected contacts |

### Leads

| Action | Description |
|--------|-------------|
| **Delete selected** | Soft-delete all selected leads |
| **Assign user** | Reassign all selected leads to a chosen user |
| **Change status** | Update the status of all selected leads |

---

## Bulk Delete

1. Select the records you want to remove.
2. Click **Delete selected** in the toolbar.
3. A confirmation dialog appears: "Delete X records?"
4. Confirm — all selected records are soft-deleted and move to Trash.

---

## Bulk Tag Assignment (Contacts)

1. Select contacts.
2. Click **Assign tag** — a tag picker dropdown opens.
3. Choose one or more tags.
4. Click Apply — the tags are added to all selected contacts (existing tags are preserved).

---

## Bulk User Assignment (Leads)

1. Select leads.
2. Click **Assign user** — a user picker dropdown opens.
3. Select the user to assign.
4. Click Apply — `assigned_user_id` is updated on all selected leads and each assigned user receives a notification.

---

## Bulk Status Change (Leads)

1. Select leads.
2. Click **Change status** — a status dropdown opens.
3. Select the new status.
4. Click Apply — all selected leads are updated.

---

## Controller Reference

| Method | Route | Description |
|--------|-------|-------------|
| `bulkDestroy` | `DELETE /contacts/bulk` | Soft-delete array of contact IDs |
| `bulkTag` | `POST /contacts/bulk-tag` | Attach tag to array of contact IDs |
| `bulkDestroy` | `DELETE /leads/bulk` | Soft-delete array of lead IDs |
| `bulkAssign` | `POST /leads/bulk-assign` | Reassign array of lead IDs |
| `bulkStatus` | `POST /leads/bulk-status` | Update status for array of lead IDs |

All bulk endpoints validate that each ID in the array belongs to the authenticated user's accessible records.
