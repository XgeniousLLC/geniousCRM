# Mini CRM — Task Checklist

**Developed by:** [Xgenious](https://xgenious.com)
**License:** MIT — Free & Open Source for everyone
**Stack:** Laravel 11 + Inertia.js + React + Tailwind CSS
**Architecture:** Modular — `nwidart/laravel-modules`
**Database:** MySQL
**Auth API:** Laravel Sanctum
**Project Type:** Open Source Mini CRM

> This project is free and open source, developed and maintained by Xgenious.
> Anyone can use, modify, and distribute it under the MIT license.

> Mark `[x]` when a phase is fully complete. Work phases sequentially.

---

## Code Standards (Enforced Throughout All Phases)

These rules apply to every file created in this project:

### Module Structure
Every feature lives inside its own Laravel Module (`Modules/<Name>/`). No business logic goes in `app/` except core bootstrapping. Module directory layout:

```
Modules/
  Auth/          ← login, register, password reset, 2FA
  Core/          ← settings, dashboard, profile, onboarding
  User/          ← user management, roles
  Contact/       ← contacts, tags, notes, import, trash
  Lead/          ← leads, notes, import, follow-up, trash
  Deal/          ← pipeline, Kanban, products, trash
  Activity/      ← auto-logged feed
  Task/          ← polymorphic tasks
  Report/        ← charts, CSV export
  Api/           ← REST API (Sanctum)
  Company/       ← organisations (Phase 16)
  Notification/  ← in-app notifications (Phase 12)
```

### Comment Convention — Controllers
Every controller file must have a top-of-file docblock:

```php
<?php

/**
 * ContactController
 *
 * Handles all HTTP actions for the Contact module.
 * Contacts represent real people or organizations tracked in the CRM.
 *
 * Module  : Contact
 * Package : Modules\Contact\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */
```

Each public method must have an inline docblock:

```php
/**
 * Display a paginated list of contacts.
 * Supports search by name/email and filter by tag.
 */
public function index(Request $request): Response { ... }
```

### Comment Convention — Module Service Providers
Every `ModuleServiceProvider` must explain what the module registers:

```php
/**
 * ContactServiceProvider
 *
 * Registers routes, migrations, views, and bindings
 * for the Contact module of Mini CRM.
 *
 * Module  : Contact
 * Author  : Xgenious (https://xgenious.com)
 */
```

### Comment Convention — Models
Each model file must document its table, relations, and fillable fields:

```php
/**
 * Contact Model
 *
 * Represents a person or organization stored in the CRM.
 *
 * Table     : contacts
 * Relations : tags (BelongsToMany), notes (MorphMany), tasks (MorphMany)
 * Module    : Contact
 */
```

### Comment Convention — React Components (Frontend)
Each page or reusable component file starts with a JSDoc block:

```js
/**
 * ContactList
 *
 * Displays a searchable, filterable table of CRM contacts.
 * Uses Inertia.js for server-driven pagination.
 *
 * Module : Contact
 * Author : Xgenious (https://xgenious.com)
 */
```

---

## Phase 1: Project Setup & Infrastructure ✅
- [x] Laravel 12 installation (`composer create-project laravel/laravel`)
- [x] MySQL database configuration in `.env` (DB_DATABASE=mini_crm)
- [x] Install `nwidart/laravel-modules` & publish config
- [x] Configure `modules_statuses.json` and autoload in `composer.json` (merge-plugin)
- [x] Inertia.js installation (`inertiajs/inertia-laravel`)
- [x] React adapter setup (`@inertiajs/react`)
- [x] Tailwind CSS v4 installation & configuration (design tokens, module sources)
- [x] `docker-compose.yml` with app, nginx, mysql, redis services
- [x] `.env.example` updated with all required keys
- [x] `APP_KEY` generated (`php artisan key:generate`)
- [x] Create `Core`, `Auth`, `User` modules (`php artisan module:make`)
- [x] Verify frontend builds (`npm run build` — 772 modules, no errors)

### 1a. Login Page (Module: Auth) ✅
- [x] Create `Auth` module (`php artisan module:make Auth`)
- [x] Add docblock to `AuthServiceProvider` explaining module purpose
- [x] Single login page (role-agnostic — same page for admin, manager, sales user)
- [x] `LoginController` with top-of-file docblock + method docblocks
- [x] Email + password form with validation
- [x] Redirect to role-appropriate dashboard after login
- [x] "Remember me" checkbox
- [x] Clean, minimal design (shadcn-inspired card layout)
- [x] JSDoc block on `Login.jsx` page component

### 1b. Admin Dashboard (Module: Core) ✅
- [x] Minimal shadcn-inspired layout: sidebar nav + top header + content area
- [x] Sidebar: collapsible, with nav links per role (`Sidebar.jsx`)
- [x] Top header: app logo, user avatar, logout button (`TopHeader.jsx`)
- [x] Dashboard home: summary stat cards (`Dashboard.jsx`)
- [x] Responsive layout (mobile sidebar drawer in `AppLayout.jsx`)
- [x] `DashboardController` with docblock
- [x] JSDoc block on `Dashboard.jsx`, `Sidebar.jsx`, `TopHeader.jsx`, `AppLayout.jsx`

### 1c. Admin User Manage Page (Module: User) ✅
- [x] Create `User` module (`php artisan module:make User`)
- [x] Add docblock to `UserServiceProvider`
- [x] Users list table: name, email, role, status, actions
- [x] `UserController` with top-of-file docblock + per-method docblocks
- [x] Create user modal (name, email, password, role) — inline in `UserList.jsx`
- [x] Edit user (name, email, role) — inline modal
- [x] Deactivate / delete user with confirmation
- [x] Search & filter by role
- [x] JSDoc block on `UserList.jsx`

### 1d. Profile & Password Change (Module: Core) ✅
- [x] Profile page for current logged-in user (`Profile.jsx`)
- [x] `ProfileController` with docblock (explains: manages own user data only)
- [x] Edit own name, email, company fields
- [x] Separate "Change Password" form (current password + new + confirm)
- [x] Success / error flash messages on save
- [x] JSDoc block on `Profile.jsx`

### 1e. Role Management — Spatie Permission (Module: User) ✅
- [x] Install `spatie/laravel-permission` package
- [x] Publish & run Spatie migrations
- [x] Roles seeded: `admin`, `manager`, `sales_user`
- [x] Permissions seeded per module (22 permissions across all CRM modules)
- [x] `RoleController` with docblock (explains: manages Spatie roles & permissions)
- [x] Roles list page: name, permissions count, actions (`RoleList.jsx`)
- [x] Create / edit role with permission checkboxes (`RoleForm.jsx`)
- [x] Delete role (guard: cannot delete roles in use)
- [x] Assign role to user from User Manage page
- [x] JSDoc block on `RoleList.jsx`, `RoleForm.jsx`

### 1f. General Settings (Module: Core) ✅
- [x] `settings` table (key/value store) with migration & seeder
- [x] `SettingService` class with docblock (`app/Services/SettingService.php`)
- [x] `SettingController` with docblock + per-method docblocks
- [x] General Settings page: application title, meta description, meta keywords
- [x] Upload fields: logo, favicon (stored in `storage/app/public`)
- [x] Settings shared globally via `AppServiceProvider` → Inertia `share()`
- [x] `<head>` meta tags & favicon rendered from settings in root layout (`app.blade.php`)
- [x] JSDoc block on `GeneralSettings.jsx`

---

## Phase 2: Authentication & User Management (Module: Auth + User) ✅
- [x] User migration: `name`, `email`, `password`, `company`, `is_active`
- [x] Roles managed via Spatie (no raw `role` enum column)
- [x] User model docblock (table, relations, fillable)
- [x] Registration controller + Inertia page (with docblock)
- [x] Logout action (with inline docblock)
- [x] Password reset — email request + reset form (with docblocks)
- [x] Role-based middleware: `EnsureAdmin`, `EnsureManager` (each with docblock)
- [x] Route groups protected by role middleware
- [x] Auth seeder (default admin user)

---

## Phase 3: Contact Management (Module: Contact) ✅
- [x] Create `Contact` module (`php artisan module:make Contact`)
- [x] `ContactServiceProvider` docblock
- [x] Contacts migration: `first_name`, `last_name`, `email`, `phone`, `company`, `created_by`
- [x] Tags migration & `contact_tag` pivot table
- [x] `contact_notes` migration (`contact_id`, `user_id`, `body`)
- [x] `Contact` model docblock (table, relations: tags, notes, createdBy)
- [x] `Tag` model docblock
- [x] `ContactNote` model docblock
- [x] `ContactController` top-of-file docblock + per-method docblocks
- [x] Contacts list page with search (name, email, company)
- [x] Filter by tag
- [x] Create / edit contact inline modal
- [x] Delete contact with confirmation
- [x] Notes side-drawer per contact (add / delete)
- [x] JSDoc on `ContactList.jsx`

---

## Phase 4: Lead Management (Module: Lead) ✅
- [x] Create `Lead` module (`php artisan module:make Lead`)
- [x] `LeadServiceProvider` docblock
- [x] Leads migration: `name`, `email`, `phone`, `source`, `assigned_user_id`, `status`, `notes`, `created_by`
- [x] `lead_notes` migration (`lead_id`, `user_id`, `body`)
- [x] Status enum: `new`, `contacted`, `qualified`, `lost`, `converted`
- [x] `Lead` model docblock (table, relations, status colors)
- [x] `LeadNote` model docblock
- [x] `LeadController` top-of-file docblock + per-method docblocks
- [x] Leads list page with status filter & search
- [x] Assign lead to sales user (dropdown in modal)
- [x] Change lead status (via edit modal)
- [x] "Convert Lead to Contact" action — splits name, creates Contact, sets lead → `converted`
- [x] Notes side-drawer per lead (add / delete)
- [x] JSDoc on `LeadList.jsx`

---

## Phase 5: Deal / Pipeline Management (Module: Deal) ✅
- [x] Create `Deal` module (`php artisan module:make Deal`)
- [x] `DealServiceProvider` docblock
- [x] Deals migration: `title`, `value`, `contact_id`, `stage`, `expected_closing_date`, `assigned_user_id`, `created_by`
- [x] Stage enum: `new_deal`, `proposal_sent`, `negotiation`, `won`, `lost`
- [x] `Deal` model docblock (table, relations, stage meta array)
- [x] `DealController` top-of-file docblock + per-method docblocks
- [x] Pipeline Kanban board (HTML5 drag-and-drop, PATCH /deals/{id}/stage)
- [x] Pipeline list view (table with stage badges)
- [x] Board/List toggle button in page header
- [x] Create / edit deal modal (title, value, stage, contact, assignee, close date)
- [x] Delete deal with confirmation
- [x] JSDoc on `Pipeline.jsx`

---

## Phase 6: Activity Tracking (Module: Activity) ✅
- [x] Create `Activity` module (`php artisan module:make Activity`)
- [x] `ActivityServiceProvider` docblock
- [x] Activities migration: `user_id`, `action`, `entity_type`, `entity_id`, `created_at`
- [x] `Activity` model docblock (polymorphic entity relation)
- [x] `ActivityService` docblock (explains: central auto-logging service for all modules)
- [x] Auto-log on: lead created
- [x] Auto-log on: deal stage updated
- [x] Auto-log on: contact modified
- [x] Auto-log on: note added
- [x] Activity feed component per entity page
- [x] Global activity feed page (admin/manager)
- [x] JSDoc on `ActivityFeed.jsx`

---

## Phase 7: Tasks & Notes (Module: Task) ✅
- [x] Create `Task` module (`php artisan module:make Task`)
- [x] `TaskServiceProvider` docblock
- [x] Tasks migration: `title`, `description`, `due_date`, `assigned_user_id`, `status`, `taskable_type`, `taskable_id`
- [x] Task status enum: `pending`, `in_progress`, `done`
- [x] `Task` model docblock (polymorphic taskable)
- [x] `TaskController` top-of-file docblock + per-method docblocks
- [x] Task panels embedded on Contact, Lead, Deal pages
- [x] My Tasks view (tasks assigned to current user)
- [x] JSDoc on `TaskPanel.jsx`, `NotePanel.jsx`, `MyTasks.jsx`

---

## Phase 8: Reporting & Dashboard (Module: Report) ✅
- [x] Create `Report` module (`php artisan module:make Report`)
- [x] `ReportServiceProvider` docblock
- [x] Admin dashboard: total contacts, leads, deals, open tasks (summary widgets)
- [x] `ReportController` top-of-file docblock + per-method docblocks
- [x] Deals by stage bar chart (won vs lost vs in-progress)
- [x] Lead conversion rate report (leads → contacts)
- [x] Sales pipeline report (deals grouped by stage with total value)
- [x] Date-range filter on reports
- [x] Export to CSV (contacts list, leads list)
- [x] JSDoc on `ReportDashboard.jsx`, chart sub-components

---

## Phase 9: API Layer (Module: Api) ✅
- [x] Create `Api` module (`php artisan module:make Api`)
- [x] `ApiServiceProvider` docblock (explains: REST API layer, Sanctum-protected)
- [x] Laravel Sanctum installation & configuration
- [x] `POST /api/v1/login` — return token (method docblock)
- [x] `POST /api/v1/register` — create user, return token (method docblock)
- [x] `POST /api/v1/logout` — revoke token (method docblock)
- [x] Contacts API: `GET /api/v1/contacts`, `POST`, `PUT /api/v1/contacts/{id}`, `DELETE`
- [x] Leads API: `GET /api/v1/leads`, `POST`, `PUT /api/v1/leads/{id}`, `DELETE`
- [x] Deals API: `GET /api/v1/deals`, `POST`, `PUT /api/v1/deals/{id}`, `DELETE`
- [x] Tasks API: `GET /api/v1/tasks`, `POST`, `PUT /api/v1/tasks/{id}`, `DELETE`
- [x] JsonResource transformer per model (each with class-level docblock)
- [x] API routes protected by `auth:sanctum` middleware
- [x] API rate limiting configured (60/min public, 120/min authenticated)
- [x] API controllers each have top-of-file docblock + per-method docblocks

---

## Phase 10: Testing & Polish ✅

- [x] Feature test: Registration & Login
- [x] Feature test: Contact CRUD
- [x] Feature test: Lead CRUD + convert to contact
- [x] Feature test: Deal CRUD + stage change
- [x] Feature test: API auth endpoints
- [x] Review all controllers — confirm every file has top-of-file docblock
- [x] Review all models — confirm every file has model docblock
- [x] Review all React pages — confirm every file has JSDoc block
- [x] Mobile-responsive UI review (all major pages)
- [x] `README.md` — project intro with Xgenious credit & links
- [x] `README.md` — module structure overview
- [x] `README.md` — self-hosting instructions
- [x] `README.md` — Docker quick-start section
- [x] `README.md` — contributing guide (open source community)
- [x] `LICENSE` file (MIT) — copyright Xgenious
- [x] `php artisan test` passes (all green — 32 tests, 68 assertions)

---

---
# Roadmap — Customer-Ready Features
> These phases extend the base CRM for real-world customer use.
> Implement in order. Each phase is independent but builds on prior ones.
---

## Phase 11: Critical Customer Workflow ✅

### 11a. CSV Import (Contacts & Leads) ✅
- [x] Create `ContactImportController` in `Modules/Contact` and `LeadImportController` in `Modules/Lead`
- [x] `ImportController` top-of-file docblock + per-method docblocks
- [x] Upload CSV form (file input)
- [x] Column mapping step (map CSV header → model field)
- [x] Preview table (first 5 rows) before final import
- [x] Validate rows — skip/flag invalid emails, missing required fields
- [x] Insert in chunks of 100 to avoid memory issues
- [x] Flash summary: "X imported, Y skipped"
- [x] `ContactImport.jsx` and `LeadImport.jsx` pages with JSDoc blocks
- [x] Import CSV button added to ContactList and LeadList pages
- [ ] Feature test: CSV upload creates expected records

### 11b. Follow-up Dates on Leads ✅
- [x] Migration: add `follow_up_date` (nullable date) to `leads` table
- [x] `LeadController` — include `follow_up_date` in validate + update
- [x] Lead edit modal: date picker for follow-up date
- [x] Lead list: show overdue follow-up badge (red/amber) when date has passed
- [x] Dashboard widget: "Follow-ups Due" stat card + quick link
- [x] `DashboardController` — add `follow_up_due` count to props
- [ ] Feature test: follow-up date is saved and appears in dashboard count

### 11c. Soft Deletes ✅
- [x] Add `SoftDeletes` trait to `Contact`, `Lead`, `Deal`, `Task` models
- [x] Migration: add `deleted_at` column to each table
- [x] `ContactTrashController`, `LeadTrashController`, `DealTrashController` with docblocks
- [x] Trash list page per module (`onlyTrashed()` query)
- [x] Restore action (`PATCH /contacts/{id}/restore`, leads, deals)
- [x] Force-delete action with confirmation (`DELETE /contacts/{id}/force`, leads, deals)
- [x] Sidebar links to Trash per module (admin only)
- [x] JSDoc on `ContactTrash.jsx`, `LeadTrash.jsx`, `DealTrash.jsx`
- [x] Route ordering fixed — static paths before wildcard `{id}` routes
- [ ] Feature test: soft delete, restore, force delete

---

## Phase 12: Notifications ✅

### 12a. In-App Notification System ✅
- [x] Migration: `notifications` table (standard Laravel schema in Notification module)
- [x] `NotificationController` with top-of-file docblock
- [x] Trigger: notify assignee when a lead is assigned (LeadController store + update)
- [x] Trigger: notify assignee when a task is assigned (TaskController store + update)
- [x] Trigger: notify assignee when a deal is assigned (DealController store + update)
- [x] `GET /notifications` — return recent 20 + unread count as JSON
- [x] `PATCH /notifications/{id}/read` — mark single as read
- [x] `PATCH /notifications/read-all` — mark all as read
- [x] Bell icon in `TopHeader.jsx` with unread count badge
- [x] Dropdown panel showing recent 10 notifications (click to mark read + navigate)
- [x] JSDoc on `TopHeader.jsx` and `NotificationBell` component
- [x] `notifications` prop shared via Inertia from `AppServiceProvider`

### 12b. Email Notifications (Queue-backed) ✅
- [x] `MAIL_*` keys already in `.env.example`
- [x] `QUEUE_CONNECTION=database` already in `.env.example`; jobs table migration in Notification module
- [x] `LeadAssigned` notification — database + mail channels, dispatched on assignment change
- [x] `TaskAssigned` notification — database + mail channels, dispatched on assignment change
- [x] `TaskDueReminderMail` — daily digest sent by `SendTaskDueReminders` command
- [x] `DealAssigned` notification — database + mail channels, dispatched on assignment change
- [x] `DealStageMail` — standalone Mailable for stage change notifications
- [x] Each notification/mail class has class-level docblock
- [x] Laravel scheduler in `routes/console.php` + `NotificationServiceProvider::registerCommandSchedules()`
- [x] `supervisor.conf` in repo root (queue worker + scheduler processes)
- [ ] Feature test: lead assignment dispatches notification

---

## Phase 13: Security Hardening ✅

### 13a. Two-Factor Authentication (2FA) ✅
- [x] Install `pragmarx/google2fa-laravel`
- [x] Migration: add `two_factor_secret`, `two_factor_enabled`, `two_factor_recovery_codes` to `users`
- [x] `TwoFactorController` with top-of-file docblock + per-method docblocks
- [x] Profile page: enable/disable 2FA section with QR code
- [x] Login flow: after password OK, redirect to 2FA challenge page if enabled
- [x] `TwoFactor.jsx` challenge page with JSDoc block
- [x] Recovery codes (generate, display once, hash-store, burn-on-use)
- [ ] Feature test: 2FA enable, challenge pass, challenge fail

### 13b. Rate Limiting on Web Routes ✅
- [x] Apply `throttle:5,1` to `POST /login` (5 attempts per minute per IP)
- [x] Apply `throttle:10,1` to `POST /register`
- [x] Apply `throttle:3,1` to `POST /forgot-password`
- [ ] Feature test: 6th login attempt returns 429

### 13c. Active Session Management ✅
- [x] `SESSION_DRIVER=database` already in `.env.example`; sessions table exists
- [x] `SessionController` with docblock
- [x] Profile page: "Active Sessions" section — list IP, device, last active
- [x] "Revoke" button on each session except current
- [x] "Log out all other devices" button
- [x] JSDoc on sessions section component

---

## Phase 14: Data Quality

### 14a. Duplicate Detection
- [ ] `DuplicateService` with docblock — checks email + phone against existing records
- [ ] `ContactController::store()` — call `DuplicateService` before create
- [ ] `LeadController::store()` — call `DuplicateService` before create
- [ ] Return `duplicates` array in JSON when matches found
- [ ] Modal in `ContactList.jsx` / `LeadList.jsx`: "Possible duplicates found — continue anyway?"
- [ ] Feature test: duplicate email triggers warning response

### 14b. Lead Source Enum
- [ ] Migration: change `leads.source` from free text to enum
- [ ] Enum values: `Website`, `Referral`, `LinkedIn`, `Cold Outreach`, `Event`, `Advertisement`, `Other`
- [ ] `Lead` model: add `$sources` static array with labels
- [ ] Lead create/edit modal: replace text input with select dropdown
- [ ] Report module: add "Leads by Source" bar chart to `ReportDashboard.jsx`
- [ ] Feature test: lead created with valid source, invalid source rejected

### 14c. Tags on Leads and Deals
- [ ] Migration: `lead_tag` pivot table (`lead_id`, `tag_id`)
- [ ] Migration: `deal_tag` pivot table (`deal_id`, `tag_id`)
- [ ] `Lead` model: add `tags()` BelongsToMany relation
- [ ] `Deal` model: add `tags()` BelongsToMany relation
- [ ] `LeadController` — sync tags on store/update
- [ ] `DealController` — sync tags on store/update
- [ ] Lead/Deal create + edit modals: tag checkboxes (same pattern as Contact)
- [ ] Lead list: filter by tag
- [ ] Feature test: lead tagged, filter returns correct results

---

## Phase 15: Power User Features

### 15a. Global Search
- [ ] `SearchController` with top-of-file docblock
- [ ] `GET /search?q=...` — queries contacts (name, email), leads (name, email), deals (title) in parallel
- [ ] Returns grouped JSON: `{ contacts: [...], leads: [...], deals: [...] }`
- [ ] Search bar in `TopHeader.jsx` (keyboard shortcut `/` to focus)
- [ ] Dropdown results panel with entity-type badges and links
- [ ] Debounce 300ms on input, min 2 characters
- [ ] JSDoc on search bar component
- [ ] Feature test: search returns correct grouped results

### 15b. Bulk Operations on List Pages
- [ ] Contacts list: master checkbox + per-row checkboxes
- [ ] Bulk actions toolbar appears when ≥1 selected: Delete, Assign tag, Export selected
- [ ] `ContactController::bulkDestroy()` — validate array of IDs, soft-delete all
- [ ] `ContactController::bulkTag()` — attach a tag to all selected
- [ ] Same pattern for Leads list: bulk delete, bulk assign user, bulk status change
- [ ] JSDoc on bulk action toolbar component
- [ ] Feature test: bulk delete removes correct records

### 15c. Column Sorting on Tables
- [ ] Contacts list: sortable by name, company, created date
- [ ] Leads list: sortable by name, status, follow-up date, created date
- [ ] Deals list: sortable by title, value, stage, closing date
- [ ] Sort state passed via query string (`?sort=name&dir=asc`)
- [ ] `ContactController::index()`, `LeadController::index()`, `DealController::index()` — apply `orderBy` from query
- [ ] Column header buttons with `↑ ↓` indicators in JSX
- [ ] Feature test: sort parameter returns correctly ordered results

---

## Phase 16: Company / Organisation Entity (Module: Company) ✅
- [x] Create `Company` module (`php artisan module:make Company`)
- [x] `CompanyServiceProvider` docblock
- [x] Migration: `companies` table — `name`, `industry`, `website`, `phone`, `address`, `created_by`
- [x] `Company` model docblock (table, relations: contacts, deals)
- [x] `contact_id` on `contacts` → `company_id` (nullable FK to `companies`)
- [x] `CompanyController` top-of-file docblock + per-method docblocks
- [x] Companies list page with search (`CompanyList.jsx` with JSDoc)
- [x] Company detail page: linked contacts, linked deals, activity feed, tasks
- [x] Contact create/edit modal: company dropdown (link or create inline)
- [x] Sidebar nav link: Companies (all roles)
- [ ] Feature test: company CRUD, contact linked to company

---

## Phase 17: Deal Enhancements ✅

### 17a. Deal Products / Line Items ✅
- [x] Migration: `deal_products` table — `deal_id`, `name`, `quantity`, `unit_price`
- [x] `DealProduct` model docblock
- [x] `Deal` model: `dealProducts()` HasMany relation
- [x] Deal detail page: Products section — add/remove line items inline
- [x] `deal.value` auto-calculated from line items (or manual override)
- [x] `DealController` — store/update/delete products
- [ ] Feature test: line items sum equals deal value

### 17b. Deal Close Date Alerts ✅
- [x] Deals list: highlight row in amber if `expected_closing_date` is within 7 days
- [x] Deals list: highlight row in red if `expected_closing_date` has passed and stage is not `won`/`lost`
- [x] Kanban board: show "Overdue" badge on cards past close date
- [x] Dashboard widget: "Closing this week" deal count

### 17c. Deal Win Probability ✅
- [x] Migration: add `probability` (integer 0–100) to `deals` table
- [x] Default probability per stage: `new_deal=10`, `proposal_sent=30`, `negotiation=60`, `won=100`, `lost=0`
- [x] `Deal` model: `$stageProbabilities` static array
- [x] Deal create/edit modal: probability slider
- [x] Pipeline view: show probability % on each card
- [x] Report: weighted pipeline value (`SUM(value * probability / 100)`)

---

## Phase 18: Developer & Operations ✅

### 18a. GitHub Actions CI ✅
- [x] `.github/workflows/tests.yml` — runs `php artisan test` on every PR and push to `main`
- [x] Matrix: PHP 8.2 + PHP 8.3
- [x] Steps: checkout → setup PHP → composer install → copy `.env.example` → generate key → run tests
- [x] Badge in `README.md` linking to workflow status

### 18b. Docker Production Config ✅
- [x] `docker-compose.prod.yml` — separate from dev config
- [x] Production services: nginx (with SSL termination), php-fpm, mysql, redis, queue worker
- [x] `docker/supervisor.conf` — manages `php artisan queue:work` and scheduler
- [x] `docker/nginx/prod.conf` — HTTPS config with self-signed cert placeholder
- [x] Document production deploy steps in `README.md`

### 18c. API Changelog & Versioning Policy ✅
- [x] `CHANGELOG.md` — document all API changes per version
- [x] API versioning policy section in `README.md`
- [x] `Deprecated` response header pattern documented for future breaking changes

---

## Phase 19: UX Polish ✅

### 19a. Dark Mode ✅
- [x] Toggle button in `TopHeader.jsx` (sun/moon icon)
- [x] Store preference in `localStorage` and `<html class="dark">`
- [x] All Tailwind design tokens already use CSS variables — add `dark:` variants to each token in `app.css`
- [x] Persist preference across sessions

### 19b. Timezone Support ✅
- [x] Migration: add `timezone` (string, nullable) to `users` table
- [x] Profile page: timezone dropdown (list from `DateTimeZone::listIdentifiers()`)
- [x] `AppServiceProvider`: set `date.timezone` config per authenticated user on each request
- [x] All `diffForHumans()` and formatted dates respect user timezone

### 19c. Keyboard Shortcuts ✅
- [x] Global key handler in `AppLayout.jsx`
- [x] `/` — focus global search bar
- [x] `N` — open "New" quick-create dropdown (context-aware per current page)
- [x] `Escape` — close any open modal or drawer
- [x] `?` — open keyboard shortcuts help modal
- [x] JSDoc on keyboard shortcut hook

### 19d. Onboarding Flow (First-Time Setup) ✅
- [x] Detect fresh install: no contacts, no leads, no deals
- [x] `OnboardingController` with docblock
- [x] Multi-step wizard: Company name → Invite team member → Import contacts (optional) → Done
- [x] `Onboarding.jsx` page with JSDoc block
- [x] Dismiss onboarding permanently (store flag in settings table)
