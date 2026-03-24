# Deals & Pipeline

Deals are sales opportunities. Each deal moves through pipeline stages from first contact to closed — won or lost.

## Pipeline Stages

| Stage | Default Probability |
|-------|-------------------|
| **New Deal** | 10% |
| **Proposal Sent** | 30% |
| **Negotiation** | 60% |
| **Won** | 100% |
| **Lost** | 0% |

## Views: List vs Kanban

Toggle between two views using the buttons in the page header.

### List View

A sortable table showing title, contact, value, stage badge, close date, and assigned user. Rows are highlighted:

- 🟡 **Amber** — close date is within 7 days
- 🔴 **Red** — close date has passed and the deal is not Won/Lost

### Kanban Board

Columns represent each stage. Drag a deal card from one column to another to update its stage.

Each card shows:
- Deal title and value
- Linked contact name
- Win probability chip
- **Overdue** badge if the close date has passed

## Creating a Deal

Click **New Deal**:

| Field | Required | Notes |
|-------|----------|-------|
| Title | Yes | Short description of the opportunity |
| Value | No | Total deal value in your currency |
| Stage | Yes | Defaults to New Deal |
| Contact | No | Link to a CRM contact |
| Assigned To | No | Sales user who owns this deal |
| Expected Close Date | No | Date picker |
| Win Probability | No | 0–100% slider (auto-filled by stage) |

## Editing a Deal

Click the deal title or the edit icon. All fields can be updated including the stage.

## Moving a Deal Stage

**Via Kanban:** Drag the card to the target column.

**Via List/Edit:** Open the deal and change the Stage field.

Both methods log a `stage_changed` activity automatically.

## Win Probability

The probability slider (0–100%) is auto-populated based on the stage but can be overridden. This powers the **weighted pipeline value** in [Reports](/features/reports):

```
Weighted Value = SUM(deal.value × deal.probability / 100)
```

## Deal Products (Line Items)

Each deal can have multiple line items. On the deal detail page, scroll to the **Products** section:

| Field | Description |
|-------|-------------|
| Name | Product or service name |
| Quantity | Number of units |
| Unit Price | Price per unit |

The deal value is automatically calculated from line items (or you can override it manually).

## Deal Notes

The deal detail page has a Notes section. Add timestamped notes visible to your whole team.

## Close Date Alerts

- **Dashboard** — "Closing This Week" card shows deals due within 7 days
- **List** — rows highlighted amber (≤7 days) or red (overdue)
- **Kanban** — "Overdue" badge on cards past the close date

## Deleting a Deal

Deleted deals go to [Deals Trash](/features/trash).
