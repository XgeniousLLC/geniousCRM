# CSV Import

Import contacts and leads in bulk from any spreadsheet tool (Excel, Google Sheets, etc.).

## Supported Imports

- **Contacts** — via the Contacts list page
- **Leads** — via the Leads list page

## Step-by-Step Guide

### Step 1 — Prepare your CSV

Export your spreadsheet as a `.csv` file. Ensure:
- The first row contains column headers
- Each subsequent row is one record
- Emails are valid format (invalid rows will be skipped)

### Step 2 — Upload the File

1. Go to **Contacts** (or **Leads**) in the sidebar
2. Click **Import CSV**
3. Click **Choose File** and select your `.csv` file
4. Click **Upload**

### Step 3 — Map Columns

Mini CRM shows a column mapping screen. For each column in your CSV, choose which CRM field it maps to.

| CSV Column | Maps to CRM Field |
|-----------|------------------|
| `Full Name` | First Name + Last Name (split on space) |
| `Email Address` | Email |
| `Mobile` | Phone |
| `Organisation` | Company |

Unmapped columns are ignored.

### Step 4 — Preview

A preview table shows the first 5 rows with your mapping applied. Check that names and emails look correct before continuing.

### Step 5 — Import

Click **Import**. Mini CRM processes the file in chunks of 100 rows.

After completion you'll see a summary:

> **Imported: 47 records. Skipped: 3 rows (invalid email).**

Skipped rows are those with missing required fields or duplicate emails.

## CSV Format Tips

::: tip Preparing contacts CSV
Recommended columns: `first_name`, `last_name`, `email`, `phone`, `company`
:::

::: tip Preparing leads CSV
Recommended columns: `name`, `email`, `phone`, `source`, `status`

Valid sources: `Website`, `Referral`, `LinkedIn`, `Cold Outreach`, `Event`, `Advertisement`, `Other`

Valid statuses: `new`, `contacted`, `qualified`, `lost`
:::

## Limits

- Maximum file size: 10 MB
- No row limit — large files are chunked automatically
- Duplicate emails are detected and skipped for contacts

## After Importing

Tags, notes, and company links cannot be imported via CSV — add them manually after import or use the API for bulk updates.
