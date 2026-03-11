---
title: Contacts
parent: Features
nav_order: 3
---

# Contacts
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Contacts are the people and organisations at the heart of your CRM. Each contact can be tagged, linked to a company, enriched with notes, and associated with leads, deals, and tasks.

**Route prefix:** `/contacts`
**Module:** `Contact`
**Access:** All roles

---

## Contact Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| First Name | text | Yes | |
| Last Name | text | Yes | |
| Email | email | No | Must be unique if provided |
| Phone | text | No | |
| Company (text) | text | No | Free-text company name |
| Company (linked) | select | No | Links to a Company record |
| Tags | multi-select | No | Colour-coded labels |

---

## Listing Contacts

**Route:** `GET /contacts`

The contacts list supports:

- **Search** — matches against first name, last name, email, and company.
- **Filter by tag** — dropdown above the table; shows only contacts with the selected tag.
- **Sort** — click any column header (Name, Company, Created) to toggle ascending/descending order.
- **Pagination** — 25 records per page; query string is preserved across page changes.

---

## Creating a Contact

Click **+ New Contact** in the top-right of the list page. A modal slide-in opens with all contact fields.

On submit:
1. Server validates the data (unique email, required first/last name).
2. Duplicate detection runs — if another contact shares the same email or phone, a warning is shown with the matching record(s). You can proceed anyway or cancel.
3. Contact is created and the list refreshes.

---

## Editing a Contact

Click **Edit** in the row actions. The same modal opens pre-filled with the contact's current data. Only changed fields are sent to the server.

---

## Deleting a Contact

Click **Delete** in the row actions. A confirmation dialog appears. Deletion is a **soft delete** — the record moves to Trash and can be restored. See [Trash](trash) for details.

---

## Notes

Each contact has a notes side-drawer accessible from the contact detail page.

- Notes are timestamped and attributed to the user who wrote them.
- Notes can be deleted by their author or by an admin.
- Notes are rendered in chronological order (oldest first).

**Note fields:**

| Field | Description |
|-------|-------------|
| Body | Free-text note content (up to 65 535 chars) |

---

## Tags

Tags are shared across the system. They can be created inline when editing a contact.

- A contact can have multiple tags.
- Filtering by tag on the list page performs an exact match — only contacts that have **at least** that tag are shown.
- Tags are stored in the `tags` table with a `contact_tag` pivot.

---

## CSV Import

Bulk import contacts from a `.csv` file. See the [CSV Import](csv-import) guide for the full walkthrough.

---

## Linked Company

Selecting a **Company** from the dropdown links the contact to a Company record (see [Companies](companies)). This enables:

- The company detail page to show all its contacts.
- Deals linked via the contact to be surfaced on the company page.

The free-text **Company (text)** field is separate and can hold any string independently of the linked Company record.

---

## Trash / Restore

Deleted contacts appear in **Trash → Contacts** tab. From there you can:

- **Restore** — moves the contact back to the active list.
- **Delete permanently** — irreversible; removes the row from the database.

---

## Duplicate Detection

When creating a new contact the system checks for existing records with the same email or phone number. If duplicates are found a modal warns you and shows matching contacts. You can:

- **Continue anyway** — create the contact despite the match.
- **Cancel** — go back and merge or update the existing record.

---

## Controller Reference

**File:** `Modules/Contact/app/Http/Controllers/ContactController.php`

| Method | Route | Description |
|--------|-------|-------------|
| `index` | `GET /contacts` | Paginated list with search, tag filter, sort |
| `store` | `POST /contacts` | Create contact (with duplicate check) |
| `update` | `PUT /contacts/{id}` | Update contact fields and tags |
| `destroy` | `DELETE /contacts/{id}` | Soft-delete |
| `bulkDestroy` | `DELETE /contacts/bulk` | Soft-delete selected IDs |
| `bulkTag` | `POST /contacts/bulk-tag` | Attach a tag to selected contacts |
| `export` | `GET /contacts/export` | Download CSV of all contacts |
