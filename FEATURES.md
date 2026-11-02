# Varanasi Trip Companion — Features

Everything the product does today, grouped by who uses it. Three apps work together:

| App | Folder | Address (local) | Used by |
|---|---|---|---|
| Public website (Next.js) | `web/` | `:3100` | Travellers, buddy applicants, readers |
| Admin panel (React) | `src/` | `:8080/admin/` | Staff, editors, blog authors |
| API (Express + SQLite) | `server/` | `:4000/api` | Both of the above |

---

## 1. Public website

### Destination content
- **Places** — ghats, temples, Sarnath and more, grouped into categories, each with its own page.
- **Things to do** — activities with timings, tips and a "Get local help" link that opens a pre-filled request.
- **Experiences** — bookable experiences (sunrise boat, Aarti from a boat, food walk, Kashi Vishwanath with a guide, Sarnath half day, Madanpura weavers, ghat heritage walk) with what's included, meeting point and cancellation summary.
- **Festivals**, **Food**, **Markets**, **Shopping** and a combined **Food & shopping** hub.
- **Explore** — long-form articles on history, faith, culture and modern Varanasi.
- **Travel guide** — practical guides (getting there, safety, etiquette, money, timing).
- **Services** — local transport, guides & tours, river experiences, accommodation referrals and travel assistance, each with sub-services and a "Request this service" button.
- **About** — how we verify, service standards, partner with us, complaints, contact, photo credits.

### Honest content status
- Every content page has a review status. Pages not yet fact-checked show a notice, are hidden from search engines (`noindex`) and are left out of the sitemap.
- **Partner badges** show a partner's real verification status and never claim "verified" unless it is.
- Photos carry alt text and credits; a photo-credits page lists them all.

### Trip planning
- **Trip planner** — choose days, pace (relaxed / balanced / full), walking level, budget, and whether seniors or children are travelling; get a day-by-day plan split into dawn, morning, midday, afternoon and evening.
- **Edit the plan** — reorder items, move them between days, remove or add activities.
- **Ready-made itineraries** (one day, two days and more), each with **Customise this plan** to open it in the planner.
- **My trips** — save plans in the browser (no account needed); they sync across tabs.
- **Share a trip** — a link that contains the whole plan, which anyone can open.
- **Send my plan to the team** — attaches the plan text to an enquiry.

### Enquiries and booking
- **One enquiry form** for trip help, a service, an experience, partnering, complaints or anything else. It's pre-filled from the page you came from ("About: Sunrise boat ride"), shows date and traveller fields only when relevant, and asks for consent with a privacy link.
- **Instant reference code** (e.g. `TOB-2026-…`) and a thank-you page.
- **Duplicate protection** — a double-click or resend within 10 minutes doesn't create a second request.
- **My booking request page** — a private link that lets the traveller:
  - see their request's status (new → contacted → partner assigned → confirmed → completed);
  - see the quote: price, inclusions, exclusions and who provides it;
  - **accept or decline the quote** (accepting is not yet a booking — the page shows **Confirmed** once the partner confirms);
  - ask for a fresh link by reference code and email or phone if they lost theirs.
- **Next-step band** ("Ready to plan?") at the end of every content page and hub, with **Plan my trip** and **Get local help**.
- Consistent call-to-action labels across the site: *Plan my trip*, *Get local help*, *Request this experience*, *Request this service*, *Request a local guide*.

### Live information
- **Today in Varanasi** — live travel alerts (river closures, crowds, weather, events) published from the admin panel.
- **Alert strip** at the top of the site for urgent alerts. It never shows "all clear" when the alert service can't be reached.
- **Emergency contacts** page.

### Search
- Site-wide search across all content. Title matches rank above summary matches, and the query sits in the URL so results can be shared.

### Blog
- Articles with categories, tags, cover images (with alt text and credit) and reading time.
- **Author pages** with photo, bio, expertise and links.
- **Share buttons** with social icons: WhatsApp, Facebook, X, LinkedIn, email, copy link, and the phone's own share sheet where available.
- **RSS feed** at `/blog/feed.xml`.
- Category, tag and author archives.
- Private **preview links** for drafts (not indexed).
- New and archived posts show up within about a minute, or instantly when the site's refresh secret is set.

### Buddies (local guides)
- **Become a buddy** application: personal details, area knowledge, languages, experience, specialities, availability, group sizes, vehicle, first aid, ID type with **only the last 4 characters** of the number, one or two references, and two short written answers. Applicants must be 18 or older.
- **Buddy verification page** (private link, sent after shortlisting): upload photo ID, a recent photo, a police verification certificate and an optional guide licence; add the public name and introduction, home area, emergency contact and availability; agree to consent and the code of conduct; send for checking.

### Legal
- **Privacy policy**, **Terms of use** and **Cancellation & refund policy**, written for how the service actually works: quotes, private links, partners, encrypted buddy documents, browser storage and usage counts.
- They show a "Draft" banner and stay out of search until the business details are filled in.

### SEO and quality
- Sitemap (blog posts are added automatically) and `robots.txt` that keep private pages out of search.
- Canonical URLs, social sharing cards and structured data for the organisation.
- Redirects from the retired old site's `.html` addresses to their new pages.
- Pages work at phone width; forms have accessible error summaries and labels.
- First-party **usage counts** only (page viewed, itinerary generated, quote responded…) — no names, contact details, IP addresses or third-party trackers.
- Installable web app manifest.

---

## 2. Admin panel

### Roles
| Role | Can use |
|---|---|
| **Admin** | Everything |
| **Editor** | Blog: review, fact-check, approve, publish |
| **Author** | Blog: write and submit their own articles, edit their author profile |

The API enforces the same rules on every request.

### Needs action dashboard
- One list of what needs doing now: new enquiries past their response time, partner confirmations due, quotes waiting, buddy documents to review, blog posts to review, and similar. Each item links straight to the screen that resolves it.
- Headline figures for the business at a glance.

### Leads (enquiries and bookings)
- All enquiries with filters by status, type and search.
- **Pipeline**: new → contacted → partner assigned → confirmed → completed, or cancelled / lost.
- **Rules that prevent mistakes**: you can't mark a lead confirmed until a partner is assigned and has accepted, a quote is recorded and the customer has accepted it.
- **Quotes** are saved as fixed snapshots (amount, inclusions, exclusions, partner) and never overwritten.
- **Lost reasons** from a set list (configurable), and **reopening needs a reason**.
- **Response-time targets (SLA)**: first contact on time (S1) and partner confirmation within 2 hours, or 30 minutes for same-day requests (S2). Overdue leads are flagged.
- **Customer booking link** — create, resend or switch off the private "My booking request" link.
- Full history of every change.

### Travel alerts
- Post alerts with a severity and start and end times for the public site's *Today in Varanasi* page and alert strip; they drop off when they end, or can be deleted.

### Buddy applications and verification
- **Buddy Applications** (under *People*): review applications from the *Become a buddy* page and shortlist them.
- **Request documents** sends the applicant a private 14-day link.
- **Open each document** (decrypted on the fly) and **Accept** or **Reject** it with a note. The file is deleted either way; only the record of the check is kept.
- Record **reference calls** and the **interview** (passed or failed, with notes).
- **Approve** stays disabled until every required document and check has passed.

### Blog workflow
- **Rich text editor** (TipTap): headings, lists, links, quotes, images from the library with alt text and credit, and **"verify" markers** on facts that need checking.
- **States**: draft → submitted → in review → fact check → verified → approved → published, or scheduled for a future time.
- **Safeguards**:
  - an approval only counts for the exact text that was approved, so any later edit needs fresh approval;
  - the approver must not have written or edited that revision;
  - facts must have been verified within the last 180 days (configurable).
- **Revisions** with history, **scheduled publishing**, **preview links**, archive and restore.
- **Author profiles**: photo, bio, expertise, links and a public page address (slug). Changing the slug is admin-only, and the old address keeps working.

### Users
- List users and change their roles. Admin accounts can't be created or promoted by signing up; passwords are reset from the server (`npm run reset-password`).

### Older screens
- Hero photos, buddies, stories and plan requests belonged to the retired first site and are kept under an **Old site** menu group.

### Everywhere in the admin
- Grouped, sticky sidebar menu, user menu, confirmation dialogs for destructive actions, and an **audit log** of important actions.

---

## 3. API and behind the scenes

### Security
- Sign-in cookie that scripts can't read, sent only to this site (`SameSite=Lax`) and over HTTPS only in production. Sessions expire, and every session is signed out after a password change.
- Only the site's own addresses may call the API, and form bodies must be JSON — together these block cross-site form attacks.
- Rate limits: general traffic, sign-in attempts, enquiries, booking pages, link requests and buddy verification each have their own limit.
- Security headers on every response (Helmet); the admin can't be embedded in other sites.
- Every input is validated and length-limited. Errors never reveal internals.
- **Private links** (booking and buddy verification): a 256-bit secret kept in the part of the URL after `#`, which browsers don't send to servers, so it stays out of logs. Only its hash is stored; links expire and can be switched off.
- **Buddy documents**: file type checked from the actual bytes, AES-256-GCM encryption, uploads refused if no encryption key is set, deleted after review or after 30 days unreviewed.
- **ID numbers**: only the last 4 characters are stored; older full numbers are masked automatically.
- Startup warnings if production settings are missing.

### Notifications
- Email (SMTP) and WhatsApp alerts to the team for new enquiries, applications and customer quote responses.
- Customer and buddy emails carrying their private links.
- A log of every message: what was sent, when, and whether it was delivered.

### Data
- SQLite database with automatic migrations.
- Reference codes for enquiries and applications.
- Background jobs: response-time (SLA) checks, scheduled blog publishing, and clean-up of unreviewed documents.
- Tells the public site to refresh blog pages as soon as something is published.

---

## 4. Deployment

- **Docker Compose** runs the API, the admin panel (nginx) and the public site; data, uploads and encrypted documents live in volumes.
- Production settings come from `.env` (`NODE_ENV`, allowed origins, public URLs, proxy hops, secrets, encryption key) — see `server/.env.example`.
- The admin container serves only `/admin/` and sends every other address to the public site.
- [DEPLOY.md](DEPLOY.md) covers going live, the launch checklist and day-to-day tasks.

## Not built yet

- Online payments (payment terms are set out in each quote).
- Traveller accounts on the new site (bookings use private links instead).
- Automated test suite in the repo (regression scripts were run during development but live outside the project).
