# Ikram Frontend — Security & Defect Tracker

33 Verified Findings. Top-down execution.
One repro -> one prompt -> one diff -> one commit.

---

## PHASE 0 — Operational Trap (Do First)

### [ ] F-28 Production fallback to localhost in api.ts
**File:** `lib/api.ts`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-28: lib/api.ts falls back to http://localhost:5000/api in production.
FILE: lib/api.ts

STEP 0 — REPRODUCE:
Run: grep -n "localhost:5000" lib/api.ts
Expect: fallback string `|| 'http://localhost:5000/api'` without checking NODE_ENV.

STEP 1 — FIX:
In lib/api.ts, ensure that if process.env.NODE_ENV === 'production' and process.env.NEXT_PUBLIC_API_URL is undefined, it throws a loud error on import rather than silently targeting localhost. In development, allow the localhost fallback.

STEP 2 — CONFIRM:
- Verify that in production without NEXT_PUBLIC_API_URL, importing the module throws an error.
- Run: bash scripts/gate.sh F-28 — must output GATE PASSED.
```

---

## PHASE 1 — Launch & Build Blockers (P0)

### [ ] F-01 Standalone Docker build failure
**File:** `next.config.js`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-01: Dockerfile copies .next/standalone, but standalone output is not configured.
FILE: next.config.js

STEP 0 — REPRODUCE:
Run: grep -n "output: 'standalone'" next.config.js
Expect: no match (exit 1).

STEP 1 — FIX:
Add `output: 'standalone'` to nextConfig in next.config.js.

STEP 2 — CONFIRM:
- Run: grep -n "output: 'standalone'" next.config.js (must match).
- Run: bash scripts/gate.sh F-01 (must output GATE PASSED and generate .next/standalone).
```

### [ ] F-02 Vehicle registration calls 404 endpoint
**File:** `app/vehicles/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-02: app/vehicles/page.tsx calls unmounted endpoint /users (returns 404).
FILE: app/vehicles/page.tsx

STEP 0 — REPRODUCE:
Run: grep -n "api\.get('/users')" app/vehicles/page.tsx
Expect: match at line 38.

STEP 1 — FIX:
In app/vehicles/page.tsx, replace `api.get('/users')` with `api.get('/auth/users?role=Customer')`. The backend route /api/auth/users is mounted and returns `{ users }`.

STEP 2 — CONFIRM:
- Run: grep -n "api\.get('/users')" app/vehicles/page.tsx (must NOT match).
- Run: grep -n "api\.get('/auth/users?role=Customer')" app/vehicles/page.tsx (must match).
- Run: bash scripts/gate.sh F-02 — must output GATE PASSED.
```

### [ ] F-03 SuperAdmin appointment creation DB crash
**File:** `app/appointments/new/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-03: SuperAdmin appointment creation omits workshopId, crashing with NOT NULL violation.
FILE: app/appointments/new/page.tsx

STEP 0 — REPRODUCE:
Inspect app/appointments/new/page.tsx handleSubmit. Observe that createAppt.mutate sends customerId, vehicleId, scheduledDate, startTime, endTime, but never workshopId. For SuperAdmins (workshop_id is null in JWT), backend throws PostgreSQL error 23502.

STEP 1 — FIX:
- If user.role === 'SuperAdmin', fetch workshops from `GET /workshops` and display a required workshop select dropdown.
- Include workshopId in the payload sent to POST /appointments.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-03 — must output GATE PASSED.
```

### [ ] F-04 Cancel button executes hard SQL DELETE
**File:** `app/appointments/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-04: Appointment list-view Cancel button calls DELETE /appointments/:id, purging database row.
FILE: app/appointments/page.tsx

STEP 0 — REPRODUCE:
Run: grep -n "deleteAppt\.mutate(appt\.id)" app/appointments/page.tsx
Expect: match at line ~186 under the Cancel button.

STEP 1 — FIX:
Change the Cancel button onClick handler to call `updateStatus.mutate({ id: appt.id, status: 'cancelled' })` so it issues a PATCH /status instead of permanently purging the database row.

STEP 2 — CONFIRM:
- Run: grep -n "deleteAppt\.mutate(appt\.id)" app/appointments/page.tsx (must NOT match).
- Run: grep -n "updateStatus\.mutate({ id: appt\.id, status: 'cancelled' })" app/appointments/page.tsx (must match).
- Run: bash scripts/gate.sh F-04 — must output GATE PASSED.
```

### [ ] F-05 Footer links to non-existent /services and /track
**File:** `components/Footer.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-05: Footer links to non-existent /services and /track pages (HTTP 404).
FILE: components/Footer.tsx

STEP 0 — REPRODUCE:
Run: grep -E "href: '/services'|href: '/track'" components/Footer.tsx
Expect: two matches pointing to routes that do not exist.

STEP 1 — FIX:
In components/Footer.tsx:
- Change `{ label: 'Services', href: '/services' }` to point to `href: '/pricing'`
- Change `{ label: 'Track Job', href: '/track' }` to point to `href: '/portal'`

STEP 2 — CONFIRM:
- Run: grep -E "href: '/services'|href: '/track'" components/Footer.tsx (must NOT match).
- Run: bash scripts/gate.sh F-05 — must output GATE PASSED.
```

---

## PHASE 2 — Business Logic, Money & Identity (P1)

### [ ] F-06 Wire service template selection into public booking
**File:** `app/book/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-06: /book omits serviceTemplateId; percentage-deposit workshops crash with HTTP 400.
FILE: app/book/page.tsx

STEP 0 — REPRODUCE:
Check app/book/page.tsx: observe serviceNeeded is just a free-text title input. It never queries `/services/public/:workshopId` or sends serviceTemplateId.

STEP 1 — FIX:
In app/book/page.tsx:
- When a workshop is selected, query `GET /services/public/:workshopId` to load available service templates.
- Add a dropdown to select a service template, binding `serviceTemplateId`.
- Pass `serviceTemplateId` to the `bookAppt.mutate` payload.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-06 — must output GATE PASSED.
```

### [ ] F-07 Phone normalizer corrupts international numbers
**File:** `lib/phone.ts`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-07: normalizePhone forces +251 onto all international numbers.
FILE: lib/phone.ts

STEP 0 — REPRODUCE:
Inspect lib/phone.ts: numbers not starting with +251 or 0 get unconditionally prepended with '+251'. Input `+14155552671` turns into `+251141555526`.

STEP 1 — FIX:
Update `normalizePhone` in lib/phone.ts:
- If a number already starts with `+` and is valid E.164 (10 to 15 digits), preserve it without forcing `+251`.
- If the number starts with `0` or `9` or `7`, normalize it as an Ethiopian number to `+251...`.

STEP 2 — CONFIRM:
- Test: `normalizePhone('+14155552671')` must return `'+14155552671'`.
- Test: `normalizePhone('0911234567')` must return `'+251911234567'`.
- Run: bash scripts/gate.sh F-07 — must output GATE PASSED.
```

### [ ] F-08 SuperAdmin transfer approval lockout
**File:** `app/transfers/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-08: SuperAdmin cannot approve inventory transfers because user.workshop_id is null.
FILE: app/transfers/page.tsx

STEP 0 — REPRODUCE:
Run: grep -n "incoming =" app/transfers/page.tsx
Expect: `const incoming = transfer.to_workshop_id === user.workshop_id;`. For SuperAdmin, this is always false.

STEP 1 — FIX:
Update the check in app/transfers/page.tsx so that a SuperAdmin is granted full permissions to approve and complete any transfer:
`const incoming = user.role === 'SuperAdmin' || transfer.to_workshop_id === user.workshop_id;`
and allow SuperAdmin to see action buttons regardless of workshop_id.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-08 — must output GATE PASSED.
```

### [ ] F-09 CSV export duplicates single job card counts
**File:** `app/before-after/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-09: CSV export uses beforeMedia.length and afterMedia.length from current selected card across all rows.
FILE: app/before-after/page.tsx

STEP 0 — REPRODUCE:
Check `exportData` in app/before-after/page.tsx lines 55-66. In `jobCards?.forEach`, it outputs `beforeMedia.length.toString()` and `afterMedia.length.toString()`. Every row gets identical counts.

STEP 1 — FIX:
In `exportData`, do not use the single selected card's media counts for unrelated job cards. If multi-card media is not loaded, export vehicle and customer info without false replicated counts, or indicate current selection only.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-09 — must output GATE PASSED.
```

### [ ] F-10 Allow parts-only invoices
**File:** `app/job-cards/[id]/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-10: Invoices with 0 labor and 0 tax are blocked from generation.
FILE: app/job-cards/[id]/page.tsx

STEP 0 — REPRODUCE:
Run: grep -n "disabled={generateInvoice.isPending" app/job-cards/[id]/page.tsx
Expect disabled check: `(!parseFloat(laborCost) && !parseFloat(taxRate) && !invoiceNotes)`. If a job card has parts and 0 labor, button is disabled.

STEP 1 — FIX:
Allow invoice generation if `partsUsedData?.partsUsed?.length > 0` even when labor cost and tax rate are 0.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-10 — must output GATE PASSED.
```

### [ ] F-11 Email notification fallback to phone
**File:** `app/job-cards/[id]/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-11: Email notifications fallback to customer phone if email is missing.
FILE: app/job-cards/[id]/page.tsx

STEP 0 — REPRODUCE:
Run: grep -n "jobCard.customer_email || jobCard.customer_phone" app/job-cards/[id]/page.tsx
Expect: email recipient falling back to raw phone string.

STEP 1 — FIX:
When notifType === 'email', require a valid customer_email. If customer_email is empty, display a warning or disable email dispatch rather than passing a phone number to email transport.

STEP 2 — CONFIRM:
- Run: grep -n "notifType === 'sms' ? jobCard.customer_phone : (jobCard.customer_email || jobCard.customer_phone)" app/job-cards/[id]/page.tsx (must NOT match).
- Run: bash scripts/gate.sh F-11 — must output GATE PASSED.
```

### [ ] F-12 Customer invoice back navigation 403
**File:** `app/invoices/[id]/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-12: Customer clicking Back to Invoices hits forbidden /invoices screen.
FILE: app/invoices/[id]/page.tsx

STEP 0 — REPRODUCE:
Inspect app/invoices/[id]/page.tsx line 132: button routes unconditionally to `/invoices`. But app/invoices/page.tsx line 32 blocks Customers with 403.

STEP 1 — FIX:
In app/invoices/[id]/page.tsx, if user?.role === 'Customer', clicking the back button must navigate to `/portal` instead of `/invoices`.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-12 — must output GATE PASSED.
```

### [ ] F-13 Phone-only password reset UI
**Files:** `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-13: Phone-only registered accounts have no password reset UI.
FILES: app/forgot-password/page.tsx, app/reset-password/page.tsx

STEP 0 — REPRODUCE:
Inspect app/forgot-password/page.tsx: accepts only email and calls /auth/forgot-password. Users who registered with only phone cannot reset.

STEP 1 — FIX:
Add a tab or toggle in app/forgot-password/page.tsx allowing reset via Phone Number:
- Submit phone to `POST /api/auth/forgot-password-phone`.
- On success, redirect to an OTP verification screen that calls `POST /api/auth/reset-password-phone` with `{ phone, otp, password }`.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-13 — must output GATE PASSED.
```

### [ ] F-14 Standardize currency symbols to ETB
**Files:** `app/invoices/[id]/page.tsx`, `app/invoices/page.tsx`, `app/inventory/page.tsx`, `app/job-cards/[id]/page.tsx`, `app/dashboard/page.tsx`, `app/reports/page.tsx`, `app/portal/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-14: Inconsistent currency display (USD $ vs ETB).
FILES: app/invoices/[id]/page.tsx, app/invoices/page.tsx, app/inventory/page.tsx, app/job-cards/[id]/page.tsx, app/dashboard/page.tsx, app/reports/page.tsx, app/portal/page.tsx

STEP 0 — REPRODUCE:
Search for `$` prefix in table headers and invoice totals. Backend Chapa gateway and database charge in ETB.

STEP 1 — FIX:
Replace all hardcoded `$` currency symbols in invoice tables, parts prices, dashboard totals, and report stats with `ETB`.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-14 — must output GATE PASSED.
```

---

## PHASE 3 — Visual, Layout & Responsive (P2)

### [ ] F-15 Mobile hamburger button collides with page headers
**File:** `components/Navbar.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-15: Fixed hamburger button at top-4 left-4 overlaps page back buttons and titles on mobile.
FILE: components/Navbar.tsx

STEP 0 — REPRODUCE:
Check components/Navbar.tsx line 216: button is `fixed top-4 left-4 z-40`. Page containers in app/*/page.tsx have `px-4 py-8`. The hamburger sits on top of the first 24px of content.

STEP 1 — FIX:
Ensure main page wrappers have appropriate top padding (`pt-16 lg:pt-8`) so the fixed hamburger never covers text or back buttons.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-15 — must output GATE PASSED.
```

### [ ] F-16 Homepage white-on-white text in dark mode
**File:** `app/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-16: Homepage container is hardcoded bg-white while text uses dark:text-white.
FILE: app/page.tsx

STEP 0 — REPRODUCE:
Run: grep -n "min-h-screen bg-white" app/page.tsx
Expect: line 79 has `bg-white` with no dark variant, but lines 126 and 144 have `dark:text-white`.

STEP 1 — FIX:
Change `<div className="min-h-screen bg-white">` to `<div className="min-h-screen bg-white dark:bg-slate-900">` and ensure all cards and text on the landing page have contrasting dark mode background pairs.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-16 — must output GATE PASSED.
```

### [ ] F-17 Portal stat cards literal string interpolation
**File:** `app/portal/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-17: app/portal/page.tsx renders literal "{stat.color}" in DOM.
FILE: app/portal/page.tsx

STEP 0 — REPRODUCE:
Run: grep -n "{stat.color}" app/portal/page.tsx
Expect: matches at lines 208 and 211 where string literals were used instead of template literals.

STEP 1 — FIX:
Change className strings to template literals with backticks so `${stat.color}` and `${stat.textColor}` interpolate correctly.

STEP 2 — CONFIRM:
- Run: grep -n '"{stat.color}"' app/portal/page.tsx (must NOT match).
- Run: bash scripts/gate.sh F-17 — must output GATE PASSED.
```

### [ ] F-18 Pricing badges missing gradient utility
**File:** `app/pricing/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-18: Category badges on /pricing interpolate color stops without bg-gradient-to-r.
FILE: app/pricing/page.tsx

STEP 0 — REPRODUCE:
Run: grep -n "rounded-lg \${gradient}" app/pricing/page.tsx
Expect: match at line ~175 lacking `bg-gradient-to-r`.

STEP 1 — FIX:
Add `bg-gradient-to-r` to the category badge className in app/pricing/page.tsx:
`className={\`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-lg bg-gradient-to-r \${gradient} opacity-90\`}`

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-18 — must output GATE PASSED.
```

### [ ] F-19 Search inputs only filter current paginated slice
**Files:** `app/inventory/page.tsx`, `app/vehicles/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-19: Inventory and vehicles search only filters local 20-item page slice.
FILES: app/inventory/page.tsx, app/vehicles/page.tsx

STEP 0 — REPRODUCE:
Check app/inventory/page.tsx line 75 and app/vehicles/page.tsx line 113. Both filter `parts?.filter` and `vehicles?.filter` client-side from the paginated query.

STEP 1 — FIX:
- In app/inventory/page.tsx, if search is non-empty, query `GET /parts/search?q=${search}`.
- In app/vehicles/page.tsx, if search is non-empty, query `GET /vehicles/search?q=${search}`.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-19 — must output GATE PASSED.
```

### [ ] F-20 Navbar double active highlighting
**File:** `components/Navbar.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-20: Visiting /dashboard/team highlights both Dashboard and Team.
FILE: components/Navbar.tsx

STEP 0 — REPRODUCE:
Check line 82: `pathname === item.href || pathname?.startsWith(item.href + '/')`. Because /dashboard/team starts with /dashboard/, both links match.

STEP 1 — FIX:
For item.href === '/dashboard', require an exact match (`pathname === '/dashboard'`). Only allow prefix matching for sub-resource pages (e.g., `/job-cards/123`).

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-20 — must output GATE PASSED.
```

### [ ] F-21 Customer appointments pagination hidden
**File:** `app/appointments/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-21: Pagination is hidden for Customers on /appointments.
FILE: app/appointments/page.tsx

STEP 0 — REPRODUCE:
Run: grep -n "user?.role !== 'Customer' && <Pagination" app/appointments/page.tsx
Expect: match at line ~198.

STEP 1 — FIX:
Remove the role check from `<Pagination ... />` in app/appointments/page.tsx so that Customers can page through their appointments when total > 20.

STEP 2 — CONFIRM:
- Run: grep -n "user?.role !== 'Customer' && <Pagination" app/appointments/page.tsx (must NOT match).
- Run: bash scripts/gate.sh F-21 — must output GATE PASSED.
```

### [ ] F-22 Vehicle creation dropdown lacks customer name
**File:** `app/job-cards/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-22: Job card vehicle dropdown omits customer name.
FILE: app/job-cards/page.tsx

STEP 0 — REPRODUCE:
Check vehicle dropdown in app/job-cards/page.tsx line 128: renders `{v.make} {v.model} ({v.plate_number})` with no customer indication.

STEP 1 — FIX:
Update option label to:
`{v.make} {v.model} ({v.plate_number || 'No plate'}) — {v.customer_name || 'Customer'}`

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-22 — must output GATE PASSED.
```

### [ ] F-23 Time order validation on appointment forms
**Files:** `app/appointments/new/page.tsx`, `app/book/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-23: Forms allow submitting startTime >= endTime.
FILES: app/appointments/new/page.tsx, app/book/page.tsx

STEP 0 — REPRODUCE:
Inspect handleSubmit in both files: validates existence of startTime and endTime, but never checks `startTime < endTime`.

STEP 1 — FIX:
In handleSubmit of both files, add validation:
`if (startTime >= endTime) { toast.error('Start time must be before end time'); return; }`

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-23 — must output GATE PASSED.
```

### [ ] F-24 Guard clipboard writeText on HTTP LAN
**Files:** `app/job-cards/[id]/page.tsx`, `app/portal/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-24: navigator.clipboard.writeText throws TypeError on unencrypted HTTP LAN.
FILES: app/job-cards/[id]/page.tsx, app/portal/page.tsx

STEP 0 — REPRODUCE:
Check line 185 in app/job-cards/[id]/page.tsx and line 64 in app/portal/page.tsx: both call `navigator.clipboard.writeText()` directly without checking `window.isSecureContext` or wrapping in try/catch.

STEP 1 — FIX:
Wrap clipboard calls in a helper with try/catch and fallback for insecure contexts:
`if (navigator?.clipboard?.writeText) { await navigator.clipboard.writeText(text); toast.success('Copied!'); } else { ... }`

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-24 — must output GATE PASSED.
```

### [ ] F-25 Dashboard 3-column grid collapse
**File:** `app/dashboard/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-25: Dashboard Recent Jobs wraps awkwardly into a single column on row 2.
FILE: app/dashboard/page.tsx

STEP 0 — REPRODUCE:
Check lines 213, 214, 281, and 327 in app/dashboard/page.tsx. Inside `grid grid-cols-1 lg:grid-cols-3`, children widths are 2 + 1 + 1 = 4. Recent Jobs wraps alone to row 2.

STEP 1 — FIX:
Move `Recent Jobs` into a full-width container below the top grid, or give it `lg:col-span-3` so it spans the full width of the dashboard.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-25 — must output GATE PASSED.
```

### [ ] F-26 Right-click-only media tagging on mobile
**File:** `app/before-after/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-26: Tagging image as AFTER is bound to onContextMenu (right-click), impossible on touchscreens.
FILE: app/before-after/page.tsx

STEP 0 — REPRODUCE:
Run: grep -n "onContextMenu" app/before-after/page.tsx
Expect: match at line ~191.

STEP 1 — FIX:
Add accessible action buttons on hover/tap (small "Before" and "After" pill buttons) on each media thumbnail so users on mobile, tablets, and desktops can tag without needing a physical mouse right-click.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-26 — must output GATE PASSED.
```

### [ ] F-27 Infinite payment status polling on abandonment
**File:** `app/invoices/[id]/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-27: Payment status polling runs indefinitely every 5 seconds.
FILE: app/invoices/[id]/page.tsx

STEP 0 — REPRODUCE:
Check useEffect lines 24-31: setInterval polls `/payment-status` with no maximum attempts or timeout.

STEP 1 — FIX:
Add an attempt counter (max 30 attempts / 2.5 minutes). If unpaid after 30 attempts, clear interval and display "Payment pending or abandoned. Refresh to retry."

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-27 — must output GATE PASSED.
```

---

## PHASE 4 — Framework Hygiene & Cleanups (P3)

### [ ] F-29 Add App Router boundary files
**Files:** `app/error.tsx`, `app/not-found.tsx`, `app/loading.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-29: Missing root App Router boundary files.
FILES: app/error.tsx, app/not-found.tsx, app/loading.tsx

STEP 0 — REPRODUCE:
Check if app/error.tsx, app/not-found.tsx, or app/loading.tsx exist (they do not).

STEP 1 — FIX:
Create:
- `app/error.tsx`: branded client error boundary with a "Try again" button.
- `app/not-found.tsx`: branded 404 screen with a link back to `/portal` or `/`.
- `app/loading.tsx`: smooth spinner/skeleton fallback for route transitions.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-29 — must output GATE PASSED.
```

### [ ] F-30 Validate session on mount in AuthProvider
**File:** `lib/auth.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-30: AuthProvider hydrates from localStorage without verifying token via /auth/me.
FILE: lib/auth.tsx

STEP 0 — REPRODUCE:
Check lines 34-42 in lib/auth.tsx: loads storedToken and storedUser directly into state without an API call to verify the token is valid.

STEP 1 — FIX:
On mount, if storedToken exists, call `api.get('/auth/me')`. If it fails (401/403), call `logout()`. If it succeeds, update user state with fresh data.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-30 — must output GATE PASSED.
```

### [ ] F-31 Backend service template casing asymmetry (MANUAL BACKEND)
**File:** `backend/controllers/serviceController.js`

Action:
```
In backend/controllers/serviceController.js line 5:
Change: const { name, description, category, basePrice, estimatedMinutes } = req.body;
To: const { name, description, category, basePrice, base_price, estimatedMinutes, estimated_minutes } = req.body;
const price = basePrice !== undefined ? basePrice : base_price;
const minutes = estimatedMinutes !== undefined ? estimatedMinutes : estimated_minutes;
Commit directly in backend repository.
```

### [ ] F-32 Remove dead query invalidation in Loyalty Admin
**File:** `app/loyalty/admin/page.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-32: awardMutation invalidates non-existent query key ['loyalty-customer-points'].
FILE: app/loyalty/admin/page.tsx

STEP 0 — REPRODUCE:
Run: grep -n "loyalty-customer-points" app/loyalty/admin/page.tsx
Expect: invalidation on line ~36 for a query key not consumed in that file.

STEP 1 — FIX:
In app/loyalty/admin/page.tsx, invalidate queries that are actually fetched: `queryClient.invalidateQueries({ queryKey: ['loyalty-customers'] })` and `queryClient.invalidateQueries({ queryKey: ['loyalty-referrals'] })`.

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-32 — must output GATE PASSED.
```

### [ ] F-33 Extract viewport from metadata
**File:** `app/layout.tsx`

Prompt:
```
Read docs/audit/WORKFLOW.md.

FINDING F-33: metadata.viewport is deprecated in Next 14.
FILE: app/layout.tsx

STEP 0 — REPRODUCE:
Run: grep -n "viewport:" app/layout.tsx
Expect: viewport defined inside metadata object.

STEP 1 — FIX:
Import `Viewport` type from `next`. Remove viewport from `metadata` and export:
`export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 5 };`

STEP 2 — CONFIRM:
- Run: bash scripts/gate.sh F-33 — must output GATE PASSED with 0 warnings.
```
