# First Login

A walkthrough of the admin experience from the moment you first sign in.

## Logging In

Open your Mini CRM URL. You'll see the login page.

Use the default admin credentials created by the seeder:

| Field | Value |
|-------|-------|
| Email | `admin@minicrm.test` |
| Password | `password` |

::: danger Change this immediately
The default password is public. Change it from [Profile → Change Password](/features/profile) right after your first login.
:::

## The Onboarding Wizard

On a fresh install (no contacts, leads, or deals yet), Mini CRM shows a **3-step onboarding wizard**:

1. **Company name** — set your company name
2. **Invite a team member** — optionally add the first user
3. **Import contacts** — optionally upload a CSV

You can skip any step or dismiss the wizard entirely. It won't show again once you dismiss it.

## The Dashboard

After login you land on the **Dashboard** — a summary of your CRM health.

### Stat Cards

| Card | What it shows |
|------|--------------|
| Total Contacts | Number of contacts in the CRM |
| Total Leads | All active leads (excludes converted and lost) |
| Open Deals | Deals that are not won or lost |
| Open Tasks | Tasks with status `pending` or `in_progress` |
| Follow-ups Due | Leads where `follow_up_date` is today or past |
| Closing This Week | Deals whose `expected_closing_date` falls within 7 days |

Clicking any card navigates to the relevant list filtered appropriately.

## The Sidebar

The left sidebar shows navigation links grouped by section. The links visible to you depend on your role:

| Section | Links |
|---------|-------|
| CRM | Dashboard, Contacts, Leads, Deals, Companies |
| Work | Tasks, Activity Feed |
| Insights | Reports |
| Admin | Users, Roles, Settings *(admin only)* |
| Trash | Contacts Trash, Leads Trash, Deals Trash *(admin only)* |

On mobile the sidebar collapses into a drawer opened with the menu button.

## The Top Header

| Element | Action |
|---------|--------|
| Logo | Navigate to Dashboard |
| Search bar | Global search across contacts, leads, and deals |
| Bell icon | Open notification dropdown |
| Sun/Moon icon | Toggle dark mode |
| User avatar | Open profile menu (Profile, Change Password, Logout) |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus the global search bar |
| `N` | Open quick-create dropdown |
| `Escape` | Close any open modal or drawer |
| `?` | Open keyboard shortcuts help |

## Recommended First Steps

1. **Change your password** — Profile → Change Password
2. **Update General Settings** — Settings → General → set your app name, logo, favicon
3. **Create team members** — Users → New User (assign Manager or Sales User role)
4. **Import contacts** — Contacts → Import CSV
5. **Add your first lead** — Leads → New Lead
6. **Set up a deal** — Deals → New Deal → assign to a contact
