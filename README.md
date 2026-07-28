# TravelOnBuddy

A local-buddy travel matching site. There are now **two** frontends sharing one backend:

- `docs/` — the public marketing site (Home, Why Buddy, Buddies, Stories, Become a Buddy, Plan, Login, Signup) as **plain HTML/CSS/JS** — no build step, no bundler. Open any page directly by double-clicking it. Named `docs/` (not `site/`) so GitHub Pages can serve it straight from this branch — see [GitHub Pages](#github-pages) below.
- `src/` — the **admin panel** (React + Vite), for managing hero photos, buddy applications, plan requests, buddies, stories and users.
- `server/` — the Express API + SQLite database both frontends talk to.

## Project layout

- `docs/` — plain HTML/CSS/JS public site (`index.html`, `why-buddy.html`, `buddies.html`, `stories.html`, `become-a-buddy.html`, `plan.html`, `login.html`, `signup.html`, `404.html`, plus `css/` and `js/`)
- `src/` — React admin panel (`src/admin/`) built with Vite
- `server/` — Express API + SQLite (`server/src/`)
- `dist/` — built output of the React app (the admin panel), openable via double-click too

## Running it

### Public site (`docs/`)

No install, no build — just open `docs/index.html` directly (double-click, or drag into a browser tab). Every page renders and browses fine with zero setup.

To get live data (hero photos, buddies, stories) and working forms (login/signup, "Become a buddy", "Plan my trip"), start the backend too:

```bash
cd server
npm install
npm run dev
```

Login/signup sessions only persist reliably if `docs/` is served over `http://` rather than opened via `file://` (browsers won't attach cookies to a `file://` page) — but the buddy-application and plan-request forms, and the live hero/buddies/stories data, work either way.

### Admin panel (`src/`, React)

```bash
# terminal 1 — backend
cd server
npm install
npm run dev

# terminal 2 — admin panel
npm install
npm run dev
```

Then open `http://localhost:5173/#/admin/login`.

### The .bat files

- `start-backend.bat` — installs backend deps on first run, then starts the API on `http://localhost:4000`.
- `start-website.bat` — starts the Vite dev server (the admin panel) on `http://localhost:5173`.

For the public site there's nothing to start — just open `docs/index.html`.

## GitHub Pages

The live site at `https://<username>.github.io/<repo>/` is served straight from `docs/` on `master` (Settings → Pages → source: `master` / `/docs`) — that's the whole reason the public site lives in a folder named `docs/` instead of `site/`. It needs no build step, so every push to `master` goes live within a minute or two. The React admin panel (`src/`) is **not** part of this deploy — it needs the Express API, which isn't hosted here, so run it locally (see below) or deploy `server/` + the built `dist/` somewhere that can run Node.

## Backend API

Base URL: `http://localhost:4000/api` (configurable via `server/.env` → `PORT`).

Data is stored in `server/data/travel.db` (SQLite, created automatically on first run). Uploaded hero photos live in `server/uploads/`.

| Method | Path                    | Purpose                                             |
| ------ | ----------------------- | ---------------------------------------------------- |
| POST   | `/auth/signup`          | Create an account, starts a session                  |
| POST   | `/auth/login`           | Log in, starts a session                             |
| POST   | `/auth/logout`          | Ends the session                                     |
| GET    | `/auth/me`              | Current logged-in user, or `{ user: null }`          |
| GET    | `/buddies`              | List of sample buddies                               |
| GET    | `/stories`              | List of traveller stories                            |
| GET    | `/hero-slides`          | Homepage hero photo rotation                         |
| POST   | `/buddy-applications`   | Submit a "Become a buddy" application                |
| POST   | `/plan-requests`        | Submit a trip-planner search / enquiry               |
| `/admin/*`              | Admin-only (dashboard stats, CRUD on buddies/stories/hero photos, application review, users) — requires an admin session |

Sessions are a JWT in an httpOnly cookie — nothing auth-related is kept in `localStorage`. The admin account is seeded automatically from `server/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) on first startup.

CORS accepts the Vite dev origin and `Origin: null` (what browsers send for `file://` pages), so `docs/`'s cookie-free endpoints work whether it's opened directly or served.

## Frontend notes

- `docs/` is deliberately framework-free: each page duplicates the same two `<div id="site-header">` / `<div id="site-footer">` placeholders, filled in by `docs/js/nav.js` so the header/nav/footer markup only lives in one place.
- `src/` (the admin panel) uses Vite + React with Oxlint. See `vite.config.js` for the double-click-friendly production build setup (relative asset paths, non-module script, hash-based routing) — that still matters for `dist/`, the admin panel's own build output.
