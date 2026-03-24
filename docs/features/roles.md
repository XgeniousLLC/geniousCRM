# Roles & Permissions

Mini CRM uses role-based access control (RBAC) via [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission). Every user has one role, and each role has a set of permissions.

## Built-in Roles

| Role | Description |
|------|-------------|
| **Admin** | Full access to everything including user management, roles, settings, and trash |
| **Manager** | Full CRM access and reports, but no user/role/settings management |
| **Sales User** | Create and edit own CRM records; no delete, no reports, no admin |

## Permissions by Role

| Permission | Admin | Manager | Sales User |
|-----------|:-----:|:-------:|:----------:|
| View contacts | ✅ | ✅ | ✅ |
| Create contacts | ✅ | ✅ | ✅ |
| Edit contacts | ✅ | ✅ | ✅ |
| Delete contacts | ✅ | ✅ | — |
| View leads | ✅ | ✅ | ✅ |
| Create leads | ✅ | ✅ | ✅ |
| Edit leads | ✅ | ✅ | ✅ |
| Delete leads | ✅ | ✅ | — |
| Convert leads | ✅ | ✅ | ✅ |
| View deals | ✅ | ✅ | ✅ |
| Create deals | ✅ | ✅ | ✅ |
| Edit deals | ✅ | ✅ | ✅ |
| Delete deals | ✅ | ✅ | — |
| View tasks | ✅ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ |
| Edit tasks | ✅ | ✅ | ✅ |
| Delete tasks | ✅ | ✅ | — |
| View reports | ✅ | ✅ | — |
| Manage users | ✅ | — | — |
| Manage roles | ✅ | — | — |
| Manage settings | ✅ | — | — |

## Managing Roles (Admin Only)

Go to **Roles** in the sidebar (Admin only).

### View Roles

The Roles list shows each role name and the number of permissions assigned.

### Create a Custom Role

Click **New Role**:
1. Enter a role name (e.g. `support_agent`)
2. Check the permissions you want to assign
3. Click **Save**

### Edit a Role

Click **Edit** on any role. Adjust the permission checkboxes and save.

::: warning
Changing a role's permissions affects all users who have that role immediately.
:::

### Delete a Role

Click **Delete**. You cannot delete a role that is currently assigned to any user — reassign or remove those users first.

## Assigning a Role to a User

1. Go to **Users** in the sidebar
2. Click **Edit** on any user
3. Select their role from the **Role** dropdown
4. Click **Save**

Each user has exactly one role.
