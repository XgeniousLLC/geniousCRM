---
title: CSV Import
parent: Features
nav_order: 11
---

# CSV Import
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Mini CRM supports bulk importing Contacts and Leads from CSV files. The import flow includes column mapping and a preview step before committing data.

**Modules:** `Contact`, `Lead`
**Access:** Admin, Manager

---

## Importing Contacts

**Route:** `GET /contacts/import`

### Step 1 — Upload

Click **Import CSV** on the Contacts list page. You are taken to the import page where you upload your `.csv` file.

Required: at least a `first_name` (or `name`) column.

### Step 2 — Column Mapping

After upload, a mapping table shows your CSV headers on the left and a dropdown of CRM fields on the right.

| CSV Header | Maps to CRM Field |
|------------|-------------------|
| First Name | `first_name` |
| Last Name  | `last_name` |
| Email      | `email` |
| Phone      | `phone` |
| Company    | `company` |

Unmapped columns are ignored.

### Step 3 — Preview

A preview table shows the first 5 rows with your mapping applied. Review for obvious mistakes before submitting.

### Step 4 — Import

Click **Import**. The system processes the file in chunks of 100 rows:

- Rows with invalid or duplicate emails are **skipped**.
- Rows missing required fields are **skipped**.
- A summary flash message reports: `"X imported, Y skipped"`.

---

## Importing Leads

**Route:** `GET /leads/import`

Identical flow to Contact import. The available mapping fields are:

| CSV Header | Maps to CRM Field |
|------------|-------------------|
| Name       | `name` |
| Email      | `email` |
| Phone      | `phone` |
| Source     | `source` |
| Status     | `status` |

### Valid `source` values

`Website`, `Referral`, `LinkedIn`, `Cold Outreach`, `Event`, `Advertisement`, `Other`

### Valid `status` values

`new`, `contacted`, `qualified`, `lost`, `converted`

Invalid values in these columns default to `Website` and `new` respectively.

---

## CSV Format Requirements

- First row must be a header row.
- File encoding must be UTF-8.
- Delimiter must be a comma (`,`).
- Maximum file size: limited by your server's `upload_max_filesize` PHP setting (default 8 MB).

---

## Example CSV (Contacts)

```csv
first_name,last_name,email,phone,company
Alice,Smith,alice@example.com,+44 7700 900001,Acme Ltd
Bob,Jones,bob@example.com,,
```

---

## Controller Reference

| Controller | File |
|------------|------|
| `ContactImportController` | `Modules/Contact/app/Http/Controllers/ContactImportController.php` |
| `LeadImportController` | `Modules/Lead/app/Http/Controllers/LeadImportController.php` |

| Method | Route | Description |
|--------|-------|-------------|
| `showForm` | `GET /contacts/import` | Upload + mapping form |
| `import` | `POST /contacts/import` | Process CSV and insert records |
| `showForm` | `GET /leads/import` | Upload + mapping form |
| `import` | `POST /leads/import` | Process CSV and insert records |
