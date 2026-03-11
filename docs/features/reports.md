---
title: Reports
parent: Features
nav_order: 9
---

# Reports
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

The Reports module gives admins and managers a visual overview of pipeline health, lead conversion, and sales performance. All charts update dynamically based on the selected date range and support CSV export.

**Route:** `GET /reports`
**Module:** `Report`
**Access:** Admin, Manager

---

## Date Range Filter

A date picker at the top of the reports page lets you filter all metrics to a custom range. The default view shows the last 30 days.

| Input | Description |
|-------|-------------|
| From | Start date (inclusive) |
| To | End date (inclusive) |

Changing the range reloads all charts and numbers for that period.

---

## Summary Stats

Four top-level stat cards:

| Stat | Calculation |
|------|-------------|
| **Total Contacts** | All contacts created in the date range |
| **Total Leads** | All leads created in the date range |
| **Converted Leads** | Leads with `status = converted` in the range |
| **Total Deal Value** | Sum of all deal values in the range |

---

## Deals by Stage (Bar Chart)

A horizontal bar chart grouped by stage shows how many deals currently sit in each stage:

- New Deal
- Proposal Sent
- Negotiation
- Won
- Lost

This gives an at-a-glance view of pipeline health and where deals are stalling.

---

## Lead Conversion Rate

Displays the ratio of converted leads to total leads as a percentage:

```
Conversion Rate = (Converted Leads / Total Leads) × 100
```

A secondary breakdown shows leads by source (Website, Referral, LinkedIn, etc.) so you can see which channels produce the most qualified prospects.

---

## Sales Pipeline Report

Lists all open deals (not won or lost) grouped by stage, with:

- Deal count per stage
- Total value per stage
- **Weighted value** per stage (value × probability / 100)
- Overall weighted pipeline total

The weighted pipeline is particularly useful for revenue forecasting — it accounts for the fact that not all open deals will close.

---

## Weighted Pipeline Formula

```
Weighted Pipeline = SUM(deal.value × deal.probability / 100)
```

Example: A deal worth $10,000 at 60 % probability contributes $6,000 to the weighted pipeline.

---

## CSV Export

Two export buttons are available:

| Export | Contents |
|--------|---------|
| **Export Contacts** | All active contacts (id, name, email, phone, company, tags, created\_at) |
| **Export Leads** | All active leads (id, name, email, status, source, follow\_up\_date, created\_at) |

Files download immediately as `.csv` — no email or background job required.

---

## Controller Reference

**File:** `Modules/Report/app/Http/Controllers/ReportController.php`

| Method | Route | Description |
|--------|-------|-------------|
| `index` | `GET /reports` | Main report dashboard with all charts |
| `exportContacts` | `GET /reports/export-contacts` | Download contacts CSV |
| `exportLeads` | `GET /reports/export-leads` | Download leads CSV |
