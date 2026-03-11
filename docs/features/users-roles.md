---
title: Users & Roles
parent: Features
nav_order: 13
---

# Users & Roles
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Mini CRM uses **Spatie Laravel Permission** for role-based access control. Three built-in roles ship with the application. Admins can create additional custom roles with any combination of permissions.

**Module:** `User`
**Access:** Admin only

---

## Built-in Roles

| Role | Description |
|------|-------------|
| `admin` | Full access to all modules, settings, users, roles, reports, and trash |
| `manager` | Access to all CRM records, reports, and activities; cannot manage users or roles |
| `sales_user` | Access to contacts, leads, deals, and own tasks only |

---

## Permission List

Permissions are seeded on first install. Each maps to a specific CRM capability:

| Permission | Scope |
|------------|-------|
| `view contacts` | Read contact list and detail |
| `manage contacts` | Create, update, delete contacts |
| `view leads` | Read lead list and detail |
| `manage leads` | Create, update, delete leads |
| `view deals` | Read deal pipeline and detail |
| `manage deals` | Create, update, delete deals |
| `view tasks` | Read tasks |
| `manage tasks` | Create, update, delete tasks |
| `view reports` | Access the Reports module |
| `view activities` | Access the global Activity feed |
| `manage users` | Create, edit, deactivate users |
| `manage roles` | Create, edit, delete roles |
| `manage settings` | Access General Settings |
| `view companies` | Read company list and detail |
| `manage companies` | Create, update, delete companies |
| `import contacts` | Upload CSV to import contacts |
| `import leads` | Upload CSV to import leads |
| `view notifications` | Access notification API |
| `manage trash` | Access Trash page, restore, force-delete |
| `view api` | Use REST API endpoints |
| `manage api_tokens` | Generate and revoke Sanctum tokens |
| `view dashboard` | Access the main dashboard |

---

## Managing Users

**Route:** `GET /users`

The Users list shows all registered accounts with name, email, role, and active status.

### Creating a User

Click **+ New User**. Fill in:

| Field | Required | Notes |
|-------|----------|-------|
| Name | Yes | Display name |
| Email | Yes | Must be unique |
| Password | Yes | Min 8 characters |
| Role | Yes | Select from existing roles |

### Editing a User

Click the edit icon on any row to update name, email, or role via an inline modal.

### Deactivating a User

Toggle the **Active** switch on any user row. Deactivated users cannot log in but their data is preserved.

### Deleting a User

Click delete (trash icon). A confirmation modal appears. Deletion is permanent — all content created by that user remains (the `created_by` foreign key uses `nullOnDelete`).

---

## Managing Roles

**Route:** `GET /roles`

The Roles list shows all roles with their permission counts.

### Creating a Role

Click **+ New Role**. Enter a name and check the permissions to include.

### Editing a Role

Click the edit icon to change the role name or update its permission set.

### Deleting a Role

Roles that are currently assigned to one or more users **cannot** be deleted. Reassign those users first.

---

## Assigning a Role to a User

From the Users list, click the role badge or edit button on a user row to change their role via the edit modal.

---

## Role-Based UI Visibility

The sidebar navigation adapts to the logged-in user's role:

| Sidebar Item | admin | manager | sales_user |
|-------------|:-----:|:-------:|:----------:|
| Dashboard | ✓ | ✓ | ✓ |
| Contacts | ✓ | ✓ | ✓ |
| Leads | ✓ | ✓ | ✓ |
| Deals | ✓ | ✓ | ✓ |
| Tasks | ✓ | ✓ | ✓ |
| Companies | ✓ | ✓ | ✓ |
| Reports | ✓ | ✓ | — |
| Activities | ✓ | ✓ | — |
| Users | ✓ | — | — |
| Roles | ✓ | — | — |
| Settings | ✓ | — | — |
| Trash | ✓ | — | — |

---

## Controller Reference

**Files:**
- `Modules/User/app/Http/Controllers/UserController.php`
- `Modules/User/app/Http/Controllers/RoleController.php`

| Method | Route | Description |
|--------|-------|-------------|
| `index` | `GET /users` | Paginated user list |
| `store` | `POST /users` | Create user |
| `update` | `PUT /users/{id}` | Update user |
| `destroy` | `DELETE /users/{id}` | Delete user |
| `index` | `GET /roles` | Roles list |
| `store` | `POST /roles` | Create role with permissions |
| `update` | `PUT /roles/{id}` | Update role |
| `destroy` | `DELETE /roles/{id}` | Delete role (if unused) |
