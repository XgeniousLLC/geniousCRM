---
title: Keyboard Shortcuts
parent: Features
nav_order: 20
---

# Keyboard Shortcuts
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Mini CRM supports keyboard shortcuts for common actions. Shortcuts are disabled when focus is inside a text input, textarea, or select element so they never interfere with typing.

---

## Shortcut Reference

| Key | Action |
|-----|--------|
| `/` | Focus the global search bar |
| `N` | Open the Quick Create panel |
| `?` | Open the Keyboard Shortcuts help modal |
| `Escape` | Close any open modal, drawer, or panel |

---

## Global Search (`/`)

Pressing `/` from anywhere in the app moves keyboard focus into the search bar in the top header. Start typing immediately — results appear after 2 characters.

---

## Quick Create (`N`)

Pressing `N` opens a Quick Create panel with buttons to create common entities:

- New Contact
- New Lead
- New Deal
- New Task

Clicking any option opens the standard create modal for that entity.

---

## Shortcuts Help (`?`)

Pressing `?` opens a modal listing all available shortcuts. Press `?` again or `Escape` to close it.

---

## Escape

`Escape` closes whatever is currently open:

- A modal dialog
- The Quick Create panel
- The Shortcuts help modal
- The notification dropdown

---

## Shortcut Scope

Shortcuts **do not fire** when:

- The cursor is inside an `<input>`, `<textarea>`, or `<select>`.
- The focused element has `contenteditable`.

This prevents accidental triggers while filling in forms.

---

## Implementation

Shortcuts are managed by `useKeyboardShortcuts()` in `AppLayout.jsx`:

```js
function useKeyboardShortcuts() {
    const [showHelp, setShowHelp] = useState(false);
    const [showQuickCreate, setShowQuickCreate] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            const inInput = ['INPUT', 'TEXTAREA', 'SELECT']
                .includes(document.activeElement?.tagName)
                || document.activeElement?.isContentEditable;

            if (e.key === 'Escape') {
                setShowHelp(false);
                setShowQuickCreate(false);
                return;
            }
            if (inInput) return;

            if (e.key === '?') {
                e.preventDefault();
                setShowHelp(prev => !prev);
                setShowQuickCreate(false);
            } else if (e.key === 'n' || e.key === 'N') {
                e.preventDefault();
                setShowQuickCreate(prev => !prev);
                setShowHelp(false);
            }
        };

        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    return { showHelp, setShowHelp, showQuickCreate, setShowQuickCreate };
}
```

The `/` shortcut is handled separately in the `TopHeader.jsx` search bar component via a `keydown` listener on `document`.

---

## Files Involved

| File | Role |
|------|------|
| `Modules/Core/resources/js/Components/Layout/AppLayout.jsx` | `useKeyboardShortcuts` hook, help modal, quick-create panel |
| `Modules/Core/resources/js/Components/Layout/TopHeader.jsx` | `/` shortcut to focus search bar |
