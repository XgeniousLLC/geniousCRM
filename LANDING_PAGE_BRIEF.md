# Landing Page Design Brief — Mini CRM by Xgenious

> Hand this document to your designer / Stitch prompt.
> It covers every section, message hierarchy, feature list, and visual tone
> needed to produce a polished, conversion-ready landing page.

---

## 1. Product Summary

**Product name:** Mini CRM
**Tagline:** The open-source CRM that gets out of your way.
**By:** [Xgenious](https://xgenious.com) — a software company that builds developer-first tools
**License:** MIT — free forever, no hidden plans, no trial limits
**Live demo:** https://demo.xgenious.com/mini-crm *(placeholder — update when live)*
**GitHub repo:** https://github.com/XgeniousLLC/geniousCRM

### The one thing to communicate above everything else
> **Mini CRM is 100% free and open source.**
> Not "free tier". Not "free trial". Not "open core".
> The entire product — every feature on this page — is free, forever, for everyone.

This is the biggest differentiator. Every section should reinforce it.

---

## 2. Target Audience

Design and copy should speak to **three personas** simultaneously:

| Persona | Pain point | What they want |
|---|---|---|
| **Solo founder / freelancer** | Spreadsheets aren't cutting it; $50/mo SaaS feels wrong for 10 contacts | A real CRM with zero monthly cost |
| **Small sales team (2–15 people)** | They share one spreadsheet or an overpriced SaaS | Collaborative CRM they can self-host and own |
| **Developer / agency** | They build software for clients who need a CRM | An open-source base they can brand and customise |

---

## 3. Visual Tone & Style

- **Mood:** Clean, modern, trustworthy — like Linear or Vercel landing pages
- **Colour palette:** Dark hero section (near-black or deep navy), white content sections, accent colour: indigo / violet (#6366f1)
- **Typography:** Sans-serif (Inter or similar), large confident headings, generous whitespace
- **Imagery:** Product screenshots / mockups in browser frames or device frames (light + dark mode variants where possible)
- **Avoid:** Stock photos of people shaking hands, generic "business" imagery, gradients that feel dated
- **Dark mode screenshots are a bonus** — the product ships with dark mode built in, show it off

---

## 4. Page Sections (in order)

---

### Section 1 — Navigation Bar

**Left:** Mini CRM logo (small CRM icon + wordmark)
**Right links:**
- Features
- Modules
- Stack
- GitHub (with star count badge)

**Right CTAs:**
- `View Live Demo` (outlined button)
- `Get it Free on GitHub` (filled primary button)

**Sticky on scroll.** On mobile: hamburger menu.

---

### Section 2 — Hero

**Above the headline:** A small pill/badge that reads:
> ★ Open Source  •  MIT License  •  100% Free

**Headline (large, bold):**
> A full-featured CRM.
> Zero monthly fees. Forever.

**Sub-headline (smaller, muted):**
> Mini CRM is an open-source customer relationship manager built with Laravel + React.
> Manage contacts, leads, and deals — self-host it, own your data, and never pay a subscription again.

**CTA buttons (side by side):**
- `Get it Free on GitHub` — primary, filled, links to GitHub repo
- `Try the Live Demo` — secondary, outlined

**Below the CTAs:** Trust micro-copy:
> MIT licensed · Self-host in minutes · No credit card · No account required

**Hero visual:** Full-width browser mockup showing the Mini CRM dashboard — stat cards at top, sidebar on the left, deal pipeline or contact list in the main area. Show dark mode variant if possible.

---

### Section 3 — Social Proof / Stats Bar

A simple horizontal bar with 4–5 key stats separated by dividers:

| Stat | Value |
|---|---|
| License | MIT — 100% Free |
| Stack | Laravel + React |
| Modules | 12 Built-in |
| Database | MySQL |
| Auth | Sanctum + 2FA |

Keep this minimal — logos of the tech stack (Laravel, React, Tailwind, MySQL) would work well here too.

---

### Section 4 — "Everything you need" Feature Grid

**Section heading:**
> Everything a growing team needs.
> Nothing you have to pay for.

**Sub-heading:**
> Mini CRM ships with a complete suite of sales tools out of the box.

Display features in a **3-column card grid** (2-column on tablet, 1-column on mobile).
Each card has: icon + feature name + 1-sentence description.

#### Feature cards to include:

1. **Contact Management**
   Store, search, and tag every contact. Add notes and link contacts to companies.

2. **Lead Pipeline**
   Track leads from first touch to qualified opportunity. Assign follow-up dates and convert leads to contacts in one click.

3. **Deal Kanban Board**
   Drag-and-drop deals across pipeline stages. See your entire sales pipeline at a glance.

4. **Company / Organisation Profiles**
   Group contacts under companies. See all linked contacts, deals, and activity in one place.

5. **Task Management**
   Attach tasks to contacts, leads, or deals. Get daily reminders for due tasks.

6. **Activity Feed**
   Every action — note added, deal moved, lead converted — is automatically logged in a live activity stream.

7. **Reports & Analytics**
   Deals-by-stage charts, lead conversion rates, sales pipeline value, and CSV exports.

8. **In-App Notifications**
   Bell icon with unread badge. Get notified instantly when a lead or deal is assigned to you.

9. **Email Notifications**
   Queue-backed email alerts for lead assignment, task due reminders, and deal stage changes.

10. **Role-Based Access**
    Three built-in roles: Admin, Manager, and Sales User — each with fine-grained permissions via Spatie.

11. **CSV Import**
    Bulk-import contacts and leads from any spreadsheet. Preview before committing. Skips invalid rows.

12. **Dark Mode**
    Full dark mode built in. Preference saved per user and persists across sessions.

13. **Two-Factor Authentication (2FA)**
    TOTP-based 2FA with QR code setup, recovery codes, and per-user enable/disable from the profile page.

14. **REST API**
    Full Sanctum-authenticated REST API for contacts, leads, deals, and tasks — ready for integrations.

15. **Soft Deletes & Trash**
    Accidentally deleted something? Every module has a Trash view. Restore or permanently delete on demand.

---

### Section 5 — "Open Source, Not Open Core" Callout

This is a **full-width accent section** (dark background, white text) — the trust anchor of the page.

**Headline:**
> Open source. Not "open core".

**Body:**
> Some tools call themselves "open source" but lock the useful features behind a paid plan.
> Mini CRM is different. Every feature on this page is in the public MIT-licensed repository.
> No paid tier. No upgrade nag. No vendor lock-in.
> Self-host it on your own server, fork it, modify it, and make it yours.

**Three icons with captions below the text:**

| Icon | Caption |
|---|---|
| 🔓 | MIT Licensed |
| 🖥️ | Self-host anywhere |
| 🔧 | Fork & customise freely |

**CTA:**
> `View the source code on GitHub →`

---

### Section 6 — Screenshots / Product Tour

A **tabbed or scrollable screenshot gallery** showing the product in action.
Use browser-frame mockups. Suggested tabs / slides:

1. **Dashboard** — stat cards (contacts, leads, deals, open tasks, follow-ups due, closing this week)
2. **Contacts** — searchable table with tag badges and action buttons
3. **Lead Pipeline** — list view with status badges and overdue follow-up indicators
4. **Deal Kanban** — drag-and-drop board with stage columns, win probability chips, overdue badges
5. **Reports** — bar chart showing deals by stage + lead conversion rate widget
6. **Company Profile** — company detail page with linked contacts and activity feed
7. **Dark Mode** — any of the above in dark mode

**Caption under the gallery:**
> All screenshots are from the live demo. Every screen is included free.

---

### Section 7 — Tech Stack (For Developers)

**Section heading:**
> Built on a rock-solid modern stack.

**Sub-heading:**
> Mini CRM is architected for developers — modular, extensible, and easy to deploy.

Display as a **horizontal card row** or **2-column list**:

| Technology | Role |
|---|---|
| **Laravel 12** | PHP backend, routing, Eloquent ORM |
| **Inertia.js** | Server-driven SPA — no separate API needed for the frontend |
| **React 19** | Reactive component UI |
| **Tailwind CSS v4** | Utility-first styling with CSS variable design tokens |
| **MySQL** | Primary database |
| **Laravel Sanctum** | API token authentication |
| **Spatie Permission** | Role-based access control (RBAC) |
| **nwidart/laravel-modules** | Modular architecture — 12 independent feature modules |
| **Docker** | Dev and production Docker configs included |
| **GitHub Actions CI** | Automated test runs on every push |

**Below the table:**
> Fully modular — add a new feature by creating a new Laravel module without touching existing code.

---

### Section 8 — Self-Host in Minutes

**Section heading:**
> Deploy it in under 5 minutes.

Three steps, displayed as large numbered cards:

**Step 1 — Clone**
```
git clone https://github.com/XgeniousLLC/geniousCRM.git
```

**Step 2 — Configure**
```
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

**Step 3 — Run**
```
docker-compose up -d
# or: npm run build && php artisan serve
```

**Below steps:**
> That's it. Your CRM is live. No account signup. No activation email. No phone verification.

**CTA:** `Read the full docs on GitHub →`

---

### Section 9 — Who It's For

**Section heading:**
> Built for teams of every size.

Three persona cards side by side:

**Solo Founder**
> Stop tracking deals in a spreadsheet. Get a real CRM without a monthly bill.

**Small Sales Team**
> Give your team a shared pipeline, assigned leads, task reminders, and role-based access — all self-hosted.

**Developer / Agency**
> Fork it. Rebrand it. Add your own modules. The MIT license lets you build commercial products on top of Mini CRM.

---

### Section 10 — Final CTA Section

**Full-width section, dark background.**

**Headline:**
> Your CRM. Your data. Your server.
> No subscriptions. Ever.

**Sub-copy:**
> Mini CRM is free today, free tomorrow, and free forever.
> It's open source — which means the community, not a pricing team, decides what gets built next.

**Two buttons:**
- `Download Free on GitHub` — primary
- `Try the Live Demo` — secondary/outlined

**Below buttons:**
> MIT License · Open Source · Built by [Xgenious](https://xgenious.com)

---

### Section 11 — Footer

**Left:** Mini CRM logo + tagline "Free & open-source CRM"
**Middle columns:**
- Product: Features, Live Demo, Changelog, API Docs
- Community: GitHub, Issues, Contributing, Discussions
- Xgenious: Website, Other Products, Twitter/X

**Right:** GitHub star button widget
**Bottom bar:** `© 2025 Xgenious. MIT License. Free forever.`

---

## 5. Key Copy Rules

1. **Lead with "free"** on every section. Reinforce it relentlessly.
2. **Never say "free plan"** — there are no plans. There is one product and it is free.
3. **Avoid enterprise jargon** — no "scalable solutions", "robust platform", "streamline workflows".
4. **Be specific** — "15 contacts, 12 leads, 10 deals seeded on demo" beats "lots of demo data".
5. **Developer-friendly voice** — command-line snippets, GitHub links, tech names are all welcome.

---

## 6. Responsive Behaviour Notes

| Breakpoint | Behaviour |
|---|---|
| Desktop (≥1280px) | 3-col feature grid, horizontal stats bar, side-by-side CTAs |
| Tablet (768–1279px) | 2-col feature grid, stacked CTAs |
| Mobile (<768px) | 1-col everything, hamburger nav, screenshots as swipeable carousel |

---

## 7. Assets to Prepare / Request

- [ ] Mini CRM logo (SVG, light + dark variants)
- [ ] Product screenshots (export from live demo or local install)
- [ ] Browser frame mockup template (Figma community has free ones)
- [ ] Tech stack logos (Laravel, React, Tailwind, MySQL — all freely available)
- [ ] Favicon (use the CRM icon from the login page)

---

## 8. Pages in Scope

This brief covers **one page only**: the public marketing homepage (`/`).

The following are out of scope for this design brief:
- Documentation site
- Blog / changelog
- GitHub README (already written)

---

*Brief written by Xgenious. For questions contact the development team.*
