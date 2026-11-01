# TravelOnBuddy — Security & System Audit

- **Date:** 2026-11-01
- **Commit:** `bad3d83` (master), plus the uncommitted Docker files added the same day
- **Method:** I read every backend file, reviewed the frontend code paths that render API data, ran `npm audit`, and ran harmless dynamic checks against the local Docker stack (`localhost:4000` / `localhost:8080`) using a throwaway test account. I made no application code changes.

Findings are tagged **Confirmed** (reproduced locally or unambiguous from code), **Potential** (needs preconditions not present in the repo), or **Design** (a weakness, not an exploitable bug on its own).

---

## 0. Executive summary

The codebase is small and gets several fundamentals right: every SQL statement is parameterized, passwords are hashed with bcrypt, the session cookie is `httpOnly`, admin checks re-read the role from the database on every request, and both packages have **0 known dependency vulnerabilities**.

The real risks are concentrated in a few places:

| # | Severity | Finding | Status |
|---|---|---|---|
| F1 | **High** | Anyone can read a trip request's name, email and phone via `GET /api/plan-requests/:reference`. No frontend uses this endpoint, and the references are guessable. | Confirmed |
| F2 | **High** (reliability) | On a fresh install every trip-planner submission fails with a 500 until the server is restarted | Confirmed |
| F3 | Medium | Sessions cannot be revoked. Logout and password change leave old tokens valid for 7 days. | Confirmed |
| F4 | Medium | `forgot-password` confirms whether an account exists and **reveals which email is the admin**. `change-password` works without being signed in. | Confirmed |
| F5 | Medium | Stored XSS on the public site: stories and buddies are inserted with `innerHTML` without escaping | Confirmed (code) |
| F6 | Medium | Government ID numbers and other applicant PII are stored in plaintext, with no audit trail of who views them | Design |
| F7 | Medium | Admin seeding promotes any existing account that owns `ADMIN_EMAIL` and keeps that account's password. Signup has no email verification. | Potential |
| F8 | Low–Med | Public write endpoints have no schema validation or length limits. Bad input types cause 500 errors. | Confirmed |
| F9 | Low–Med | Rate limiting is in-memory and per-IP only, and `trust proxy` is unset, so it breaks behind a reverse proxy | Design |
| F10 | Low | CORS accepts `Origin: null` with credentials | Confirmed |
| F11 | Low | Cookie `Secure` flag depends on `NODE_ENV`. Admin panel has no clickjacking protection. Containers run as root. | Confirmed |
| F12 | Info | Smaller issues: Host-header reflection, error-message leak, orphaned upload files, hardcoded API URL, no tests, CI or audit log | Confirmed |

---

## 1. Phase one — understanding the system

### 1.1 Architecture

```
docs/      Public marketing site — plain HTML/CSS/JS, no build. Hosted on GitHub Pages (per README)
src/       Admin panel — React 19 + Vite 8, hash routing, built to dist/
server/    Express 5 API, Node ≥22.5 (uses built-in node:sqlite), single SQLite file
docker/, Dockerfile.web, server/Dockerfile, docker-compose.yml   (added 2026-11-01, uncommitted)
```

- **Runtime:** Node 24 (container: v24.21.0), npm with lockfiles in both packages. The backend is plain JavaScript (ESM). The frontend is mostly JSX, with a few `.tsx` files.
- **Bootstrap** (`server/src/index.js`): loads `dotenv`, opens and migrates the database on import of `db.js`, throws on import of `auth.js` if `JWT_SECRET` is missing, runs `seedAdmin()`, then `createApp()` and `listen`.
- **Interfaces:** REST/JSON only. There is no GraphQL, WebSocket, queue, cron, webhook, or outbound HTTP integration.
- **Storage:** SQLite at `server/data/travel.db` (WAL mode) with a single synchronous connection. Uploads go to `server/uploads/hero/`, served publicly at `/uploads`.
- **Auth:** an HS256 JWT (`sub` = user id, 7-day expiry) in the `tob_session` httpOnly cookie. There is no server-side session store.
- **Roles:** `user`, `client` (both self-selectable at signup, with identical privileges) and `admin` (created only by `seedAdmin`).

### 1.2 Component and dependency inventory

| Package | Runtime deps | Notes |
|---|---|---|
| `server` | express 5, helmet 8, cors, cookie-parser, express-rate-limit 8, jsonwebtoken 9, bcryptjs 3, multer 2, dotenv | `npm audit --omit=dev`: **0 vulnerabilities** |
| root (admin) | react 19, react-dom, react-router-dom 7, three, lucide-react, canvas-confetti | `npm audit`: **0 vulnerabilities**. `@types/*` packages are listed under `dependencies` rather than `devDependencies` (harmless). |

There are no `postinstall` or other lifecycle scripts in either manifest. I found no `eval`, `new Function`, `child_process`, or dynamic `import()` of user input.

### 1.3 API and entry-point inventory

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | none | Liveness check |
| POST | `/api/auth/signup` | none | Create an account and set the cookie |
| POST | `/api/auth/login` | none | Log in and set the cookie |
| POST | `/api/auth/logout` | none | Clear the cookie (client-side only) |
| POST | `/api/auth/change-password` | **none** (email + current password) | Change password |
| POST | `/api/auth/forgot-password` | none | Returns account email + role |
| GET | `/api/auth/me` | cookie (optional) | Current user |
| GET | `/api/buddies`, `/api/stories`, `/api/hero-slides` | none | Public content |
| POST | `/api/buddy-applications` | none | Guide application (incl. government ID) |
| POST | `/api/plan-requests` | none | Trip enquiry |
| GET | `/api/plan-requests/:reference` | **none** | Returns the enquirer's PII (F1) |
| GET | `/uploads/*` | none | Static uploaded images |
| * | `/api/admin/{stats,users,buddy-applications,plan-requests,buddies,stories,hero-slides}` | admin | Back office (`requireAdmin` on the whole router) |

The web container serves `docs/` at `/` and `dist/` at `/admin/` via nginx (`localhost:8080`).

### 1.4 Trust boundaries

```
 Browser (untrusted)
   │  public site (docs/, GitHub Pages or nginx :8080)   admin SPA (/admin/)
   │        └──────── fetch, credentials:"include" ─────────┘
   ▼
 [TB1] Network edge — no reverse proxy/TLS in repo; API published directly on :4000
   ▼
 Express app (server/src/app.js)
   helmet → global rate limit (in-memory, per IP) → auth rate limit (/api/auth)
   → CORS (CLIENT_ORIGIN or "null") → JSON body ≤1 MB → cookie-parser
   ▼
 [TB2] Authentication — JWT from cookie, verified per request (getUserIdFromRequest)
   ▼
 [TB3] Authorization — requireAdmin (role read from DB) on /api/admin/* only
   ▼
 Route handlers (hand-written validation)  ──►  [TB4] SQLite file (node:sqlite, parameterized)
                                           ──►  [TB5] Local filesystem (uploads/hero, public via /uploads)
```

### 1.5 Sensitive data flows

| Data | Enters via | Stored | Leaves via |
|---|---|---|---|
| Passwords | signup / login / change-password (JSON body) | bcrypt hash (cost 10) in `users.password_hash` | never returned |
| Account PII (name, email, phone, city, company) | signup | plaintext `users` | `/auth/me` (self), `/admin/users` (admin) |
| Applicant PII: DOB, **government ID type + number**, phone, WhatsApp, 2 references' names and phones, free text | `POST /buddy-applications` (anonymous) | plaintext `buddy_applications` | `/admin/buddy-applications/:id` (admin) |
| Traveller PII: name, email, phone, dates, notes | `POST /plan-requests` (anonymous) | plaintext `plan_requests` | `/admin/plan-requests` (admin) **and `GET /plan-requests/:reference` (anyone, F1)** |
| Session JWT | set by API | browser cookie only | — |
| `JWT_SECRET`, `ADMIN_PASSWORD` | env (`server/.env` or root `.env` for Docker; both gitignored, neither committed) | process env | not logged |

### 1.6 What I could not inspect

- **Production deployment:** the repo has no hosting, TLS, reverse proxy, backup, or cloud config. The README says only the static `docs/` site is deployed (GitHub Pages), so I couldn't verify any real production API.
- **CI/CD:** there is no `.github/` directory or pipeline config.
- **Real environment values:** I checked that `.env` files are gitignored and that none appear in git history. I did not read the secret values.
- **Load and brute-force behaviour:** I deliberately ran no DoS or credential-guessing tests, so the rate-limit behaviour is assessed from code.
- **Visual and UX code in `src/`** (3D scenes, landing pages) was skimmed for XSS sinks only.

---

## 2. Findings

### F1 — Unauthenticated PII disclosure via plan-request lookup (High, Confirmed)

**Where:** `server/src/routes/planRequests.js:87-109`, `server/src/auth.js:43-45`

```js
router.get("/:reference", ... db.prepare(`SELECT id, ..., full_name AS fullName, email, phone, ... FROM plan_requests WHERE id = ?`).get(reference)
export function makeReferenceCode() {
  return `TOB-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}
```

**What happens:** anyone who knows or guesses a reference gets the traveller's full name, email, phone, dates and free-text notes. References are `TOB-<year>-<5 base-36 chars>`. That is about 6×10⁷ possible values, generated with `Math.random()` (not a CSPRNG), and the year is known. The global limiter allows 300 requests per 15 minutes per IP, which is about 28,800 guesses per IP per day. With *N* stored requests, the expected number of guesses per hit is about 6×10⁷/*N*. Neither frontend calls this endpoint (I grepped `src/` and `docs/js/`), so it is pure exposure.

**Reproduced:**
```
POST /api/plan-requests {"fullName":"Audit Test","email":"audit-plan@example.test",...}  → reference TOB-2026-BRHCJ
GET  /api/plan-requests/TOB-2026-BRHCJ  (no cookie)  → 200 {"request":{"fullName":"Audit Test","email":...,"phone":...}}
```

**Related issue:** the same short code is the table's primary key. A collision throws a SQLite constraint error, so the user gets a 500 and the submission is lost. By the birthday bound this becomes likely after a few thousand requests per year.

**Fix:**
1. Delete the `GET /:reference` route. If a "check my booking" feature is planned later, build it on an authenticated owner check, or on a separate unguessable token (`crypto.randomBytes(16)`) delivered by email.
2. Generate references with `crypto.randomInt`, and make them longer (for example 8 chars), or keep a separate internal `randomUUID()` primary key. Retry on a unique-constraint error.

### F2 — Fresh install: `plan_requests` is created without its columns (High, reliability, Confirmed)

**Where:** `server/src/db.js:48-69` and `:135-143`

`migratePlanRequestsTable()` runs *before* `CREATE TABLE IF NOT EXISTS plan_requests`. On a new database the table doesn't exist yet, so the migration returns early. The table is then created with the **old** column set, and every `POST /api/plan-requests` fails:

```
Error: table plan_requests has no column named full_name   (planRequests.js:50)
```

The migration only adds the columns on the *next* restart. I reproduced this on the fresh Docker volume: the first submission returned a 500, and it worked after `docker compose restart api`. Any new deployment, CI database, or wiped volume silently loses every trip enquiry until someone restarts the server.

**Fix:** put the full current schema (including `full_name … status`) in the `CREATE TABLE` statement, and run migrations after the create statements. Longer term, track a `PRAGMA user_version` so each migration runs once, in order, inside a transaction.

### F3 — Sessions cannot be revoked (Medium, Confirmed)

**Where:** `server/src/auth.js:9-41`, `routes/auth.js:80-111`

Sessions are stateless 7-day JWTs. `logout` only asks the browser to delete its cookie. `change-password` updates the hash but invalidates nothing. Reproduced:

- After `change-password`, the old cookie still returned the user from `/auth/me`.
- After `logout`, a copy of the pre-logout cookie still returned the user from `/auth/me`.

**Impact:** a stolen admin token (from a shared machine, a browser extension, or an XSS such as F5) keeps full admin access for up to 7 days, and the victim has no way to cut it off. Admin access includes government ID numbers (F6).

**Fix (minimal):** add `token_version INTEGER NOT NULL DEFAULT 0` (or `password_changed_at`) to `users`. Put it in the JWT, compare it in `getUserIdFromRequest`/`requireAdmin` (both already query the user row in the admin path), and increment it on password change and on an explicit "sign out everywhere". Also shorten the admin session (for example 8–12 h) and pin `algorithms: ["HS256"]` in `jwt.verify`. jsonwebtoken 9 already rejects `none` for HMAC keys, so pinning is defence in depth.

### F4 — Account enumeration, admin identification, and an unauthenticated password-change oracle (Medium, Confirmed)

**Where:** `routes/auth.js:113-142` (forgot-password), `:85-111` (change-password), `:45-46` (signup 409), `:71-73` (login timing)

- `POST /auth/forgot-password` returns **404** for unknown emails and `{"email", "role":"admin", ...}` for known ones. I confirmed it returns `role: "admin"` for the admin address. An attacker can therefore find the one account worth attacking. It sends no reset email.
- Its message tells the admin that the password "can be directly reset in server/.env via ADMIN_PASSWORD". **That is false:** `seedAdmin.js:13-20` returns early when the account already exists, so changing `ADMIN_PASSWORD` after first boot does nothing. An operator following the message would believe they had rotated a credential when they hadn't.
- `POST /auth/change-password` needs no session, only email + current password. It is a second password-guessing endpoint, limited only by the shared per-IP auth limiter (20 per 15 min, `app.js:36-44`). There is no per-account lockout, so a distributed attacker is effectively unthrottled.
- Login skips bcrypt when the email doesn't exist (`login`, line 72), which gives a timing side channel. Signup returns 409 for existing emails. Both are lower impact once forgot-password is fixed.

**Fix:** have forgot-password always return the same generic 200 and send the reset link by email. Until there is an email channel, remove the endpoint and document an operator-run reset script. Require a valid session for change-password and use `req.userId`, not a body email. Add per-account failed-login throttling (count in the DB or limiter store, keyed by email). Run a dummy `bcrypt.compare` when the user doesn't exist. Fix or remove the misleading `.env` message.

### F5 — Stored XSS on the public site via admin-managed content (Medium, Confirmed from code)

**Where:** `docs/js/stories.js:36-41, 73-81`, `docs/js/buddies.js:20-32`, `docs/js/hero.js:24-29`

```js
wrap.innerHTML = `... <p>${s.quote}</p><footer><strong>${s.name}</strong><span>${s.trip}</span></footer>`;
<h3>${b.name}</h3> ... ${b.city} ... ${b.tongue}   style="background:${b.hue}"
```

These values come from `/api/stories` and `/api/buddies`. Admins edit them through `routes/admin/stories.js` and `routes/admin/buddies.js`, which only check that the fields are non-empty (`hue` is regex-checked, the rest are free text). A story such as `<img src=x onerror=…>` runs on every visitor's browser.

**Preconditions:** an admin account (malicious, or compromised via F3/F4). Even so, it matters. Under Docker the public site (`localhost:8080`) and the API (`localhost:4000`) are *same-site*, so the `SameSite=Lax` cookie is sent. Script running on the public site while an admin browses it can call `/api/admin/*` with that admin's session. One compromised admin account becomes persistent, self-spreading access to all applicant PII. The React admin panel itself is safe, because JSX escapes text and there is no `dangerouslySetInnerHTML`.

**Fix:** add a single `escapeHtml()` helper in `docs/js/` and apply it to every API-sourced value inserted into markup, or build those nodes with `textContent`. Add a CSP on the static site (`script-src 'self'`; the site already uses external JS files) as a second layer.

### F6 — Government ID numbers and applicant PII stored in plaintext; no access audit (Medium, Design)

**Where:** `db.js:101-133` (`id_type`, `id_number`, `dob`, reference phones), `routes/admin/buddyApplications.js:48-52` (returns `SELECT *`)

Every applicant's ID document number is stored in cleartext, kept indefinitely, and returned in full to any admin, with no log of who viewed what. A copied `travel.db` (or an unencrypted backup of the Docker volume) exposes all of it. Indian ID numbers (Aadhaar, PAN, etc.) carry regulatory obligations under the DPDP Act, 2023.

**Fix:** decide whether the full number is needed at all. Often the last 4 digits plus a manual check is enough. If it is needed, encrypt the column at the application layer (AES-256-GCM with a key from the secret store, not the DB). Show a masked value by default. Add an `admin_audit_log` table for detail views and status changes. Define a retention period and purge rejected applications after it.

### F7 — Admin seeding can promote an attacker-registered account (Medium, Potential)

**Where:** `server/src/seedAdmin.js:13-20`, `routes/auth.js:27-59`

On each boot, if a user with `ADMIN_EMAIL` already exists, it is promoted to `admin` **with its existing password**. Signup never verifies email ownership, so anyone can register any address. If an operator ever points `ADMIN_EMAIL` at an address someone has already signed up with (a new staff address, or a guessable one like `admin@<domain>`), that person becomes admin on the next restart. The `.env.example` default `admin@example.com` makes this easy to overlook.

**Fix:** never promote an existing non-admin account automatically. Fail loudly instead, or create the admin only when the email is unused. Better still, replace boot-time seeding with a one-off CLI command (`node scripts/create-admin.js`). Add email verification before an account counts as owning its address.

### F8 — No schema validation or length limits; type confusion causes 500s (Low–Medium, Confirmed)

**Where:** every write route. Examples: `routes/auth.js:31-37`, `routes/buddyApplications.js:23-43`, `routes/planRequests.js:21-47`, `routes/admin/heroSlides.js:104`

- Fields are read with `(body.x || "").trim()`. A non-string, for example `{"email":["a"]}`, throws inside the handler, and the response is a generic 500 (confirmed on `/auth/login`). This doesn't crash the process thanks to `asyncHandler`, but it fills the logs with stack traces and hides real errors.
- There are no maximum lengths. Any field of the two **anonymous** forms can be close to 1 MB (`express.json({limit:"1mb"})`, `app.js:59`). At 300 requests per 15 minutes per IP, that is a few hundred MB per IP per day of disk use and an admin queue full of spam. Enum-like fields (`who`, `guidingYears`, `daysPerWeek`, `idType`, `gender`, `vehicle`, `style`, `pace`) accept anything.
- `arrive`/`depart` are compared as strings (`planRequests.js:38`) and not validated as dates.

**Fix:** add a small schema layer (`zod` is a common choice) for each route, with `.strict()` objects, string `max()` lengths, enums, ISO date checks and array size caps. Map validation failures to 400. Lower the JSON body limit to about 64 KB for non-upload routes. Consider a CAPTCHA-free honeypot field or a per-email/phone daily cap on the anonymous forms.

### F9 — Rate limiting doesn't fit a real deployment (Low–Medium, Design)

**Where:** `server/src/app.js:27-44`

- The store is in-memory, so it resets on restart and isn't shared across instances.
- `app.set("trust proxy", …)` is not configured. Behind any reverse proxy or load balancer, `req.ip` is the proxy's IP, so **all users share one bucket**. 20 failed logins from anyone would lock everyone out of `/api/auth` for 15 minutes, and 300 requests site-wide would rate-limit the whole site. If someone "fixes" this with `trust proxy: true`, `X-Forwarded-For` becomes spoofable and the limiter is bypassed.
- Limits are per IP only, with nothing per account (see F4).

**Fix:** set `trust proxy` to the exact number of proxy hops (or the proxy subnet) used in deployment. Add per-email login throttling. Use a shared store (Redis, or a SQLite table for a single instance) if more than one API process will run.

### F10 — CORS trusts `Origin: null` with credentials (Low, Confirmed)

**Where:** `server/src/app.js:46-58`

```
GET /api/auth/me  Origin: null  →  Access-Control-Allow-Origin: null, Access-Control-Allow-Credentials: true
```

`null` is sent by `file://` pages, but also by sandboxed iframes and some redirects, so any site can produce it. Today the impact is limited because `SameSite=Lax` keeps the session cookie off cross-site subrequests. That makes this defence in depth, not an open hole, but the cookie-free public endpoints don't need credentials and the README's `file://` use case doesn't either.

**Fix:** allow `null` only for non-credentialed requests, or only when `NODE_ENV !== "production"`. Support a comma-separated list in `CLIENT_ORIGIN` instead of special cases.

### F11 — Transport and deployment hardening (Low, Confirmed)

- **Cookie `Secure`** is set only when `NODE_ENV === "production"` (`auth.js:27`). Neither `.env.example` nor `docker-compose.yml` sets `NODE_ENV`, so a TLS deployment that copies them sends the session cookie without `Secure`. Helmet sends HSTS from the plain-HTTP API, which is harmless but shows that TLS is assumed and not enforced.
- **Admin panel framing:** the nginx config I added (`docker/nginx.conf`) sends no `X-Frame-Options`/CSP `frame-ancestors`, so `/admin/` can be framed (clickjacking of status-change buttons). The API's own helmet headers don't apply to the static files.
- **Containers** (my Docker files): both run as root, the API port `4000` is published on all interfaces, `npm install` is used instead of `npm ci`, and there is no healthcheck. Node runs as PID 1 without a SIGTERM handler, so `docker stop` waits 10 s and then sends SIGKILL.
- **Startup config:** a missing `JWT_SECRET` correctly fails startup (`auth.js:4-6`). There is no minimum length or entropy check, and a missing `ADMIN_EMAIL`/`ADMIN_PASSWORD` silently skips admin creation, which is acceptable. `.env` files are gitignored, and **no secret was found in the repo or its history**.

**Fix:** enforce `JWT_SECRET.length >= 32` at boot. Make `Secure` the default and opt *out* only for `localhost` development. Add `add_header X-Frame-Options DENY` and `Content-Security-Policy "frame-ancestors 'none'"` for `/admin/` in nginx. In the Dockerfiles, add `USER node`, use `npm ci --omit=dev`, add a `HEALTHCHECK` on `/api/health`, `init: true` (or a SIGTERM handler that closes the server and DB), and publish `4000` only on `127.0.0.1` or behind the reverse proxy.

### F12 — Informational

- **Host-header reflection** (`heroSlideSrc.js:6-8`): upload URLs are built from the request's `Host` header. With no shared cache this only affects the requester. Once a CDN or proxy cache is added it becomes cache-poisoning-capable, and the result is fed into `innerHTML` (`hero.js:24`). Use a configured `PUBLIC_API_URL` instead.
- **Error-message passthrough** (`app.js:84-86`): any error whose message contains "image" is returned verbatim with a 400. Check `err instanceof multer.MulterError` or a custom error class instead of a regex on the message.
- **Upload handling** (`uploads.js`, `routes/admin/heroSlides.js`): the type check trusts the client-declared MIME type. The stored extension is derived from it and served with `nosniff`, so a disguised file is served as an image and is not executable (low risk). File contents are never verified (for example by magic bytes). Files are orphaned when `PUT /:id` fails validation or the slide is missing, because multer writes before the check. `reorder` doesn't verify the id list is complete.
- **Hardcoded API URL** in the public site (`docs/js/api.js:6`): `http://localhost:4000/api`. On GitHub Pages every visitor's forms post to *their own* machine and fail, and an `https` page calling `http` is mixed content. This is a functional bug and a privacy oddity, not a vulnerability.
- **Self-selected role** `client` at signup (`routes/auth.js:35`) grants nothing today. Don't attach privileges to it later without server-side approval.
- **Unbounded admin lists** (`/admin/users`, `/admin/plan-requests`, `/admin/buddy-applications`) have no pagination. That is fine at current scale, but add `LIMIT`/cursor before the tables grow.
- **No automated tests, CI, structured logging, or admin audit trail.** The codebase has no test files, and nothing records which admin changed which status.

---

## 3. Authorization matrix

Roles are anonymous, signed-in `user`/`client` (no different server-side), and `admin`. There is no multi-tenancy.

| Resource / operation | Anonymous | user / client | Admin | Finding |
|---|---|---|---|---|
| Read buddies / stories / hero slides | ✅ intended | ✅ | ✅ | OK |
| Create buddy application | ✅ intended | ✅ | ✅ | OK (but F8: no limits) |
| Create plan request | ✅ intended | ✅ | ✅ | OK (but F2, F8) |
| **Read a plan request by reference** | ❌ **allowed** | ❌ **allowed** | ✅ | **F1** |
| Read own profile (`/auth/me`) | — | ✅ own only (id from JWT) | ✅ | OK |
| **Change a password** | ❌ **allowed with email + current pw** | same | same | **F4** (no session needed) |
| **Learn whether an email exists / is admin** | ❌ **allowed** | ❌ | — | **F4** |
| List users / applications / plan requests, stats | 401 | 403 | ✅ | OK: `requireAdmin` on the router, role re-read from DB |
| Update application / plan-request status | 401 | 403 | ✅ | OK: enum-validated. No audit log (F6). |
| CRUD buddies / stories / hero slides | 401 | 403 | ✅ | OK. Content then rendered unescaped publicly (F5). |
| Become admin | ❌ | ❌ (signup forces `user`/`client`) | — | OK, except F7 |

No IDOR exists between regular users, because users own no resources besides their profile, which is always read by the JWT's `sub`. Every `/api/admin/*` route sits behind `router.use(requireAdmin)`, so I found no function-level gaps.

---

## 4. Input handling and injection summary

| Class | Result |
|---|---|
| SQL injection | **None found.** All queries use `?` placeholders. The only interpolation is `seedIfEmpty`'s table name, which comes from code constants (`db.js:155`). |
| NoSQL / command / SSTI / deserialization / eval | Not applicable or not present |
| XSS | **F5** on the public site. The React admin panel escapes by default. Server error messages inserted via `innerHTML` (`auth.js:294`, `buddy-form.js:314`) are static strings today. Keep it that way, or switch to `textContent`. |
| Path traversal | Upload filenames are server-generated UUIDs. Deletion uses `path.basename`. `/uploads` is served by `express.static`, which rejects `..`. OK. |
| Prototype pollution / unsafe merge | No object merging of request bodies. OK. |
| ReDoS | The regexes (`EMAIL_RE`, `PHONE_RE`, `isValidPos` with a length cap of 50) are linear-time. OK. |
| Type confusion / size | **F8** |
| Open redirect | None. The only redirect is the hardcoded `location.href = "plan.html"`. |

---

## 5. Remediation plan (proposed, not implemented)

Ordered by risk reduced per unit of effort. Each item is a small, local change that preserves current behaviour.

| Order | Change | Fixes | Effort |
|---|---|---|---|
| 1 | Remove `GET /api/plan-requests/:reference`. Generate references with `crypto` and retry on collision. | F1 | XS |
| 2 | Put the full schema in `CREATE TABLE plan_requests`, run migrations after creation, add `user_version` | F2 | S |
| 3 | Make forgot-password generic (or remove it). Require a session for change-password. Remove the misleading `.env` message. | F4 | S |
| 4 | Escape API data in `docs/js/` (`escapeHtml` / `textContent`) | F5 | S |
| 5 | Add `token_version` to users and JWT, increment it on password change and logout-all, shorter admin TTL, pin `algorithms` | F3 | S |
| 6 | Stop auto-promoting existing accounts in `seedAdmin` | F7 | XS |
| 7 | Add per-route schema validation with length caps, lower the body limit | F8 | M |
| 8 | Configure `trust proxy` for the real topology, add per-account login throttling | F9, F4 | S |
| 9 | Harden Docker and nginx (non-root, `npm ci`, healthcheck, frame headers, `Secure` cookie default, `JWT_SECRET` length check) | F11 | S |
| 10 | Decide whether to keep full ID numbers. Mask and/or encrypt them, add an admin audit log and retention. | F6 | M |
| 11 | Restrict `Origin: null`, use a configured public URL instead of `Host`, tidy upload edge cases | F10, F12 | S |
| 12 | Add a minimal test suite (supertest) covering items 1–6, plus CI running tests + `npm audit` | regression safety | M |

**Secret management:** for a single-host Docker deployment, keep secrets in a root-owned `.env` outside the repo, or in Docker secrets. On a cloud host, use the platform's secret manager (AWS Secrets Manager / SSM, GCP Secret Manager, etc.) injected as env at start. No rotation is needed today because no secret was found in the repository or its history.

---

## 6. Remediation status (updated 2026-11-01)

I implemented items 1–6 of the plan and checked each against a fresh database in a throwaway container, and against the existing Docker volume for the upgrade path.

| Item | Change | Verified |
|---|---|---|
| 1 (F1) | Removed `GET /api/plan-requests/:reference`. References are now `TOB-<year>-` plus 8 characters from `crypto.randomInt` (`server/src/reference.js`), and a collision is retried instead of returning a 500. | Lookup returns 404. Both forms return the new references. |
| 2 (F2) | `db.js` creates every table in its current shape before running migrations | The first plan request on a fresh DB succeeds |
| 3 (F4) | forgot-password always returns the same generic 200. change-password requires a session plus the current password. Login compares against a dummy hash for unknown emails. Added the operator command `npm run reset-password -- <email>`. The admin login screen signs in first, then changes the password. | Known and unknown emails get identical responses. change-password returns 401 without a session. |
| 4 (F5) | Added `escapeHtml()` in `docs/js/util.js`, applied to every API value rendered by `stories.js`, `buddies.js` and `hero.js` | Pages render normally. The helper neutralises markup and quotes. |
| 5 (F3) | Added a `users.token_version` column, carried in the JWT as `ver` and checked on every request. It is bumped on logout and on password change. Admin sessions last 12 h, others 7 d. `jwt.verify` is pinned to HS256. | Old and copied cookies are rejected after logout and after a password change. Tokens issued before the upgrade are rejected once. |
| 6 (F7) | `seedAdmin` no longer promotes an existing account. It logs a warning instead. | An existing user stays `user` and the warning is logged |

### Round 2: route protection and middleware (2026-11-01)

| Area | Change | Verified |
|---|---|---|
| Route protection | New `server/src/middleware/auth.js` provides `loadUser`, `requireAuth`, `requireRole(...)` and `requireAdmin`. One `getSessionUser()` checks signature, expiry, token version and that the user exists, in a single query. All of `/api/admin/*` uses `requireAdmin`. `/auth/change-password` uses `requireAuth`. The role is read from the DB on every request. | 7 admin endpoints: anonymous → 401, regular user → 403 (including DELETE and PATCH), admin → 200. Tampered and `alg:none` tokens → 401. A copied cookie after logout → signed out. |
| F8 (input) | New `middleware/validate.js` handles types, max lengths, list sizes and ISO dates, and drops unknown fields, on every JSON write route. `:id` params must be numeric or `TOB-…`. The JSON body limit is now 100 KB. | Array-as-email, a 5,000-char name, a bad date and a string-as-list each → 400 (were 500 or stored as-is). Body over 100 KB → 413. Bad `:id` → 400. `role:"admin"` at signup → 400. |
| CSRF | New `middleware/requestGuards.js`. Writes must be `application/json` (or multipart for uploads), so HTML forms can't post. Disallowed origins get a server-side 403. | `text/plain` and form-encoded POSTs → 415. Foreign Origin GET/POST → 403. |
| F9 (proxy) | `TRUST_PROXY` env sets Express `trust proxy`. It's off by default because the API faces clients directly. | Configuration only |
| F10 (CORS) | `CLIENT_ORIGIN` accepts a comma-separated list. `Origin: null` is allowed only outside production, or with `ALLOW_FILE_ORIGIN=true`. | Dev: 200. A `NODE_ENV=production` container: 403. |
| F11 (config) | The server refuses to start if `JWT_SECRET` is under 32 characters or is the `.env.example` placeholder. nginx sends `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff` and `Referrer-Policy` (framing headers on `/admin/`). | Both bad secrets abort startup. Headers present. |
| F12 | Errors reach clients only when marked safe: multer, CORS, body-parser, or tagged `expose`. Upload URLs use `PUBLIC_API_URL` instead of the Host header. A rejected hero `PUT` deletes the file multer already saved. | Wrong file type → 400. Rejected uploads leave 0 orphan files. |
| Admin app | A 401 from any non-auth API call clears the session in the React app. The admin pages then redirect to login with "Your session ended. Sign in again to continue." | Signed in → all sessions revoked from outside → clicked Buddies → landed on login with the notice |

**Functional regression run:** 64 scripted API checks pass, covering signup, login, password change, logout, plan request, buddy application, admin CRUD, status changes and uploads. In the browser, the static signup (client), finder, buddy application and React booking all submit successfully.

**Still open:**
- F6: encrypting or masking ID numbers, and an admin audit log.
- Per-account login throttling (F4/F9). Today's limit is per IP only.
- Running containers as non-root, with `npm ci` and healthchecks (F11).
- Cookie `Secure` still depends on `NODE_ENV=production`.

## 7. Test artefacts left behind

The dynamic checks created data in the **local Docker volume only**: a user `audit-user@example.test` and one plan request named "Audit Test" (an earlier attempt failed with the F2 error and stored nothing). Remove it with `docker compose down -v`, which wipes the local database, or leave it in place. Nothing was sent to any external system.
