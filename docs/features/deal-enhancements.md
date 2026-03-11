---
title: Deal Enhancements
parent: Features
nav_order: 16
---

# Deal Enhancements
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Beyond the core pipeline, Mini CRM includes several deal enrichment features: line-item products, win probability scoring, and close-date alerts.

---

## Win Probability

Each deal has a `probability` field (0–100 %) that represents the likelihood of closing. Probabilities are pre-filled based on stage but can be overridden manually.

### Default probabilities by stage

| Stage | Default Probability |
|-------|---------------------|
| New Deal | 10 % |
| Proposal Sent | 30 % |
| Negotiation | 60 % |
| Won | 100 % |
| Lost | 0 % |

When you move a deal to a new stage (drag-and-drop or edit), the probability is automatically updated to the stage default unless you have manually changed it.

### Probability slider

The deal create/edit modal includes a slider from 0 to 100. The current value is shown as a badge next to the slider.

### Weighted pipeline

The Reports page uses probability to calculate a weighted pipeline:

```
Weighted Value = deal.value × deal.probability / 100
```

Example: a deal worth $20,000 at 60 % contributes $12,000 to the weighted pipeline total.

---

## Deal Products / Line Items

Each deal can have one or more product line items. The deal's total value is the sum of all line items.

### Line item fields

| Field | Type | Required |
|-------|------|----------|
| Name | text | Yes |
| Quantity | integer | Yes |
| Unit Price | decimal | Yes |

### Managing line items

On the Deal detail page, scroll to the **Products** section:

- Click **+ Add Product** to open an inline form.
- Fill in name, quantity, and unit price — the row total (`qty × price`) updates live.
- Click the trash icon on a row to remove it.
- The deal's total value recalculates automatically.

{: .note }
> You can also enter a manual value on the deal (bypassing line items) by leaving the Products section empty.

### Database schema

```
deal_products
├── id
├── deal_id (FK → deals)
├── name
├── quantity
├── unit_price
├── created_at
└── updated_at
```

---

## Close-Date Alerts

The deals list and Kanban board highlight upcoming and overdue close dates:

| Condition | Visual indicator |
|-----------|-----------------|
| `expected_closing_date` within the next 7 days | Amber row highlight / amber badge |
| `expected_closing_date` has passed and stage is not `won` or `lost` | Red row highlight / "Overdue" badge |

### Dashboard widget

The Admin/Manager dashboard includes a **"Closing this week"** stat card showing the count of open deals with close dates in the next 7 days.

---

## Database Schema

```
deals
├── id
├── title
├── value (decimal)
├── probability (integer, default per stage)
├── contact_id (FK → contacts)
├── stage (enum)
├── expected_closing_date (nullable date)
├── assigned_user_id (FK → users)
├── created_by (FK → users)
├── deleted_at (nullable — soft delete)
├── created_at
└── updated_at
```
