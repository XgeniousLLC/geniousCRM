# User Management

Admins can create, edit, deactivate, and delete user accounts. Each user is assigned one role that controls what they can access.

## Accessing User Management

Go to **Users** in the sidebar. This page is visible to **Admin** role only.

## The Users Table

| Column | Description |
|--------|-------------|
| Name | User's display name |
| Email | Login email |
| Role | Assigned role badge |
| Status | Active (green) or Inactive (grey) |
| Actions | Edit, Deactivate/Activate, Delete |

## Creating a User

Click **New User**:

| Field | Required | Notes |
|-------|----------|-------|
| Name | Yes | Display name |
| Email | Yes | Must be unique |
| Password | Yes | Minimum 8 characters |
| Role | Yes | `admin`, `manager`, or `sales_user` |
| Company | No | User's company name (cosmetic) |

Click **Save**. The user can now log in immediately.

::: tip
Send the user their credentials manually — Mini CRM does not send a welcome email by default.
:::

## Editing a User

Click **Edit**. You can update name, email, role, and company. You can also set a new password for the user from here.

## Deactivating a User

Click **Deactivate** to disable a user's account without deleting it. A deactivated user:
- Cannot log in
- Still appears in assignment dropdowns (for historical records)
- Can be reactivated by clicking **Activate**

## Deleting a User

Click **Delete** and confirm. This permanently removes the user account.

::: warning
Deleting a user does not delete their records. Contacts, leads, and deals they created or are assigned to will remain in the CRM.
:::

## Roles

See [Roles & Permissions](/features/roles) for a full breakdown of what each role can do.
