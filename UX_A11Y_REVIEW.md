# TravelOnBuddy — Browser Test: Accessibility, Functionality, UI/UX

- **Date:** 2026-11-01
- **Build:** local Docker (`localhost:8080` web, `localhost:4000` API), working tree as of today, including the audit fixes and the finder fix
- **Status:** complete. The public site (static and React) and all 8 admin screens are tested. The admin screens were tested signed in as a local test admin.

## What I tested

| Area | Pages | How |
|---|---|---|
| Static public site (`docs/`) | `index`, `why-buddy`, `buddies`, `stories`, `become-a-buddy`, `plan`, `login`, `signup`, `404`, `offline` | Automated checks at 1280px and 375px, keyboard walk-through, real form submissions |
| React copy of the public site (`/admin/#/…`) | home, why-buddy, buddies, stories, become-a-buddy, plan, book-trip, login, signup, 404 | Automated checks plus a full booking submission |
| Admin panel (`/admin/#/admin/…`) | login, change-password, recovery, dashboard, hero photos, applications, plan requests, buddies, stories, users | Automated checks, keyboard and modal behaviour, real create/edit/delete on test records, 375px layout |

The automated checks were self-written in-page scripts covering contrast, labels, names, headings, landmarks, duplicate IDs and target sizes. Loading axe-core from a CDN was blocked in this environment. Every finding below was **confirmed by eye or in code**. Automated hits I couldn't confirm (mostly text over photos) are left out.

**Flows that worked end to end:**
- Signup, then automatic redirect to the plan page
- Wrong-password error
- Login
- Buddy application, ending with reference `TOB-2026-YA9GNRS2`
- Homepage finder, ending with reference `TOB-2026-4ATTAR3V`
- React 4-step booking, ending with reference `TOB-2026-GVJYA2WK1`
- Mobile menu: opens, closes on Escape, and returns focus to the menu button
- No horizontal scrolling on any page at 375px

---

## Priority summary

| # | Severity | Issue | Area | Type |
|---|---|---|---|---|
| 1 | **Critical** | Normal browsing locks everyone on that IP out of login, with a misleading "Can't reach the server" error | API + both frontends | Functional |
| 2 | **High** | No way to log out on the public site, and the page tells users to use a menu that doesn't exist | Static + React | Functional / UX |
| 3 | **High** | Booking travel styles, pace and buddy choice can't be used with a keyboard | React `book-trip` | WCAG 2.1.1 (A) |
| 4 | **High** | Finder inputs show no keyboard focus | Static + React | WCAG 2.4.7 (AA) |
| 5 | **High** | Form errors aren't linked to their fields for screen readers | Static forms | WCAG 1.3.1 / 3.3.1 (A), 4.1.2 |
| 6 | Medium | Stories carousel auto-advances with no pause control and destroys keyboard focus every 7 s | Static `stories` | WCAG 2.2.2 (A), 2.4.3 (A) |
| 7 | Medium | Between 981 and 1180px wide, "Log in" and "Become a buddy" disappear and no menu replaces them | Static + React | UX |
| 8 | Medium | Tabbing into "Where to" opens the suggestion list, and Tab then walks through all 12 cities | Static finder | WCAG 2.1.1 / 2.4.3, UX |
| 9 | Medium | Colour contrast failures in the footer, accent links, step numbers and buttons | Both | WCAG 1.4.3 / 1.4.11 (AA) |
| 10 | Medium | Every React page has the same `<title>` | React | WCAG 2.4.2 (A) |
| 11 | Medium | Story carousel dots are 7×7 px | Static + React | WCAG 2.5.8 (AA) |
| 12 | Low | Heading levels skip (h1→h3, h2→h4) | Both | WCAG 1.3.1 best practice |
| 13 | Low | No skip-to-content link | Both | WCAG 2.4.1 (A), advisory |
| 14 | Low | Misleading auth UI: "Forgot password?" goes to the trip planner; "Keep me signed in" does nothing; "Hotel / company *" looks required for travellers | Static + React | UX |
| 15 | Low | Install-app banner covers a fifth of the phone screen on first visit, over the finder | Static | UX |
| 16 | Low | Mobile menu is marked `aria-modal` but doesn't move or trap focus | Static | WCAG 4.1.2 / 2.4.3 |
| 17 | Low | Focus is lost to `<body>` after failed login and after a successful application | Static | WCAG 2.4.3 |
| 18 | Low | Admin login screens: no `<main>`, generic title, new-password fields lack `autocomplete` | Admin | WCAG 1.3.5, 2.4.2 |
| 19 | Info | Hero headline takes about 2 s to appear on phones; uppercase labels are 10.9–11.8px | Static | UX / performance |
| A1 | **High** | Deleting a buddy or story is instant and permanent: no confirmation, no undo | Admin | Functional / UX |
| A2 | **High** | Application detail dialog: focus doesn't move in, Escape doesn't close it, and it has no accessible name | Admin | WCAG 2.1.2 / 2.4.3 / 4.1.2 |
| A3 | Medium | Buddy and story forms use placeholders instead of labels; the colour picker and the plan-request status selects have no label | Admin | WCAG 1.3.1 / 3.3.2 / 4.1.2 |
| A4 | Medium | Approve/Reject happen in one click with no confirmation or announcement, and an application can't go back to "pending" | Admin | UX, WCAG 4.1.3 |
| A5 | Medium | On phones the sidebar fills the whole first screen and row actions sit off-screen in a 1,073px-wide table | Admin | UX |
| A6 | Low | Icon-only buttons have screen-reader labels but no visible tooltip, and the labels repeat without context ("Approve", "Delete this slide" ×12) | Admin | UX, WCAG 2.4.6 |
| A7 | Low | Orange `#D97706` text on white (dashboard "View", reference codes) is 3.19:1; filter tabs show the active state by colour only, with no `aria-pressed` | Admin | WCAG 1.4.3 / 4.1.2 |

---

## 1. Login lockout from ordinary browsing (Critical, Functional)

**What happens:** after about 20 page views in 15 minutes from one IP, every login attempt fails with **"Can't reach the server. Is it running?"**, even though the server is up. I hit this during testing, and the admin login was blocked for about 10 minutes.

**Why** (`server/src/app.js:36-44`):
1. The strict auth limiter (20 requests per 15 min) is mounted on all of `/api/auth`. That includes `GET /auth/me`, which the React app calls on **every page load**, and `POST /auth/logout`. Anyone browsing the React site uses up the login budget.
2. The limiter runs **before** the CORS middleware, so the 429 response has no `Access-Control-Allow-Origin` header. The browser blocks it, `fetch` rejects, and both frontends show the "Can't reach the server" message instead of "Too many attempts".
3. On a shared IP (an office, a mobile carrier's NAT, or behind a reverse proxy, see audit F9), one busy user locks out everyone.

**Fix:** apply `authLimiter` only to `POST /login`, `/signup` and `/change-password`, and move `cors()` above both limiters so a 429 is readable. Optionally show the server's 429 message in the UI.

## 2. No logout on the public site (High, Functional/UX)

After signing up or logging in, the header still shows **"Log in"**. There's no account indicator and no logout control anywhere on the static site (`docs/js/nav.js`) or the React public site. The only way out is clearing cookies. Visiting `login.html` while signed in says *"Use the menu in the top right to switch accounts"*, and **no such menu exists** (`docs/js/auth.js`, `src/components/AuthForm.jsx:116-119`).

**Fix:** in `nav.js` (and the React header), call `/auth/me` once and swap "Log in" for the user's first name with a small menu containing "Log out", which calls `POST /auth/logout` and reloads. Change the "already signed in" panel to offer **Log out** next to "Plan my trip".

## 3. Booking choices are mouse-only (High, WCAG 2.1.1 Keyboard)

On `/book-trip`, the travel-style pills, the pace cards, and the buddy cards ("Best Match" and each buddy) are `<div onClick>` with no `tabindex`, role, or key handling (`src/pages/BookTrip.jsx:432`, `451`, `505`, `530`). Keyboard and switch users can't change any of them, and screen readers don't announce them as controls or report their selected state. The section headings are `<label>`s with no associated control.

**Fix:** use real controls. Travel styles become `<button type="button" aria-pressed={selected}>` or checkboxes inside a `<fieldset><legend>`. Pace and buddy become radio inputs in a `<fieldset>`. The current visual styles can stay on the wrapper.

## 4. Finder inputs have no focus indicator (High, WCAG 2.4.7)

`.finder__field input, .finder__field select { outline: none; }` (`docs/css/styles.css:529`, `src/App.css:569`) outranks the global `:where(a,button,input,select):focus-visible` ring, because `:where()` adds no specificity. Tabbing through "Where to / Arrive / Depart / Who" shows nothing. The "Find a buddy" button and links do show the ring.

**Fix:** `.finder__field:focus-within { box-shadow: 0 0 0 2px var(--marigold); }`, or drop the `outline: none`.

Related (WCAG 1.4.11): the `.field` focus state on the other forms is a 1px orange border plus a 20%-opacity glow. That probably falls below the 3:1 non-text contrast needed against white. A solid 2px ring would be safer.

## 5. Form errors are invisible to screen readers (High, WCAG 1.3.1 / 3.3.1 / 4.1.2)

On signup, login and "Become a buddy", an empty submit shows a red message under each field (for example `#fullName-msg`) and a summary like "7 fields need fixing". Focus moves to the first bad field, which is good. However:
- Fields never get `aria-invalid="true"`.
- Fields are never linked to their message with `aria-describedby`, so a screen reader landing on "Full name" doesn't hear "We need a name to call you by".
- Required fields show `*` visually but have no `required` or `aria-required`.

**Fix:** in the shared validation code (`docs/js/auth.js`, `docs/js/buddy-form.js`, and the React equivalents), set `aria-invalid` and `aria-describedby="<id>-msg"` when a message is shown and remove them when cleared. Add `aria-required="true"` to required inputs.

## 6. Stories carousel (Medium, WCAG 2.2.2 / 2.4.3)

`docs/js/stories.js:86-104` advances every 7 s. It pauses on mouse hover only: not on keyboard focus, not with a pause button, and not under `prefers-reduced-motion`. Each tick replaces the carousel's `innerHTML`, **including the Prev/Next buttons**. A keyboard user focused on "Next" has their focus thrown to `<body>` when it auto-advances. `renderStories()` also runs twice (static data, then API data) and adds duplicate hover listeners.

**Fix:**
- Add a Pause/Play button.
- Stop autoplay on `focusin` and when reduced motion is set.
- Update only the quote text instead of re-rendering the buttons.
- Bind the listeners once.

## 7. Header links vanish between 981 and 1180px (Medium, UX)

At 1180px and below, `.nav__actions .btn--ghost { display: none }` hides **Become a buddy** and **Log in**. The menu button only appears at 980px and below. A typical 1024px laptop or iPad-landscape user has no header route to log in. The footer has "Become a buddy" but no login link. The same CSS is in `src/App.css:1832-1853`.

**Fix:** show the menu button from 1180px, or keep "Log in" visible as a compact text link.

## 8. "Where to" combobox keyboard behaviour (Medium)

Focusing the input opens the list, and each suggestion is a focusable `<button>`, so Tab steps through all 12 cities before reaching "Arrive". Arrow keys already work. For a combobox, the options should be reachable by arrows only. Tab should close the list and move on.

**Fix:** give the suggestion buttons `tabindex="-1"` (or render `role="option"` items inside `role="listbox"` with `aria-activedescendant`), and close the list on Tab.

## 9. Colour contrast (Medium, WCAG 1.4.3 / 1.4.11)

Measured against the actual computed backgrounds, all below 4.5:1 for normal text or 3:1 for large text:

| Where | Colour | Ratio | Pages |
|---|---|---|---|
| Footer destination links and separators | `#8B7A6B` on footer bg | 4.03:1 | all static pages |
| Footer hours "Mon–Sat, 9am–8pm IST" | `#8B8394` | 3.55:1 | all static pages |
| Accent text: footer tagline, story bylines, "Create an account", "Log in instead" | `#B85C00` (static) / `#B45309` (React) on cream | 4.0–4.49:1 | static + React |
| How-it-works step numbers "01–04" (large) | `#F2921D` / `#F7931A` | 2.16–2.30:1 | why-buddy (both) |
| White text on orange: booking step number, "Customize this Route" | `#fff` on orange | 2.30:1 | React home, book-trip |
| "No Payment Required" pill | `#B45309` on tint | 4.00:1 | React book-trip |
| "Retry Connection" button | `#fff` on orange | 2.36:1 | offline |

**Fix:** darken the two accent tokens by about 10% (for example `#B85C00` → `#A35200`) and the footer greys to about `#6F6155`. For white-on-orange, use dark text (`var(--ink)`), as the main "Plan my trip" button already does. Text over the hero photos looked readable thanks to the dark scrim, so I didn't flag it.

## 10. Same page title on every React route (Medium, WCAG 2.4.2)

Every hash route, including `/admin/…`, keeps the title "TravelOnBuddy — Travel Together, Travel Better", and nothing calls `document.title`. Screen-reader users and anyone with several tabs open can't tell pages apart. The static site has correct per-page titles.

**Fix:** a small `useTitle("Stories — TravelOnBuddy")` hook per page or route.

## 11–19. Lower-priority items

- **11. Small targets (2.5.8):** carousel dots are 7×7 px (22×7 when active). Add padding to make each at least 24×24 hit area while keeping the dot visual.
- **12. Heading order:**
  - why-buddy, buddies and plan jump h1→h3.
  - The footer "Explore / Company" headings are h4 directly after h2 sections on every page, and h4 after h1 on login and signup.
  - The React home has an h2→h4 jump.
  - Fix by using h2/h3 in order, or styling a `<p>` for footer column labels.
- **13. Skip link:** no "Skip to content" link on any page. Landmarks (`<main>`, `<nav>`) exist except on `offline.html`, so this is advisory, but it's cheap: one `<a class="skip" href="#main">` in `nav.js`.
- **14. Misleading auth controls:**
  - "Forgot password?" links to `plan.html`. The audit fixes added an operator reset, so say "Contact us to reset your password", or remove it.
  - "Keep me signed in" is ignored by the server (sessions are always 7 days).
  - On signup, "Hotel / company *" shows with an asterisk while "Traveller" is selected, though it's only required for clients. Hide or disable it unless "Client" is chosen.
- **15. Install banner:** "TravelOnBuddy App — Install" slides up on the first visit on phones and covers the bottom ~20% of the screen, including the finder's "Who" field and search button. Show it after engagement (second visit or a completed action) instead.
- **16. Mobile menu semantics:** the drawer has `role="dialog" aria-modal="true"`, but focus stays on the toggle and the page behind remains tabbable. Either move focus to the first link and trap Tab inside, or (simpler, since it's a dropdown) remove `role="dialog"`/`aria-modal` and keep it as a disclosure. Escape-to-close and returning focus to the toggle already work.
- **17. Focus after async results:**
  - After a wrong password, focus ends on `<body>`. The error has `role="alert"`, so it is announced, but keyboard users must start over from the top.
  - After a successful buddy application the form is replaced and focus also lands on `<body>`. Move focus to the success heading (`tabindex="-1"`).
- **18. Admin login screens:** labels are correct and the sign-in fields have the right `autocomplete`. However:
  - The page has no `<main>`.
  - The title is the generic public one.
  - The change-password fields have no `autocomplete="current-password"` / `"new-password"`, so password managers won't offer to generate or save the new password.
- **19. Perceived performance and readability:**
  - On a 375px screen the hero headline stays blank for about 2 seconds while the reveal animation runs. Consider showing above-the-fold text without the fade.
  - Eyebrow and finder labels are 10.9–11.8px uppercase. That's legal, but small for older readers; 12.5–13px would help.

---

## 20. What's working well

- `lang`, unique per-page titles, `<main>`/`<nav>` landmarks and alt text are in place across the static site, and decorative images use `alt=""`.
- Focus ring (`:focus-visible`, 2px marigold) on links and buttons. Tested with real Tab presses.
- The forms move focus to the first invalid field and show a count of errors. Success panels use `role="status"`, and error summaries use `role="alert"`.
- `prefers-reduced-motion` is respected by the hero slideshow and reveal animations.
- The mobile menu has `aria-expanded`, a label that switches between "Open menu" and "Close menu", Escape to close, and focus return.
- No horizontal scroll at 375px on any page. The finder and its new contact step stack cleanly.
- The React public site escapes all content (JSX), and the static site now does too.

## 21. Admin panel

**What worked:**
- The logged-out redirect to login.
- Dashboard counts and their links.
- Hero photo upload: a generated PNG showed up with a "New photo added" toast. Deleting it asked for confirmation and removed the file from the server.
- Move left/right buttons as a keyboard alternative to drag-reorder.
- Approving an application.
- Changing a plan-request status, which persisted after a reload.
- Buddy create, edit and delete. Edit loads the row into the top form and focuses "Name".
- Story create and delete.
- The users list.
- Sign out: it ends the session and returns to login.

I also checked the escaping fix with live data. A story containing `<b>` and an `<img onerror>` payload rendered as plain text on `stories.html`, and no script ran.

### A1. Buddies and stories delete without confirmation (High)

The Delete button on `/admin/buddies` and `/admin/stories` calls the API immediately (`BuddiesAdmin.jsx:60`, `StoriesAdmin.jsx:60`). One mis-click permanently removes public content, and there's no undo. Hero photos already ask *"Are you sure you want to delete this slide…"* (`HeroAdmin.jsx:187`), so the panel is inconsistent. **Fix:** use the same confirmation, naming the item ("Delete buddy Ananya R.?"), or a toast with Undo.

### A2. Application detail dialog (High, WCAG 2.1.2 / 2.4.3 / 4.1.2)

`Applications.jsx:23`: `<div role="dialog" aria-modal="true" onClick={onClose}>`.
- When it opens, focus stays on the "View details" button behind the overlay, so screen readers announce nothing.
- **Escape doesn't close it.** The only ways out are the Close button or clicking the backdrop.
- It has no `aria-labelledby`, so it's announced as an unnamed dialog.
- It doesn't trap focus, so Tab moves into the page behind it.

**Fix:**
1. Move focus to the dialog heading or Close button on open.
2. Close on Escape.
3. Point `aria-labelledby` at the applicant-name heading.
4. Return focus to the "View details" button on close. That already happens by accident, because focus never left it.

Alternatively, use the native `<dialog>` element with `showModal()`, which provides most of this.

### A3. Unlabelled admin inputs (Medium, WCAG 1.3.1 / 3.3.2 / 4.1.2)

- The **buddy** form (`BuddiesAdmin.jsx:73-87`) uses Name, City, Years, Rating, Languages and a colour picker. The **story** form (`StoriesAdmin.jsx:73-75`) uses Traveller name, Trip and Quote. Both use `placeholder` only. Once you type, the hint disappears, and screen readers may not announce a name.
- The colour input has only a `title`.
- Each row's status `<select>` on **Plan requests** (`PlanRequests.jsx:112`) has no label, so it's announced as "combo box, Pending" with no indication of which request it belongs to.

**Fix:**
- Visible `<label>`s on the forms, or at minimum `aria-label`.
- `aria-label="Avatar colour"` on the colour picker.
- `aria-label={`Status for ${r.id}`}` on each status select.

### A4. Status changes (Medium)

- **Approve and Reject** apply on one click, with no confirmation, toast or live-region announcement. The status cell changes silently.
- Both buttons stay visible whatever the status, so "Approve" shows on an already-approved row.
- There's no way back to "pending" from the UI, although the API allows it.
- **Plan-request** status selects save on change with no feedback either.

**Fix:**
- Show a short toast in a `role="status"` region, as Hero already does.
- Hide or disable the action matching the current status.
- Offer "Move back to pending".

### A5. Admin on phones (Medium)

At 375px the sidebar stacks above the content and fills the first ~460px. The signed-in email and "Sign out" sit oddly beside the nav list, and the page heading starts below the fold. The applications table is 1,073px wide inside a horizontal scroller, so Approve and Reject are off-screen to the right. **Fix:**
- Collapse the sidebar into a top bar with a menu button below about 768px.
- Switch the tables to stacked cards on narrow screens, or pin the actions column.

### A6–A7. Smaller items

- **A6.** The icon-only row buttons (eye, check, cross, pencil, bin) have `aria-label`s but no visible tooltip, so sighted users have to guess. Add `title` or a visible text label. The labels also repeat without context: twelve "Delete this slide" buttons and one "Approve" per row. Include the item, for example `aria-label="Approve UX Test Applicant"` and "Delete slide 3".
- **A7.**
  - The orange `#D97706` used for the dashboard "View →" links and the reference codes in Plan requests is 3.19:1 on white. Use the darker accent from section 9.
  - The status filter tabs (All, Pending, Approved, Rejected) show the active tab by colour only. Add `aria-pressed` or `aria-current`.
  - All admin routes share the generic page title (see section 10).
- **Good:**
  - Every admin table has proper `<th>` headers.
  - Hero images have alt text ("Hero slide #1").
  - The upload input is labelled "Upload new hero photo".
  - Uploads accept only JPEG, PNG and WEBP.
  - The upload result is announced via `role="status"`.

## Fix status (updated 2026-11-01)

The critical and high-priority items are fixed and were checked in the browser on the rebuilt Docker stack:

| # | Change | Verified |
|---|---|---|
| 1 | `server/src/app.js`: CORS now runs before the rate limiters. The strict limit covers only `/auth/login`, `/auth/signup` and `/auth/change-password`, and counts failed attempts only. | 30× `/auth/me` still returns 200. The 21st failed login returns 429 *with* CORS headers, so the real message reaches the page. `/auth/me` keeps working during a lockout. |
| 2 | "Log out" replaces "Log in" in the header and mobile menu once signed in: `docs/js/nav.js`, `src/App.jsx`. The "already signed in" panel offers Log out and no longer mentions a menu that doesn't exist. "Log in"/"Log out" now also stays visible between 981 and 1180px (partly fixes #7). | Both sites: signed in → header shows "Log out" → click → session ends and the header shows "Log in" again |
| 3 | Booking travel styles, pace and buddy cards are now `<button aria-pressed>` inside labelled groups (`src/pages/BookTrip.jsx`) | Tab reaches each choice with a visible ring, Space toggles it, and `aria-pressed` updates. Same visual design. |
| 4 | Finder fields show a 2px ring while focused (`.finder__field:focus-within`, both stylesheets) | Ring confirmed on Where, Arrive, Depart and Who |
| 5 | Static forms: every field is linked to its hint/error line via `aria-describedby`, starred fields get `aria-required`, and errors set or clear `aria-invalid` (`docs/js/util.js`, `auth.js`, `buddy-form.js`). The React forms already did this. | Empty login submit → email has `aria-invalid="true"` and is described by "Email is required." Typing clears it. |
| A1 | Buddy and story Delete ask *"Delete buddy Ananya R.? … can't be undone."* first | Cancel keeps the row; OK deletes it |
| A2 | Application detail dialog: focus moves to Close on open, Tab is trapped inside, Escape closes, focus returns to "View details", and the dialog is named after the applicant | Checked with real Enter, Tab and Escape key presses |

Everything else in the summary table is still open.

## Test data created

All of it is in the local Docker database only:

| Type | Records |
|---|---|
| Users | `ux-tester@example.test`, and the test admin `ux-admin@example.test` (password in the gitignored `test-admin.local`) |
| Buddy applications | `TOB-2026-YA9GNRS2` ("UX Test Applicant", now *approved*) |
| Plan requests | `TOB-2026-4ATTAR3V` ("Finder Test", now *contacted*), `TOB-2026-GVJYA2WK1` (React booking) |

The test buddy, test story and test hero photo were deleted after testing.

The earlier audit's test records are also still there. `docker compose down -v` wipes all of it, along with everything else in the local database.
