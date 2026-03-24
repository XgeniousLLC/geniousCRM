# Reports

The Reports module gives you charts and metrics to understand your pipeline performance.

## Accessing Reports

Go to **Reports** in the sidebar. This page is visible to **Admin** and **Manager** roles.

## Available Reports

### 1. Deals by Stage (Bar Chart)

A bar chart showing how many deals (and their total value) are in each pipeline stage:

- New Deal
- Proposal Sent
- Negotiation
- Won
- Lost

Use this to spot bottlenecks — for example, too many deals stuck in "Proposal Sent".

### 2. Lead Conversion Rate

Shows:
- Total leads created in the selected period
- How many were converted to contacts
- Conversion rate as a percentage

### 3. Sales Pipeline Value

A table grouped by stage showing:

| Stage | Deal Count | Total Value | Weighted Value |
|-------|-----------|-------------|----------------|
| New Deal | 3 | $12,000 | $1,200 (10%) |
| Negotiation | 2 | $30,000 | $18,000 (60%) |
| Won | 5 | $85,000 | $85,000 (100%) |

**Weighted Value** = `value × probability / 100`. Useful for forecasting realistic revenue.

### 4. Leads by Source

A bar chart showing how many leads came from each source:
Website, Referral, LinkedIn, Cold Outreach, Event, Advertisement, Other.

Use this to identify your best-performing acquisition channels.

## Date Range Filter

All reports respect the **date range** filter at the top of the page. Select a preset (This Month, Last Month, This Quarter, This Year) or enter a custom range.

## Exporting to CSV

On the **Contacts** and **Leads** list pages, click **Export CSV** to download all records matching the current filter as a CSV file.

The Reports page itself does not export charts — use the CSV export on the list pages for raw data.
