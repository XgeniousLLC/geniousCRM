import { defineConfig } from 'vitepress'

// When deploying to GitHub Pages set env DOCS_BASE to '/geniousCRM/'
// Vercel uses '/' (default)
const base = process.env.DOCS_BASE || '/'

export default defineConfig({
  base,
  lang: 'en-US',
  ignoreDeadLinks: 'localhostLinks',
  title: 'Mini CRM',
  description: 'User documentation for Mini CRM — the free, open-source CRM by Xgenious.',

  head: [
    ['link', { rel: 'icon', href: `${base}favicon.ico` }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Mini CRM Docs',

    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Features', link: '/features/contacts' },
      { text: 'Live Demo', link: 'https://crm-demo.xgenious.com' },
      { text: 'GitHub', link: 'https://github.com/XgeniousLLC/geniousCRM' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction',      link: '/guide/introduction' },
          { text: 'Quick Start',       link: '/guide/quick-start' },
          { text: 'Installation',      link: '/guide/installation' },
          { text: 'Docker Setup',      link: '/guide/docker' },
          { text: 'Configuration',     link: '/guide/configuration' },
          { text: 'First Login',       link: '/guide/first-login' },
        ],
      },
      {
        text: 'Features',
        items: [
          { text: 'Dashboard',         link: '/features/dashboard' },
          { text: 'Contacts',          link: '/features/contacts' },
          { text: 'Leads',             link: '/features/leads' },
          { text: 'Deals & Pipeline',  link: '/features/deals' },
          { text: 'Companies',         link: '/features/companies' },
          { text: 'Tasks',             link: '/features/tasks' },
          { text: 'Activity Feed',     link: '/features/activity' },
          { text: 'Reports',           link: '/features/reports' },
          { text: 'Notifications',     link: '/features/notifications' },
          { text: 'CSV Import',        link: '/features/csv-import' },
        ],
      },
      {
        text: 'Account & Security',
        items: [
          { text: 'Profile & Password', link: '/features/profile' },
          { text: 'Two-Factor Auth',    link: '/features/2fa' },
          { text: 'Active Sessions',    link: '/features/sessions' },
          { text: 'Roles & Permissions',link: '/features/roles' },
          { text: 'Dark Mode',          link: '/features/dark-mode' },
        ],
      },
      {
        text: 'Administration',
        items: [
          { text: 'User Management',    link: '/features/users' },
          { text: 'General Settings',   link: '/features/settings' },
          { text: 'Trash & Restore',    link: '/features/trash' },
          { text: 'Demo Reset',         link: '/guide/demo-reset' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/XgeniousLLC/geniousCRM' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Xgenious',
    },

    editLink: {
      pattern: 'https://github.com/XgeniousLLC/geniousCRM/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
    },
  },
})
