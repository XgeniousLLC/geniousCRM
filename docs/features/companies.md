---
title: Companies
parent: Features
nav_order: 8
---

# Companies
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Companies represent organisations in your CRM. Contacts and deals are linked to companies, giving you a 360-degree view of every account.

**Route prefix:** `/companies`
**Module:** `Company`
**Access:** All roles

---

## Company Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | text | Yes | Company or organisation name |
| Industry | text | No | Sector (e.g. Technology, Finance) |
| Website | text | No | Company URL |
| Phone | text | No | Main switchboard number |
| Address | textarea | No | Postal address |

---

## Listing Companies

**Route:** `GET /companies`

| Feature | Description |
|---------|-------------|
| Search | Matches name and industry |
| Sort | Name, industry, or created date (ascending/descending) |
| Contacts count | Shown in the table as a number |
| Pagination | 25 per page |

---

## Company Detail Page

**Route:** `GET /companies/{id}`

The detail page is a single-page view of everything connected to the company:

### Linked Contacts
All contacts whose `company_id` equals this company's ID. Clicking a contact name navigates to the contact detail page.

### Linked Deals
Deals linked via any of the company's contacts. Shows title, value, stage badge, and assigned user.

### Tasks
Tasks attached directly to the company record (polymorphic `taskable_type = 'Company'`). You can add and update tasks from this panel.

### Activity Feed
All activity events logged against this company (creates, updates, notes).

---

## Linking a Contact to a Company

When creating or editing a contact, a **Company** dropdown appears alongside the free-text company field. Selecting a company from the dropdown sets `contact.company_id`.

- A contact can belong to **one** company.
- Changing the company updates the previous company's contact count immediately.

---

## Creating a Company Inline

You can create companies from the Companies list page (**+ New Company** button) and then link existing contacts to it via the contact edit modal.

---

## Trash / Restore

Deleted companies do **not** have soft delete in the current version — deletion is permanent. Linked contacts keep their `company_id` but the company name will no longer resolve.

{: .warning }
> Deleting a company does not delete linked contacts or deals.

---

## Controller Reference

**File:** `Modules/Company/app/Http/Controllers/CompanyController.php`

| Method | Route | Description |
|--------|-------|-------------|
| `index` | `GET /companies` | Paginated list with search and sort |
| `show` | `GET /companies/{id}` | Detail page with contacts, deals, tasks, activities |
| `store` | `POST /companies` | Create company |
| `update` | `PUT /companies/{id}` | Update company fields |
| `destroy` | `DELETE /companies/{id}` | Permanent delete |

---

## Database Schema

```
companies
├── id
├── name
├── industry (nullable)
├── website (nullable)
├── phone (nullable)
├── address (nullable)
├── created_by (FK → users, nullOnDelete)
├── created_at
└── updated_at

contacts
└── company_id (FK → companies, nullable, nullOnDelete)
```
