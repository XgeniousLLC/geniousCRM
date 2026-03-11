---
title: Deals
parent: Features
nav_order: 5
---

# Deals
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Deals represent sales opportunities. They move through a pipeline of stages from initial contact to won or lost. The pipeline can be viewed as a Kanban board or a sortable table.

**Route prefix:** `/deals` (list/table), `/pipeline` (Kanban board)
**Module:** `Deal`
**Access:** All roles

---

## Deal Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Title | text | Yes | Short name for the deal |
| Value | decimal | No | Monetary value of the deal |
| Stage | select | Yes | Current pipeline stage |
| Win Probability | integer (0–100) | No | Auto-set from stage; overrideable |
| Contact | select | No | Linked CRM contact |
| Assigned To | select | No | Sales user responsible |
| Expected Closing Date | date | No | Target close date |

---

## Pipeline Stages

| Stage | Default Probability | Colour |
|-------|--------------------:|--------|
| `new_deal` | 10 % | Blue |
| `proposal_sent` | 30 % | Yellow |
| `negotiation` | 60 % | Orange |
| `won` | 100 % | Green |
| `lost` | 0 % | Red |

When you change a deal's stage, the win probability updates automatically to the stage default. You can then override it with the slider.

---

## Kanban Board

**Route:** `GET /pipeline` (defaults to board view)

The board shows one column per stage. Each card displays:
- Deal title
- Monetary value
- Win probability %
- Linked contact name
- Assigned user avatar
- Expected closing date (red if overdue)
- **Overdue** badge if the closing date has passed and the deal is not won/lost

**Drag and drop** — cards can be dragged between columns. On drop, the stage is updated via `PATCH /deals/{id}/stage` and the activity feed is logged.

---

## List View

**Route:** `GET /pipeline?view=list` or `GET /deals`

A sortable table with columns: Title, Value, Stage, Win %, Contact, Assigned To, Closing Date, Actions.

Row highlighting:
- **Amber** — closing date within the next 7 days (not yet overdue)
- **Red** — closing date has passed and deal is still open

---

## Win Probability

Each deal has a `probability` field (0–100 %). It is:

- **Auto-set** when the stage changes (using the stage defaults table above).
- **Manually adjustable** via the probability slider in the create/edit modal.
- **Used in reporting** — the Report module calculates weighted pipeline value:

```
Weighted Value = SUM(deal.value × deal.probability / 100)
```

---

## Close Date Alerts

| Alert | Trigger | Visual |
|-------|---------|--------|
| Upcoming | Closing date within 7 days, deal still open | Amber row / amber card border |
| Overdue | Closing date in the past, deal not won/lost | Red row / red card border + "Overdue" badge |

The Dashboard shows a **Closing This Week** card with a count of deals closing in the next 7 days.

---

## Deal Products (Line Items)

Each deal can have multiple line-item products attached.

**Route:** `POST /deals/{id}/products`

| Field | Type | Required |
|-------|------|----------|
| Name | text | Yes |
| Quantity | integer | Yes (min 1) |
| Unit Price | decimal | Yes |

- The deal's `value` is automatically recalculated as the sum of all line items after every add or delete.
- The running total is shown at the bottom of the products panel on the deal detail page.

---

## Tags

Deals can be tagged using the same tag system as contacts. Tags are managed in the create/edit modal and can be used to filter the pipeline.

---

## Trash / Restore

Deleted deals appear in **Trash → Deals** tab. Restore returns the deal to the active pipeline.

---

## Controller Reference

**File:** `Modules/Deal/app/Http/Controllers/DealController.php`

| Method | Route | Description |
|--------|-------|-------------|
| `index` | `GET /deals` | List view with filters |
| `board` | `GET /pipeline` | Kanban board grouped by stage |
| `store` | `POST /deals` | Create deal |
| `update` | `PUT /deals/{id}` | Update deal + assignment notification |
| `updateStage` | `PATCH /deals/{id}/stage` | Move stage (drag-and-drop endpoint) |
| `destroy` | `DELETE /deals/{id}` | Soft-delete |
| `addProduct` | `POST /deals/{id}/products` | Add line item, recalc value |
| `deleteProduct` | `DELETE /deals/{id}/products/{product}` | Remove line item, recalc value |
