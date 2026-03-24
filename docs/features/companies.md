# Companies

Companies represent the organisations your contacts work for. Linking contacts and deals to a company gives you a 360° view of every account.

## The Companies List

Go to **Companies** in the sidebar. The table shows name, industry, website, phone, and linked contact count.

Use the **search box** to filter by company name.

## Creating a Company

Click **New Company**:

| Field | Required | Notes |
|-------|----------|-------|
| Name | Yes | Organisation name |
| Industry | No | Technology, Finance, Healthcare, etc. |
| Website | No | Full URL |
| Phone | No | Main office number |
| Address | No | Full postal address |

## Company Detail Page

Click a company name to open its detail page. You'll see:

### Linked Contacts

All contacts where `company_id` = this company. Click any contact to open their detail page.

To link an existing contact: open the contact, click Edit, and select the company from the **Company** dropdown.

### Linked Deals

All deals linked to contacts who belong to this company.

### Activity Feed

Every action taken on linked contacts and deals appears in the activity feed on the company page.

### Tasks

Tasks linked to contacts belonging to this company are listed here.

## Linking a Contact to a Company

When creating or editing a contact:

1. In the **Company** field, start typing the company name
2. Select from the dropdown of existing companies
3. Or type a new name and it will be saved as a free-text company (not linked)

To link to a Company record (for the detail page): use the **Link to Company** dropdown in the contact form.

## Deleting a Company

Deleting a company does **not** delete its contacts. The contacts remain but their `company_id` link is cleared.
