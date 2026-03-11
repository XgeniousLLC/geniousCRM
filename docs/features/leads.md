---
title: Leads
parent: Features
nav_order: 4
---

# Leads
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Leads track prospective customers before they become contacts. Each lead moves through a qualification pipeline and can be converted into a contact when qualified.

**Route prefix:** `/leads`
**Module:** `Lead`
**Access:** All roles

---

## Lead Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | text | Yes | Full name of the prospect |
| Email | email | No | |
| Phone | text | No | |
| Source | select | No | Where the lead came from |
| Status | select | Yes | Current pipeline stage |
| Assigned To | select | No | Sales user responsible for this lead |
| Follow-up Date | date | No | Reminder date for next contact |
| Notes | textarea | No | Initial notes on the lead |

---

## Lead Sources

Sources are a predefined enum — no free text is accepted:

| Value | Label |
|-------|-------|
| `Website` | Website |
| `Referral` | Referral |
| `LinkedIn` | LinkedIn |
| `Cold Outreach` | Cold Outreach |
| `Event` | Event |
| `Advertisement` | Advertisement |
| `Other` | Other |

---

## Lead Statuses

| Status | Colour | Meaning |
|--------|--------|---------|
| `new` | Blue | Freshly created, not yet contacted |
| `contacted` | Yellow | Initial contact made |
| `qualified` | Green | Confirmed as a valid prospect |
| `lost` | Red | No longer pursuing |
| `converted` | Purple | Converted to a contact |

---

## Follow-up Dates

Each lead can have a `follow_up_date`. The system highlights overdue and upcoming follow-ups:

| Highlight | Condition |
|-----------|-----------|
| Red badge | Follow-up date is in the past |
| Amber badge | Follow-up date is today |

The Dashboard **Follow-ups Due** stat card counts all leads where `follow_up_date <= today`.

---

## Listing Leads

**Route:** `GET /leads`

Filtering options:

| Filter | Description |
|--------|-------------|
| Search | Matches name and email |
| Status | Dropdown — filters to a single status |
| Tag | Filters leads that have the selected tag |
| Sort | Name, status, follow-up date, or created date |

---

## Converting a Lead to a Contact

Click **Convert** in the row actions or lead detail page.

What happens:
1. The lead's name is split into `first_name` and `last_name`.
2. A new Contact is created with the lead's email, phone, and source.
3. The lead's status is set to `converted`.
4. An activity entry is logged: `"Lead converted to contact"`.

The original lead record is preserved (soft conversion — no deletion).

---

## Notes

Each lead has a notes drawer. Notes are timestamped, attributed to their author, and displayed newest-first.

---

## Duplicate Detection

On creation, the system checks for existing leads (and contacts) with the same email or phone. A warning modal shows matches; you can proceed or cancel.

---

## CSV Import

Bulk-create leads from a `.csv` file. See [CSV Import](csv-import) for the full guide.

---

## Trash / Restore

Deleted leads appear in **Trash → Leads** tab. Restore returns the lead to the active list; permanent delete is irreversible.

---

## Controller Reference

**File:** `Modules/Lead/app/Http/Controllers/LeadController.php`

| Method | Route | Description |
|--------|-------|-------------|
| `index` | `GET /leads` | Paginated list with filters |
| `store` | `POST /leads` | Create lead (with duplicate check) |
| `update` | `PUT /leads/{id}` | Update lead + assignment notification |
| `destroy` | `DELETE /leads/{id}` | Soft-delete |
| `convert` | `POST /leads/{id}/convert` | Convert to contact |
| `export` | `GET /leads/export` | Download leads as CSV |
