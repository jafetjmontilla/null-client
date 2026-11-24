# Null Client — Launcher

Learn by **building**. The current UI follows the main reference layout
(3 columns + hero) and runs as a **desktop app with Electron**.

## Open with Electron (recommended)

In a terminal, inside this `launcher` folder:

```powershell
npm install
npm start
```

A Windows window opens (no system frame: we use our own titlebar).

## Open in the browser (still works)

Double-click `index.html` or open it in Chrome/Edge.
The min/close buttons are visual-only there.

## Important files

| File | What it is |
|------|------------|
| `index.html` | UI structure |
| `styles.css` | Colors, layout, animations |
| `app.js` | UI logic (versions, Play, etc.) |
| `electron-main.js` | Creates the Electron window |
| `preload.js` | Safe bridge HTML ↔ Electron |
| `assets/` | Images / logo / heroes |

## Electron idea (simple)

1. `electron-main.js` opens a window
2. That window loads `index.html`
3. Your titlebar buttons talk to Electron via `preload.js`

## Assets

Read `assets/README.md` and drop logo, hero, avatar, server icons, etc. there.
