# STEM Quest

STEM Quest is a fun, gamified learning platform for students. It turns STEM practice (math, science, technology, and engineering) into a collection of interactive mini-games where every correct answer earns points, badges, and progress toward learning goals.

> **No backend required.** The entire app runs in the browser and stores all data locally using `localStorage`, so it can be hosted on any static file server (including GitHub Pages, Netlify, Vercel, or a simple `live-server`).

![Tech](https://img.shields.io/badge/HTML-Tailwind%20CSS-blue) ![Storage](https://img.shields.io/badge/Storage-localStorage-green) ![PWA](https://img.shields.io/badge/PWA-ready-orange)

---

## 🚀 Features

- **Multi-user accounts** — Register, log in, and switch between students. Each account keeps its own points, badges, and history.
- **8 interactive mini-games** — Fraction Frenzy, Algebra Solver, Number Ninja, Geometry World, Calculus Crusher, Pattern Predictor, Statistics Star, and Logic Puzzle. Every game generates fresh problems each play.
- **Real gamification** — Points, lives, hints, streaks, and animated achievement badges ("First Steps", "Math Explorer", "Math Master" and more).
- **Progress tracking** — A dashboard that shows total points, games completed, time spent, per-subject accuracy, and a downloadable progress report.
- **Student profiles** — Editable profile, avatar, password changes, and learning preferences that persist between sessions.
- **Offline support (PWA)** — A service worker precaches all pages so the app still loads with no internet connection.
- **Responsive UI** — Built mobile-first with Tailwind CSS; works great on phones, tablets, and desktops.

---

## 🧑‍🏫 Demo Account

A sample account is pre-seeded so you can explore right away:

| Field    | Value        |
| -------- | ------------ |
| Username | `student`    |
| Password | `password123`|

You can also create your own account from the login page.

---

## 📁 Project Structure

```
stem-quest/
├── index.html                 # Landing page (redirects to student login)
├── pages/
│   ├── student_login.html     # Login / sign-up
│   ├── student_dashboard.html # Overview: points, streak, badges, activity
│   ├── game_selection.html    # Library of 8 games
│   ├── game_interface.html    # The playable game engine
│   ├── progress_tracking.html # Stats, subject performance, goals, export
│   └── student_profile.html   # Profile, avatar, password, preferences
├── public/
│   ├── data-store.js          # Central data store (users, progress, badges)
│   ├── auth.js                # Auth helpers built on the data store
│   └── manifest.json          # PWA manifest
├── css/
│   ├── tailwind.css           # Tailwind source with custom utilities
│   └── main.css               # Compiled stylesheet
├── sw.js                      # Service worker (offline support)
├── package.json               # Dev tooling + scripts
├── netlify.toml               # Netlify deployment config
└── vercel.json                # Vercel deployment config
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v12 or higher (only needed for the dev server tooling)

### 1. Install dependencies

```bash
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Then open <http://localhost:8080>. `live-server` serves the files and reloads on change.

> Tip: because the app uses `localStorage`, opening pages via `file://` generally works too, but a local server is recommended for the service worker and PWA features.

---

## 🎮 How the App Works

1. **Log in or sign up** — authentication is handled client-side in `public/auth.js` on top of `public/data-store.js`. Passwords are stored per-account in `localStorage` (this is a demo-safe approach for a no-backend app).
2. **Play games** — pick a game from the library. The game engine in `game_interface.html` generates random problems, tracks score, lives, hints, and time, then records the result.
3. **Track progress** — every completed game updates your total points, subject accuracy, streak, and badges automatically. Download the report on the Progress page to see everything as a text file.
4. **Go offline** — after the first visit, the service worker keeps the app available offline.

---

## 🧩 Tech Stack

- **HTML5** — semantic, accessible page structure
- **Tailwind CSS** — utility-first styling compiled into `css/main.css`
- **Vanilla JavaScript** — no frameworks; everything is plain, readable ES5-style JS
- **PWA** — `manifest.json` + `sw.js` for installability and offline caching
- **localStorage** — the single source of truth for accounts and progress

---

## 📦 Deployment

The project is a collection of static files, so deployment is a one-click affair on any static host.

### Netlify

Drag-and-drop the folder at <https://app.netlify.com/drop>, or use the included `netlify.toml` with the Netlify CLI:

```bash
netlify deploy --prod
```

### Vercel

```bash
vercel
```

### GitHub Pages

Push the repo and enable Pages from the root of the `main` branch. No build step is required.

---

## 🧑‍💻 Development

Available npm scripts:

| Script              | Description                                     |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Start `live-server` with auto-reload            |
| `npm run build:css` | Rebuild the Tailwind stylesheet                 |
| `npm run serve`     | Serve with `npx serve`                          |

To customize colors, fonts, and spacing, edit `tailwind.config.js` and rebuild the CSS.

---

## 🙏 Acknowledgments

- Originally scaffolded with [Rocket.new](https://rocket.new)
- Built with HTML, Tailwind CSS, and vanilla JavaScript