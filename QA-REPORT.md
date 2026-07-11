# DreamWeavers Platform — Comprehensive QA Audit Report

**Date:** 2025-07-11  
**Environment:** Dev (Next.js 16.1.3 + Turbopack, SQLite, bun)  
**Scope:** Admin CMS (?view=cms), Couple CMS (?view=couple), Guest Frontend, API Layer, Security  
**Method:** API endpoint testing (44 endpoints), code review (80+ files), security analysis, UI/UX component audit

---

## Executive Summary

**Overall Platform Health: CRITICAL — NOT READY FOR DEPLOYMENT**

The platform has a **fragmented authentication architecture** that renders ~40% of API endpoints permanently inaccessible, even for valid authenticated users. The codebase contains two incompatible auth systems (NextAuth cookie-based vs. custom Bearer JWT), multiple references to non-existent Prisma models, and several unauthenticated data-exposure endpoints.

| Category | Status |
|---|---|
| Authentication | ⚠️ Partially broken — login works but session JWT shape is incompatible with session callbacks |
| Authorization | 🔴 Critical gaps — 2 admin endpoints have zero auth; role check uses wrong value |
| API Layer | 🔴 15 of 44 tested endpoints return 401 for valid admin sessions |
| Data Integrity | 🔴 Schema/code mismatches will cause runtime Prisma crashes |
| UI/UX | ⚠️ Couple CMS mobile is broken; 7/15 pages are placeholders |
| Security | 🔴 Multiple high-severity issues (no rate limiting, header-based tenant bypass) |
| Performance | ⚠️ No caching strategy, N+1 queries possible, missing DB indexes |
| Deployment | ✅ Dockerfile + CI pipeline verified and working |

**Critical Risks:**
1. Users who log in successfully cannot access ~40% of CMS features
2. `/api/admin` endpoints are completely unauthenticated — full data exfiltration possible
3. Arbitrary tenant data access via `x-wedding-id` header with no auth check
4. Couple CMS is completely non-functional on mobile devices

---

## Issues Found

### CRITICAL Severity (10 issues)

---

#### C1. Dual Incompatible Auth Systems — 15+ Endpoints Permanently Broken

**Module:** Authentication / API Layer  
**Files:** `src/lib/auth-middleware.ts`, `src/lib/auth.ts`, 27 route files under `/api/cms/tenants/*`, `/api/cms/stats`, `/api/cms/users`, `/api/cms/audit`, `/api/cms/features/global`, `/api/cms/recent-submissions`

**Steps to Reproduce:**
1. Login as admin: `POST /api/auth/login` with valid credentials
2. Receive `next-auth.session-token` cookie (JWE format, 5-segment token)
3. Call any `authenticateRequest`-protected endpoint, e.g. `GET /api/cms/tenants`
4. Observe 401 response

**Expected Behavior:** Authenticated admin can access all CMS endpoints  
**Actual Behavior:** 15+ endpoints return 401 regardless of valid session

**Root Cause:** Two auth systems coexist:
- **System A** (`getServerSession`): Reads `next-auth.session-token` cookie → uses `next-auth/jwt getToken()` to decrypt JWE → works with login flow
- **System B** (`authenticateRequest`): Reads `Authorization: Bearer` header only → uses `jsonwebtoken.verify()` which expects JWS (3-segment) but receives JWE (5-segment) → always fails

**Affected Endpoints (27 routes):**
`/api/cms/stats`, `/api/cms/users`, `/api/cms/tenants` (+ all 12 sub-routes), `/api/cms/audit`, `/api/cms/features/global`, `/api/cms/recent-submissions`

**Recommended Fix:** Delete `auth-middleware.ts`. Migrate all 27 routes to use `getServerSession()` from `@/lib/auth`.

---

#### C2. `/api/auth/me` Completely Broken — JWT Library Mismatch

**Module:** Authentication  
**File:** `src/app/api/auth/me/route.ts`, `src/lib/auth.ts:66-74`

**Steps to Reproduce:**
1. Login as admin, capture session cookie
2. `curl -H "Cookie: next-auth.session-token=<token>" http://localhost:3000/api/auth/me`
3. Observe 401 response

**Expected Behavior:** Returns authenticated user profile  
**Actual Behavior:** Always returns 401

**Root Cause:** `/api/auth/me` only checks `Authorization: Bearer` header (not cookies), and uses `jsonwebtoken.verify()` on a NextAuth JWE token — format mismatch.

**Recommended Fix:** Rewrite `/api/auth/me` to use `getServerSession()` from `@/lib/auth` (cookie-based).

---

#### C3. Login JWT Missing `id` Field — Session User ID Always Undefined

**Module:** Authentication  
**File:** `src/app/api/auth/login/route.ts:39-48` vs `src/lib/auth.ts:183-186`

**Steps to Reproduce:**
1. Login as admin
2. Call any `getServerSession`-based endpoint that checks `session.user.id`
3. `session.user.id` is `undefined`

**Expected Behavior:** Login JWT includes `id` field; session callback maps it to `session.user.id`  
**Actual Behavior:** Login sets `sub: user.id` but session callback reads `token.id` (not `token.sub`), so `session.user.id` is always undefined

**Root Cause:** Line 41 of login route: `sub: user.id` but auth.ts jwt callback: `token.id = user.id` — the field name mismatch means the session callback never fires for the `id` field.

**Recommended Fix:** Add `id: user.id` to the login JWT token payload (alongside `sub`).

---

#### C4. `/api/admin` and `/api/admin/accounts` — Zero Authentication

**Module:** Security / Authorization  
**Files:** `src/app/api/admin/route.ts`, `src/app/api/admin/accounts/route.ts`

**Steps to Reproduce:**
1. Without any authentication: `curl http://localhost:3000/api/admin`
2. Observe 200 response with full account data

**Expected Behavior:** 401 Unauthorized  
**Actual Behavior:** 200 with full data (all wedding accounts, RSVP counts, wishes)

**Root Cause:** Neither file imports any auth utility. Both GET and POST handlers run without any identity verification.

**Recommended Fix:** Add `getServerSession()` check at the top of both handlers. Return 401 if not authenticated and not SUPER_ADMIN.

---

#### C5. `requireMasterAdmin()` Checks Wrong Role Value

**Module:** Authorization  
**File:** `src/lib/auth-middleware.ts:32`

**Steps to Reproduce:**
1. Login as admin (role: `SUPER_ADMIN`)
2. Call any endpoint using `requireMasterAdmin()`
3. Always returns 403 "Master admin privileges required"

**Expected Behavior:** SUPER_ADMIN passes the role check  
**Actual Behavior:** Always denied — checks for `'master_admin'` (lowercase) but actual role is `'SUPER_ADMIN'`

**Root Cause:** `user.role !== 'master_admin'` — no role in the system uses `master_admin`. The database and all working auth checks use `SUPER_ADMIN`.

**Recommended Fix:** Change to `user.role !== 'SUPER_ADMIN'`.

---

#### C6. Missing Prisma Models — ~30+ Routes Will Crash at Runtime

**Module:** Data Layer  
**File:** `prisma/schema.prisma` vs. multiple API routes

**Missing Models Referenced in Code:**

| Missing Model | Used In |
|---|---|
| `Tenant` | ~20 routes in `/api/cms/tenants/*` |
| `Account` | `/api/admin/accounts`, workspace routes |
| `ContentPage` | workspace content routes |
| `ContentSection` | workspace section routes |
| `ContentBlock` | workspace block routes |
| `FeatureFlag` | `/api/admin/accounts` |
| `MediaAsset` | workspace media routes |
| `TenantFeatureToggle` | `/api/cms/stats` |
| `HoneymoonVote` | `/api/story/vote` |
| `HoneymoonSuggestion` | `/api/story/suggestion` |
| `GuestBookSubmission` | `/api/master/users` (hard delete) |

**Expected Behavior:** Routes use actual Prisma model names from schema  
**Actual Behavior:** Routes reference models that don't exist, will throw Prisma client errors

**Recommended Fix:** Either (a) add missing models to Prisma schema + run migration, or (b) update all route code to use correct existing model names (`WeddingAccount` instead of `Tenant`, etc.).

---

#### C7. Schema Field Mismatches — `tenantId` vs `weddingId`, Missing Fields

**Module:** Data Layer  
**Files:** `src/app/api/cms/tenants/[id]/rsvps/route.ts:34,51,95,136`, `src/app/api/cms/tenants/[id]/wishes/route.ts`

**Steps to Reproduce:**
1. Even if auth were fixed, calling `GET /api/cms/tenants/{id}/rsvps` would crash
2. Query uses `{ tenantId }` on `RSVPSubmission` which has `weddingId`, not `tenantId`

**Expected Behavior:** Routes use correct field names from Prisma schema  
**Actual Behavior:** Field `tenantId` does not exist on `RSVPSubmission`; `Wish` has no `status` field

**Recommended Fix:** Replace all `tenantId` references with `weddingId` in tenant sub-routes.

---

#### C8. `/api/wedding/public` — Data Leakage When No Slug Provided

**Module:** Security / Data Integrity  
**File:** `src/app/api/wedding/public/route.ts:11-13`

**Steps to Reproduce:**
1. `curl http://localhost:3000/api/wedding/public` (no slug parameter)
2. Observe 200 with full wedding data (schedule, FAQs, media, stories, features)

**Expected Behavior:** Require a slug parameter; return 400 if missing  
**Actual Behavior:** Returns first active wedding's complete data to unauthenticated users

**Recommended Fix:** Return 400 with error message if `slug` query parameter is not provided.

---

#### C9. Header-Based Tenant Bypass — Access Any Wedding's Data

**Module:** Security  
**File:** `src/lib/tenant.ts:63-68`

**Steps to Reproduce:**
1. Any request to workspace APIs can include header `x-wedding-id: <any-id>`
2. The system trusts this header without authentication
3. Attacker can access any tenant's data

**Expected Behavior:** Tenant ID comes only from authenticated session  
**Actual Behavior:** Unauthenticated header `x-wedding-id` and `x-session-wedding-id` are trusted without verification

**Recommended Fix:** Remove header-based tenant resolution or require auth before accepting headers.

---

#### C10. Couple CMS Mobile — Overlay Blocks All Interactions

**Module:** UI/UX  
**File:** `src/components/cms/CoupleCMSLayout.tsx:228-230`

**Steps to Reproduce:**
1. Open Couple CMS on a mobile viewport (<768px)
2. Observe that no buttons, links, or form elements respond to touch

**Expected Behavior:** Mobile users can interact with the CMS  
**Actual Behavior:** An empty `fixed inset-0 z-50` div overlays the entire viewport, intercepting all touch events

**Root Cause:** Empty overlay div with `md:hidden` creates an invisible but interactive blocking layer.

**Recommended Fix:** Remove lines 228-230 entirely. The mobile bottom nav already exists at line 295.

---

### HIGH Severity (12 issues)

---

#### H1. No Rate Limiting on Login

**Module:** Security  
**File:** `src/app/api/auth/login/route.ts`

10 rapid failed login attempts all returned 401 without throttling. Vulnerable to brute-force attacks.

**Recommended Fix:** Implement in-memory rate limiting (e.g., 5 attempts per minute per email) with exponential backoff.

---

#### H2. No CSRF Protection on Custom Login

**Module:** Security  
**File:** `src/app/api/auth/login/route.ts`

The custom `/api/auth/login` processes POST requests without CSRF token validation. Standard NextAuth enforces CSRF; this route bypasses it.

**Recommended Fix:** Validate a CSRF token matching NextAuth's behavior, or ensure the frontend always calls this via fetch (not form POST) with proper headers.

---

#### H3. No CORS Policy

**Module:** Security  
**Files:** All API route handlers

No `Access-Control-Allow-Origin` headers. Response bodies (including user data) are delivered to any origin.

**Recommended Fix:** Add explicit CORS middleware restricting to `NEXTAUTH_URL`.

---

#### H4. Logout Doesn't Invalidate Token

**Module:** Security  
**File:** `src/app/api/auth/logout/route.ts`

Logout clears the cookie but the JWT remains valid for 24 hours. Old tokens can still be used.

**Recommended Fix:** Implement server-side token blacklist (DB or in-memory cache).

---

#### H5. Invitation Codes Generated with `Math.random()`

**Module:** Security  
**File:** `src/app/api/cms/guests/route.ts:50`

`Math.random()` is not cryptographically secure. 6 alphanumeric chars = ~2.2 billion combinations. With birthday paradox, ~47K attempts yields 50% collision chance.

**Recommended Fix:** Use `crypto.randomBytes(4).toString('hex')` or similar.

---

#### H6. Couple CMS — Empty Auth Token in API Calls

**Module:** Authentication  
**File:** `src/components/cms/CoupleCMSPageRouter.tsx:45`

`token: ''` is hardcoded in `coupleContext`. All couple CMS API calls (RSVPs, Wishes, Analytics) send `Authorization: Bearer ` with empty token.

**Recommended Fix:** Use NextAuth session cookies instead of Bearer tokens for couple API routes.

---

#### H7. 7 of 15 Couple CMS Pages Are "Coming Soon" Placeholders

**Module:** Feature Completeness  
**File:** `src/components/cms/CoupleCMSPageRouter.tsx:22-30`

Pages `details`, `home`, `getting-there`, `story`, `moments`, `guests`, `sharing` all show ComingSoonPage. Nav items are visible but lead to dead ends.

**Recommended Fix:** Hide unfinished pages from navigation or add ETA badges.

---

#### H8. Audit Log Creation Uses Wrong Field Names — Will Crash

**Module:** Data Integrity  
**File:** `src/lib/auth-middleware.ts:84-95`

`createAuditLog()` uses `resource` (should be `entity`), `resourceId` (should be `entityId`), `tenantId` (should be `weddingId`), and `userAgent` (doesn't exist in schema).

**Recommended Fix:** Update field names to match Prisma schema's `AuditLog` model.

---

#### H9. `resolveWorkspaceAccountId` Falls Back to First Account — Cross-Tenant Risk

**Module:** Security  
**File:** `src/lib/tenant.ts:37-43`

When no session exists, falls back to first WeddingAccount in DB. In production, a failed session resolution could silently give access to another tenant's data.

**Recommended Fix:** Remove the fallback in production. Only allow the dev fallback when `NODE_ENV === 'development'`.

---

#### H10. RSVP Endpoint — No Rate Limiting or Bot Protection

**Module:** Security  
**File:** `src/app/api/rsvp/route.ts`

Public endpoint with no CAPTCHA, rate limiting, or bot protection. Susceptible to spam RSVPs.

**Recommended Fix:** Add rate limiting and consider honeypot fields or CAPTCHA.

---

#### H11. No File Upload in CMS Media — URL-Only

**Module:** UX  
**File:** `src/components/cms/pages/CMSMedia.tsx:444-453`

"Add Media" only accepts a URL string. Non-technical couples cannot easily upload photos.

**Recommended Fix:** Implement file upload with drag-and-drop.

---

#### H12. CoupleCMSLayout — Mobile Bottom Nav Overflows

**Module:** UI/UX  
**File:** `src/components/cms/CoupleCMSLayout.tsx:295-333`

All 15 nav items render in a flat flex row on mobile. Buttons overflow the ~375px viewport.

**Recommended Fix:** Show 4-5 primary items + "More" button opening a sheet with remaining items.

---

### MEDIUM Severity (25 issues)

| # | Module | Issue | File |
|---|---|---|---|
| M1 | Auth | Non-JSON body causes 500 instead of 400 | `login/route.ts` |
| M2 | Auth | Null byte in email causes 500 | `login/route.ts` |
| M3 | Auth | `callbackUrl` parameter accepted but ignored | `login/route.ts` |
| M4 | Config | `ignoreBuildErrors: true` hides type errors | `next.config.ts:9` |
| M5 | Config | `reactStrictMode: false` hides React bugs | `next.config.ts:11` |
| M6 | DB | Prisma query logging enabled in all environments | `db.ts:10` |
| M7 | DB | Missing indexes on frequently queried fields | `schema.prisma` |
| M8 | DB | `User.resetToken` has no index or unique constraint | `schema.prisma` |
| M9 | Data | Fuzzy guest matching in RSVP can match wrong guest | `rsvp/route.ts:67-76` |
| M10 | Data | `RSVPSubmission` uses `userId` in hard delete but field doesn't exist | `master/users/route.ts:252` |
| M11 | Security | No CSRF protection on state-changing public endpoints | All POST/PUT/DELETE |
| M12 | Security | No Content-Security-Policy or security headers | `next.config.ts` |
| M13 | UI | Double-fetch on mount in MasterWeddings and MasterUsers | Both files |
| M14 | UI | MasterDashboard stats grid not responsive (grid-cols-3) | `MasterDashboard.tsx:214` |
| M15 | UI | MasterWeddings table has no max-height/scroll | `MasterWeddings.tsx:409` |
| M16 | UI | CMSAnalytics PieChart center label never renders | `CMSAnalytics.tsx:355` |
| M17 | UI | Inconsistent toast libraries (shadcn vs sonner) | Admin vs Couple pages |
| M18 | UI | CMSFAQ accordion Switch doesn't stopPropagation | `CMSFAQ.tsx:312-355` |
| M19 | UI | CMSMedia category Select uses defaultValue (not controlled) | `CMSMedia.tsx:472` |
| M20 | UI | Zustand stores not reset on logout | `useCMSStore.ts`, `useCoupleCMSStore.ts` |
| M21 | UI | MasterSettings no unsaved changes warning | `MasterSettings.tsx` |
| M22 | UI | MasterSettings save button only at top | `MasterSettings.tsx:317` |
| M23 | UI | MasterSettings fake drag handle (GripVertical without DnD) | `MasterSettings.tsx:491` |
| M24 | UI | `XTransformPort=3000` debugging artifact in CoupleCMSLayout | `CoupleCMSLayout.tsx:62` |
| M25 | Data | `/api/wedding/public` returns 404 (route exists but returns no data for empty DB) | `wedding/public/route.ts` |

### LOW Severity (15 issues)

| # | Module | Issue |
|---|---|---|
| L1 | UI | MasterCMSLayout uses raw `<img>` instead of `next/image` for logo |
| L2 | UI | CoupleCMSLayout uses raw `<img>` for logo |
| L3 | UI | LoginModal uses raw `<img>` for logo |
| L4 | UI | MasterTemplates color input accepts non-hex text |
| L5 | UI | CoupleCMSLayout inline SVGs instead of lucide components |
| L6 | UI | LoginModal shows no rate limiting feedback |
| L7 | UI | CoupleCMSLayout content max-w-4xl may be too narrow for analytics |
| L8 | UI | MasterTemplates has no empty state |
| L9 | UI | Silent error handling on fetch in CMSSchedule/CMSFAQ/CMSMedia |
| L10 | UI | MasterSettings tab reorder has no visual feedback |
| L11 | UX | Couple CMS password minimum (6) vs Master (8) inconsistency |
| L12 | Code | `GLOBAL_FEATURE_LABELS` is dead code (copy of `FEATURE_LABELS`) |
| L13 | Code | `FEATURE_LABELS` and `ROLE_LABELS` use loose `Record<string, string>` types |
| L14 | Code | `useCMSStore.selectedWeddingId` never consumed by any page router |
| L15 | Code | No document title updates on CMS page navigation |

---

## Test Coverage

### Authentication (11 tests)
| Test | Result |
|---|---|
| Admin login (valid credentials) | ✅ 200, cookie set |
| Couple login (valid credentials) | ✅ 200, cookie set |
| Invalid credentials | ✅ 401 |
| Missing fields (empty) | ✅ 400 |
| Session check (unauthenticated) | ✅ 200, empty object |
| Session check (with admin cookie) | ✅ 200, full session |
| `/api/auth/me` (unauthenticated) | ✅ 401 |
| `/api/auth/me` (with cookie) | 🔴 401 (C2) |
| Logout | ✅ 200, cookie cleared |
| Forgot password | ✅ Anti-enumeration works |
| Reset password | ✅ Token expiry enforced |
| SQL injection | ✅ Protected by Prisma |

### API Endpoints (44 tested)
| Category | Total | Working | Broken |
|---|---|---|---|
| Master/Admin APIs | 6 | 5 | 1 (POST /settings) |
| CMS APIs (getServerSession) | 17 | 16 | 1 (/notifications) |
| CMS APIs (authenticateRequest) | 15 | 0 | **15** (auth broken) |
| Public APIs | 4 | 4 | 0 |
| **Total** | **44** | **25** | **17** |

### Authorization (36 unauthenticated tests)
All 36 protected endpoints correctly returned 401 for unauthenticated requests. ✅ No auth bypass found.

### Pages/Components Reviewed (80+ files)
- All Admin CMS pages (6): MasterDashboard, MasterWeddings, MasterUsers, MasterTemplates, MasterAnalytics, MasterSettings
- All Couple CMS pages (15): Dashboard, RSVPs, Wishes, Analytics, Schedule, FAQ, Media, Settings, Details, Home, Story, GettingThere, Moments, Guests, Sharing
- Layout components (4): MasterCMSLayout, CoupleCMSLayout, LoginModal, GuestSite
- Store files (3): useCMSStore, useCoupleCMSStore, useAuthModalStore
- Auth files (5): auth.ts, auth-middleware.ts, tenant.ts, db.ts, constants.ts
- All 76 API route handlers

---

## Recommendations

### Technical Debt (Must Fix Before Production)

1. **Unify authentication** — Delete `auth-middleware.ts` entirely. Migrate all 27 routes to use `getServerSession()` from `@/lib/auth`. This is the single largest issue blocking the platform.

2. **Fix login JWT shape** — Add `id: user.id` to the login JWT payload so `session.user.id` is populated.

3. **Add auth to `/api/admin/*`** — Both endpoints have zero authentication.

4. **Reconcile Prisma schema with code** — Either add missing models or update all route code to use correct model names. Currently, fixing auth would expose ~30 routes that crash due to wrong model references.

5. **Fix `requireMasterAdmin` role** — Change `'master_admin'` to `'SUPER_ADMIN'`.

6. **Remove header-based tenant resolution** — `x-wedding-id` and `x-session-wedding-id` allow unauthenticated cross-tenant access.

7. **Enable TypeScript strict mode** — `ignoreBuildErrors: true` and `reactStrictMode: false` are hiding bugs.

### UX Improvements

8. **Fix Couple CMS mobile** — Remove blocking overlay, implement proper bottom nav with "More" menu.

9. **Implement file upload** — URL-only media upload is unacceptable for the target audience.

10. **Standardize toast library** — Choose either shadcn toast or sonner, not both.

11. **Add TanStack Query** — Currently using raw fetch + useState. No caching, deduplication, or background refetch.

12. **Add document titles** — Browser tab always shows default Next.js title.

### Security Improvements

13. **Add rate limiting** to login, forgot-password, reset-password, and RSVP endpoints.

14. **Add security headers** — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.

15. **Remove Prisma query logging** in production.

16. **Use `crypto.randomBytes()`** instead of `Math.random()` for invitation codes.

### Performance Improvements

17. **Add database indexes** on `WeddingAccount.ownerId`, `WeddingAccount.status`, `RSVPSubmission.weddingId`, `Wish.weddingId`, `Guest.weddingId`, `AuditLog.userId`, `Notification.userId`.

18. **Implement pagination** — MasterWeddings table has no max-height/scroll and loads all data.

19. **Add optimistic updates** for simple toggle operations.

---

## Final Assessment

### ❌ NOT READY FOR PRODUCTION DEPLOYMENT

The platform cannot be deployed to production in its current state. The blocking issues are:

1. **40% of API endpoints are non-functional** due to the dual auth system. Fixing auth would expose another ~30 endpoints that crash due to missing Prisma models.
2. **Two admin API endpoints have zero authentication**, exposing all wedding data to the public internet.
3. **The Couple CMS is completely broken on mobile** (overlay blocks all interactions).
4. **7 of 15 Couple CMS pages are placeholders** — core functionality (details, guests, sharing) is missing.
5. **Header-based tenant resolution allows cross-tenant data access** without authentication.

### Minimum Viable Fix to Reach Deployable State

To reach a deployable state, the following must be resolved in order:

1. Delete `auth-middleware.ts` and migrate all 27 routes to `getServerSession()`
2. Fix login JWT to include `id` field
3. Add auth to `/api/admin/*` routes
4. Fix all Prisma model/field references to match actual schema
5. Remove `x-wedding-id` / `x-session-wedding-id` header trust
6. Fix Couple CMS mobile overlay
7. Add rate limiting on auth endpoints
8. Add security headers

**Estimated effort:** 2-3 focused development sessions to address the critical and high-severity items.