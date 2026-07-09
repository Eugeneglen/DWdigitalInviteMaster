# DWdigitalInvite — Complete CMS Architecture Blueprint

**Version:** 1.0  
**Date:** July 2025  
**Classification:** Confidential — Dreamweavers PTL  
**Status:** Implementation-Ready  

---

## Table of Contents

1. [Overall SaaS Architecture](#1-overall-saas-architecture)
2. [Information Architecture](#2-information-architecture)
3. [Master CMS Navigation](#3-master-cms-navigation)
4. [Wedding Couple CMS Navigation](#4-wedding-couple-cms-navigation)
5. [User Roles & Permission Matrix](#5-user-roles--permission-matrix)
6. [Multi-Tenant Architecture](#6-multi-tenant-architecture)
7. [Database Schema & Entity Relationships](#7-database-schema--entity-relationships)
8. [Feature Toggle Framework](#8-feature-toggle-framework)
9. [Dynamic Content Model](#9-dynamic-content-model)
10. [Frontend-to-CMS Field Mapping](#10-frontend-to-cms-field-mapping)
11. [Wedding Lifecycle Workflow](#11-wedding-lifecycle-workflow)
12. [Guest Invitation Workflow](#12-guest-invitation-workflow)
13. [RSVP Workflow](#13-rsvp-workflow)
14. [Guest Management System](#14-guest-management-system)
15. [Notification Engine](#15-notification-engine)
16. [Analytics Architecture](#16-analytics-architecture)
17. [Security Architecture](#17-security-architecture)
18. [API Architecture](#18-api-architecture)
19. [UI/UX Wireframe Descriptions](#19-uiux-wireframe-descriptions)
20. [MVP Roadmap & Enterprise Expansion](#20-mvp-roadmap--enterprise-expansion)

---

## 1. Overall SaaS Architecture

### 1.1 Platform Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Guest        │  │  Couple CMS   │  │  Master CMS      │  │
│  │  Invitation   │  │  Workspace    │  │  (Dreamweavers)   │  │
│  │  (Next.js)    │  │  (Next.js)    │  │  (Next.js)        │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘  │
│         │                 │                  │              │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
┌─────────┼─────────────────┼──────────────────┼──────────────┐
│         ▼                 ▼                  ▼              │
│                    API GATEWAY                             │
│              (Next.js API Routes / tRPC)                   │
│         ┌──────────┬──────────┬──────────────┐             │
│         │ Auth     │ Content  │ Guest        │             │
│         │ Layer    │ API      │ API          │             │
│         └────┬─────┴────┬─────┴──────┬───────┘             │
│              │          │            │                     │
│  ┌───────────┼──────────┼────────────┼─────────────────┐  │
│  │           ▼          ▼            ▼                 │  │
│  │              SERVICE LAYER                           │  │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌────────┐ │  │
│  │  │ Tenant  │ │ Content  │ │ Feature   │ │ Notify │ │  │
│  │  │ Service │ │ Service  │ │ Toggle    │ │ Engine │ │  │
│  │  └─────────┘ └──────────┘ └───────────┘ └────────┘ │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          ▼                                  │
│                 DATA LAYER                                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           PostgreSQL (multi-tenant)                   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────────────────┐  │  │
│  │  │ Tenant   │ │ Content  │ │ Guest Submissions   │  │  │
│  │  │ DB       │ │ DB       │ │ (RSVP/Wishes/Contact)│  │  │
│  │  └──────────┘ └──────────┘ └─────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────┼──────────────────────────────┐  │
│  │           STORAGE LAYER                              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │  │
│  │  │ S3/Cloud │ │ CDN      │ │ Local (dev)          │ │  │
│  │  │ Storage  │ │ (media)  │ │ SQLite (MVP only)    │ │  │
│  │  └──────────┘ └──────────┘ └──────────────────────┘ │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Already in use; SSR/SSG for guest-facing; unified codebase |
| **Database** | SQLite → PostgreSQL | SQLite for MVP/single-tenant; PostgreSQL for multi-tenant production with RLS |
| **ORM** | Prisma | Already in use; type-safe; migration support; excellent PostgreSQL support |
| **Auth** | NextAuth.js v4 → v5 | Already available; supports credentials, OAuth, role-based JWT |
| **State** | Zustand + TanStack Query | Already in use; Zustand for client state, TanStack for server state |
| **API Pattern** | tRPC (Phase 2) | Type-safe API calls; replaces REST in Phase 2. REST for MVP. |
| **Storage** | Local → S3-compatible | Start with local `/uploads`; migrate to S3/R2/Cloudflare |
| **Monorepo** | Turborepo (Phase 2) | Separate packages: `apps/guest`, `apps/couple-cms`, `apps/master-cms`, `packages/shared` |
| **Multi-tenancy** | Shared DB, tenant-id column | Cost-effective for MVP; schema-level isolation for enterprise |

### 1.3 Deployment Architecture

```
MVP (Single Server):
  Vercel / Single VPS
  ├── Guest invitation (port 3000)
  ├── Couple CMS (port 3001, or /admin/couple route)
  └── Master CMS (port 3002, or /admin/master route)

Production (Multi-tenant):
  Kubernetes / AWS ECS
  ├── CDN (Cloudflare)
  ├── Load Balancer
  ├── Guest instances (auto-scaled, edge-deployed)
  ├── CMS instances (internal, authenticated)
  ├── API cluster
  ├── PostgreSQL (managed: RDS / Supabase / Neon)
  ├── Redis (session cache, rate limiting)
  ├── S3 (media storage)
  └── Worker (notifications, analytics, cleanup)
```

---

## 2. Information Architecture

### 2.1 Content Hierarchy

```
Dreamweavers Platform
├── Master CMS (Dreamweavers PTL only)
│   ├── Accounts
│   │   ├── Wedding accounts (create/edit/suspend)
│   │   ├── User management (admin users)
│   │   └── Billing / subscriptions
│   ├── Templates
│   │   ├── Invitation themes
│   │   ├── Section layouts
│   │   └── Color palettes
│   ├── Features
│   │   ├── Feature catalog
│   │   ├── Global toggles
│   │   └── Per-account feature assignment
│   ├── Content Templates
│   │   ├── Notification templates (email/SMS/WhatsApp)
│   │   ├── Default copy presets
│   │   └── Legal document templates
│   ├── Analytics
│   │   ├── Platform-wide metrics
│   │   ├── Per-account dashboards
│   │   └── Export / reporting
│   ├── Support
│   │   ├── Ticket system
│   │   ├── Chat logs
│   │   └── Knowledge base
│   └── Settings
│       ├── Platform config
│       ├── API keys
│       ├── White-label
│       └── Audit logs
│
└── Wedding Account
    ├── Couple CMS (guided workspace)
    │   ├── Setup Wizard
    │   │   ├── Step 1: Couple names & date
    │   │   ├── Step 2: Venue & location
    │   │   ├── Step 3: Hero & branding
    │   │   ├── Step 4: Event schedule
    │   │   ├── Step 5: Story & photos
    │   │   ├── Step 6: Guest list
    │   │   └── Step 7: Review & publish
    │   ├── Content Editor
    │   │   ├── Home (invitation line, tea ceremony, prelude)
    │   │   ├── Schedule (events, timeline)
    │   │   ├── Story (milestones, tidbits, honeymoon)
    │   │   ├── Moments (gallery photos)
    │   │   ├── Wishes (pre-seeded cards, form settings)
    │   │   ├── Getting There (venue, transport, maps)
    │   │   ├── FAQ (questions & answers)
    │   │   └── Settings (RSVP options, deadline, dietary)
    │   ├── Guest Management
    │   │   ├── Guest list (add/import/edit)
    │   │   ├── RSVP tracker
    │   │   ├── Seating plan
    │   │   └── Invitation sender
    │   └── Live Data
    │       ├── RSVP submissions
    │       ├── Wishes & messages
    │       ├── Contact inquiries
    │       └── Honeymoon votes
    │
    └── Guest-Facing Invitation
        ├── Home (hero, countdown, tea ceremony, prelude)
        ├── Schedule (timeline, venue)
        ├── RSVP (multi-guest form)
        ├── Getting There (address, transport, map)
        ├── Story (milestones, tidbits, honeymoon vote)
        ├── Moments (photo gallery)
        ├── Wishes (heirloom, submit message)
        └── Q&A (FAQ, contact concierge)
```

---

## 3. Master CMS Navigation

### 3.1 Sidebar Navigation

```
DREAMWEAVERS
├── Dashboard                    ← Platform overview: accounts, revenue, usage
├── Accounts
│   ├── All Weddings             ← Wedding account list with status/filters
│   ├── Create Account           ← Onboarding form
│   └── Archived                 ← Suspended/completed accounts
├── Templates
│   ├── Invitation Themes        ← Visual theme selector (manage themes)
│   ├── Section Layouts          ← Manage page layout presets
│   └── Color Palettes           ← Brand color configuration
├── Features
│   ├── Feature Catalog          ← All available features with descriptions
│   ├── Global Toggles           ← Platform-wide on/off switches
│   └── Assignment Matrix        ← Per-account feature mapping
├── Content
│   ├── Notification Templates
│   │   ├── Email Templates      ← Invitation, RSVP confirmation, reminder
│   │   ├── SMS Templates        ← Short-form notification texts
│   │   └── WhatsApp Templates   ← WhatsApp message formats
│   ├── Default Copy Presets     ← Pre-written copy for each section
│   └── Legal Templates          ← Privacy, ToS, Data Protection
├── Analytics
│   ├── Platform Overview        ← Total accounts, active invitations, RSVP rate
│   ├── Account Analytics        ← Per-account drill-down
│   ├── Guest Engagement         ← RSVP rates, wish submissions, page views
│   └── Exports                  ← CSV/PDF report generation
├── Support
│   ├── Tickets                  ← Customer support tickets
│   ├── Conversations            ← Chat logs from contact concierge
│   └── Knowledge Base           ← Help articles for couples
└── Settings
    ├── Platform Config          ← SMTP, SMS gateway, WhatsApp API keys
    ├── API Keys                 ← External integrations
    ├── White-Label              ← Platform branding, domain, logo
    ├── User Roles               ← Admin user management
    └── Audit Logs               ← Complete activity history
```

### 3.2 Master CMS Dashboard Widgets

| Widget | Data | Visual |
|---|---|---|
| Active Weddings | Count of accounts with status `active` | Large number card |
| Pending Setup | Accounts not yet published | Warning badge |
| RSVP Rate (Avg) | Platform-wide RSVP submission / invited ratio | Progress ring |
| Wishes Collected | Total wishes across all accounts | Counter |
| Revenue (MTD) | Subscription/usage billing | Chart |
| Recent Activity | Latest account actions | Activity feed |
| Storage Used | Total media storage across tenants | Progress bar |
| Support Tickets | Open ticket count | Badge + link |

---

## 4. Wedding Couple CMS Navigation

### 4.1 Guided Setup Wizard (First-Time)

```
SETUP WIZARD
├── Step 1: The Couple           ← Names, date, time
├── Step 2: The Venue            ← Name, address, map pin, description
├── Step 3: The Look             ← Hero image, banner, theme color
├── Step 4: The Celebration      ← Schedule events, timeline
├── Step 5: Your Story           ← Milestones, photos, tidbits
├── Step 6: Guest List           ← Add/import guests, assign groups
└── Step 7: Review & Go Live     ← Preview invitation, publish
```

### 4.2 Main Workspace (After Setup)

```
ELEANOR & JAMES WEDDING
├── Overview                     ← Mini dashboard: RSVP stats, recent wishes
├── Edit Content
│   ├── Home                     ← Invitation line, tea ceremony, prelude text
│   ├── Schedule                 ← Event timeline items
│   ├── Story                    ← Milestones, tidbits, honeymoon options
│   ├── Moments                  ← Photo gallery (upload, reorder, caption)
│   ├── Wishes                   ← Pre-seeded cards, form toggle, moderation
│   ├── Getting There            ← Venue details, transport info, map
│   ├── Q&A                      ← FAQ items, contact info
│   └── Branding                 ← Logo, copyright, concierge email
├── Guest Management
│   ├── Guest List               ← Add/edit/search guests
│   ├── Import                   ← CSV upload, bulk actions
│   ├── Send Invitations         ← Email, WhatsApp, SMS, QR code, link copy
│   ├── RSVP Tracker             ← Attending / Declined / Pending status
│   └── Seating                  ← Table assignment (Phase 2)
├── Submissions
│   ├── RSVPs                    ← View all RSVP submissions, dietary notes
│   ├── Wishes                   ← View/approve/feature guest wishes
│   └── Messages                 ← Contact concierge inquiries
├── Settings
│   ├── RSVP Configuration       ← Deadline, dietary options, attendance options
│   ├── Notification Preferences ← Which alerts to receive
│   └── Account                  ← Password, email, close account
```

### 4.3 Couple CMS UX Principles

- **No code, no layout editing** — Only forms, uploads, and toggles
- **Progressive disclosure** — Advanced options hidden behind "Advanced" expanders
- **Live preview** — Every change shows a real-time preview of the guest-facing page
- **Guided validation** — Inline hints, not error walls
- **Section completion indicators** — Green checkmarks on completed sections
- **Mobile-first** — Couple may set up from phone; all forms touch-friendly

---

## 5. User Roles & Permission Matrix

### 5.1 Role Definitions

| Role | Scope | Description |
|---|---|---|
| `PLATFORM_OWNER` | Global | Dreamweavers PTL — full platform control |
| `PLATFORM_ADMIN` | Global | Dreamweavers staff — manage accounts, support, templates |
| `PLATFORM_SUPPORT` | Global | Read-only support access — view accounts, submissions |
| `ACCOUNT_OWNER` | Single wedding | The couple — full CMS access for their wedding |
| `ACCOUNT_VIEWER` | Single wedding | Read-only access (e.g., wedding planner, parent) |

### 5.2 Permission Matrix

| Permission | PLATFORM_OWNER | PLATFORM_ADMIN | PLATFORM_SUPPORT | ACCOUNT_OWNER | ACCOUNT_VIEWER |
|---|:---:|:---:|:---:|:---:|:---:|
| Create/delete wedding accounts | ✅ | ✅ | ❌ | ❌ | ❌ |
| Suspend/activate accounts | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign features to accounts | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage platform templates | ✅ | ✅ | ❌ | ❌ | ❌ |
| View all account data | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit own wedding content | ❌ | ❌ | ❌ | ✅ | ❌ |
| View own wedding content | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage own guest list | ❌ | ❌ | ❌ | ✅ | ❌ |
| View own RSVPs/wishes | ❌ | ❌ | ❌ | ✅ | ✅ |
| Send invitations | ❌ | ❌ | ❌ | ✅ | ❌ |
| Manage platform users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage billing | ✅ | ✅ | ❌ | ❌ | ❌ |
| Access audit logs | ✅ | ✅ | ✅ (own) | ❌ | ❌ |
| Configure global features | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage notification templates | ✅ | ✅ | ❌ | ❌ | ❌ |
| White-label settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete own account data | ❌ | ❌ | ❌ | ✅ (request) | ❌ |

### 5.3 Implementation

```prisma
enum Role {
  PLATFORM_OWNER
  PLATFORM_ADMIN
  PLATFORM_SUPPORT
  ACCOUNT_OWNER
  ACCOUNT_VIEWER
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          Role      @default(ACCOUNT_OWNER)
  // Platform users have no accountId (null)
  // Account users belong to one account
  accountId     String?
  account       WeddingAccount? @relation(fields: [accountId], references: [id])
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

---

## 6. Multi-Tenant Architecture

### 6.1 Tenancy Model: Shared Database, Tenant-ID Isolation

```
Table: wedding_accounts (tenant registry)
Table: content_* (all have weddingAccountId FK)
Table: rsvp_submissions (all have weddingAccountId FK)
Table: wishes (all have weddingAccountId FK)
```

**Every query includes `WHERE weddingAccountId = ?`**

### 6.2 Tenant Isolation Layers

```
Layer 1: AUTHENTICATION
  → JWT contains { userId, accountId, role }
  → Middleware extracts accountId from session

Layer 2: PRISMA MIDDLEWARE
  → Global Prisma extension injects weddingAccountId into all queries
  → Prevents cross-tenant data access at ORM level

Layer 3: API MIDDLEWARE
  → Route guards verify accountId matches session
  → Platform roles bypass accountId filter

Layer 4: ROW-LEVEL SECURITY (PostgreSQL)
  → RLS policies enforce tenant isolation at database level
  → Defense in depth even if app layer is compromised
```

### 6.3 Prisma Tenant Extension

```typescript
// prisma/tenant-extension.ts
function withTenant(prisma: PrismaClient, accountId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query, model }) {
          // Auto-inject weddingAccountId filter for tenant-scoped models
          if (TENANT_SCOPED_MODELS.includes(model)) {
            args.where = { ...args.where, weddingAccountId: accountId };
          }
          return query(args);
        },
      },
    },
  });
}
```

### 6.4 Scalability Path

| Phase | Tenancy Strategy | When |
|---|---|---|
| MVP | Single SQLite DB, no tenancy | Development / demo |
| Phase 1 | Shared PostgreSQL, tenant-ID column | First 50 weddings |
| Phase 2 | Shared PostgreSQL + RLS | 50-500 weddings |
| Phase 3 | Schema-per-tenant (optional) | 500+ weddings, compliance needs |
| Phase 4 | Database-per-tenant + connection pooling | Enterprise, regulatory requirements |

---

## 7. Database Schema & Entity Relationships

### 7.1 Entity Relationship Diagram

```
┌─────────────────────┐
│  WeddingAccount     │
├─────────────────────┤
│ id (PK)             │───────┐
│ slug (unique)       │       │
│ coupleName1         │       │
│ coupleName2         │       │
│ weddingDate         │       │
│ weddingTime         │       │
│ status              │       │  1:N  ┌──────────────────────┐
│ themeId             │       ├──────→│ User                  │
│ publishedAt         │       │       │ id (PK)              │
│ suspendedAt         │       │       │ email (unique)        │
│ storageUsedBytes    │       │       │ role                  │
│ maxStorageBytes     │       │       │ accountId (FK)        │
│ invitationPath      │       │       └──────────────────────┘
│ rsvpDeadline        │       │
│ createdAt           │       │  1:N  ┌──────────────────────┐
│ updatedAt           │       ├──────→│ AccountFeature        │
└─────────────────────┘       │       │ featureId (FK)        │
        │                     │       │ enabled (boolean)     │
        │                     │       └──────────┬───────────┘
        │ 1:1                 │                  │
        ▼                     │       ┌──────────┴───────────┐
┌─────────────────────┐       │       │ FeatureCatalog        │
│  WeddingContent     │       │       │ id (PK)              │
├─────────────────────┤       │       │ key (unique)         │
│ id (PK)             │       │       │ name                 │
│ accountId (FK)      │◄──────┘       │ category             │
│ coupleName1         │               │ description          │
│ coupleName2         │               │ defaultEnabled       │
│ weddingDate         │               │ tier                 │
│ weddingTime         │               └──────────────────────┘
│ venueName           │
│ venueAddress        │       1:N  ┌──────────────────────┐
│ venueDescription    │       ├──────→│ ScheduleEvent         │
│ venuePhotoUrl       │       │       │ id (PK)              │
│ mapEmbedUrl         │       │       │ accountId (FK)       │
│ mapLatitude         │       │       │ time                 │
│ mapLongitude        │       │       │ title                │
│ heroImageUrl        │       │       │ description          │
│ bannerImageUrl      │       │       │ tag                  │
│ heroInvitationLine  │       │       │ sortOrder            │
│ teaCeremonyLabel    │       │       └──────────────────────┘
│ teaCeremonyTitle    │       │
│ teaCeremonyImageUrl │       │  1:N  ┌──────────────────────┐
│ preludeLabel        │       ├──────→│ StoryMilestone       │
│ preludeTitle        │       │       │ id (PK)              │
│ preludeText         │       │       │ accountId (FK)       │
│ metaTitle           │       │       │ date                 │
│ metaDescription     │       │       │ title                │
│ conciergeEmail      │       │       │ description          │
│ copyrightText       │       │       │ imageUrl             │
│ rsvpDeadline        │       │       │ sortOrder            │
│ rsvpHeaderText      │       │       └──────────────────────┘
│ rsvpVenueLine1      │       │
│ rsvpVenueLine2      │       │  1:N  ┌──────────────────────┐
│ attendanceOptions   │  JSON  ├──────→│ StoryTidbit          │
│ dietaryOptions      │  JSON  │       │ id (PK)              │
│ navItems            │  JSON  │       │ accountId (FK)       │
│ createdAt           │       │       │ question             │
│ updatedAt           │       │       │ answer               │
└─────────────────────┘       │       │ sortOrder            │
                              │       └──────────────────────┘
                              │
                              │  1:N  ┌──────────────────────┐
                              ├──────→│ MomentPhoto           │
                              │       │ id (PK)              │
                              │       │ accountId (FK)       │
                              │       │ imageUrl             │
                              │       │ caption              │
                              │       │ sortOrder            │
                              │       └──────────────────────┘
                              │
                              │  1:N  ┌──────────────────────┐
                              ├──────→│ WishCard (pre-seeded) │
                              │       │ id (PK)              │
                              │       │ accountId (FK)       │
                              │       │ cardType             │
                              │       │ role                 │
                              │       │ quote                │
                              │       │ author               │
                              │       │ imageUrl             │
                              │       │ sortOrder            │
                              │       └──────────────────────┘
                              │
                              │  1:N  ┌──────────────────────┐
                              ├──────→│ FAQItem               │
                              │       │ id (PK)              │
                              │       │ accountId (FK)       │
                              │       │ question             │
                              │       │ answer               │
                              │       │ sortOrder            │
                              │       └──────────────────────┘
                              │
                              │  1:N  ┌──────────────────────┐
                              ├──────→│ TransportInfo         │
                              │       │ id (PK)              │
                              │       │ accountId (FK)       │
                              │       │ parkingText          │
                              │       │ airportText          │
                              │       │ mrtStations          │ JSON
                              │       │ busServices          │ JSON
                              │       │ busStopText          │
                              │       │ conciergeNote        │
                              │       └──────────────────────┘
                              │
                              │  1:N  ┌──────────────────────┐
                              ├──────→│ HoneymoonDestination  │
                              │       │ id (PK)              │
                              │       │ accountId (FK)       │
                              │       │ name                 │
                              │       │ imageUrl             │
                              │       │ sortOrder            │
                              │       └──────────────────────┘
                              │
                              │  1:N  ┌──────────────────────┐
                              ├──────→│ Guest                 │
                              │       │ id (PK)              │
                              │       │ accountId (FK)       │
                              │       │ name                 │
                              │       │ email                │
                              │       │ phone                │
                              │       │ group                │
                              │       │ invitedVia           │
                              │       │ invitationSentAt     │
                              │       │ viewedAt            │
                              │       │ rsvpStatus          │
                              │       └──────────────────────┘
                              │
                              │  1:N  ┌──────────────────────┐
                              ├──────→│ RSVPSubmission        │
                              │       │ id (PK)              │
                              │       │ accountId (FK)       │
                              │       │ guestId (FK)         │
                              │       │ guests[] → GuestResponse
                              │       └──────────┬───────────┘
                              │                  │ 1:N
                              │       ┌──────────┴───────────┐
                              │       │ GuestResponse        │
                              │       │ id, name, attendance,│
                              │       │ dietary, rsvpId (FK) │
                              │       └──────────────────────┘
                              │
                              │  1:N  ┌──────────────────────┐
                              ├──────→│ Wish (guest-submitted)│
                              │       │ id (PK)              │
                              │       │ accountId (FK)       │
                              │       │ name, relationship,  │
                              │       │ message, imageUrl    │
                              │       │ featured (boolean)   │
                              │       │ approved (boolean)   │
                              │       └──────────────────────┘
                              │
                              │  1:N  ┌──────────────────────┐
                              └──────→│ ContactSubmission     │
                                      │ id (PK)              │
                                      │ accountId (FK)       │
                                      │ name, email, contact,│
                                      │ reason               │
                                      │ resolved (boolean)   │
                                      └──────────────────────┘
```

### 7.2 Core Prisma Models (MVP)

```prisma
// ============ PLATFORM MODELS ============

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          Role      @default(ACCOUNT_OWNER)
  accountId     String?
  account       WeddingAccount? @relation(fields: [accountId], references: [id], onDelete: Cascade)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([accountId])
}

enum Role {
  PLATFORM_OWNER
  PLATFORM_ADMIN
  PLATFORM_SUPPORT
  ACCOUNT_OWNER
  ACCOUNT_VIEWER
}

model FeatureCatalog {
  id             String   @id @default(cuid())
  key            String   @unique
  name           String
  category       String   // "content", "guest", "rsvp", "media", "advanced"
  description    String   @db.Text
  defaultEnabled Boolean  @default(false)
  tier           String   @default("all") // "free", "premium", "enterprise", "all"
  sortOrder      Int      @default(0)
  accountFeatures AccountFeature[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model WeddingAccount {
  id              String    @id @default(cuid())
  slug            String    @unique  // "eleanor-james-2027"
  status          AccountStatus @default(DRAFT)
  coupleName1     String
  coupleName2     String
  weddingDate     DateTime?
  publishedAt     DateTime?
  suspendedAt     DateTime?
  storageUsedBytes Int       @default(0)
  maxStorageBytes Int       @default(524288000) // 500MB
  invitationPath  String    @unique // "/eleanor-james-2027"
  users           User[]
  content         WeddingContent?
  features        AccountFeature[]
  guests          Guest[]
  rsvps           RSVPSubmission[]
  wishes          Wish[]
  contacts        ContactSubmission[]
  schedule        ScheduleEvent[]
  milestones      StoryMilestone[]
  tidbits         StoryTidbit[]
  photos          MomentPhoto[]
  wishCards       WishCard[]
  faqs            FAQItem[]
  transport       TransportInfo[]
  destinations    HoneymoonDestination[]
  honeymonVotes   HoneymoonVote[]
  auditLogs       AuditLog[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([status])
  @@index([weddingDate])
}

enum AccountStatus {
  DRAFT       // Setup in progress
  PUBLISHED   // Live and accessible
  SUSPENDED   // Disabled by Dreamweavers
  ARCHIVED    // Wedding completed
}

model AccountFeature {
  id           String   @id @default(cuid())
  accountId   String
  featureId   String
  enabled      Boolean  @default(true)
  account      WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  feature      FeatureCatalog @relation(fields: [featureId], references: [id])
  createdAt    DateTime @default(now())

  @@unique([accountId, featureId])
  @@index([accountId])
}

// ============ CONTENT MODELS ============

model WeddingContent {
  id                  String   @id @default(cuid())
  accountId           String   @unique
  account             WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)

  // Couple & Date
  coupleName1         String
  coupleName2         String
  weddingDate         DateTime
  weddingTime         String   // "16:00"

  // Venue
  venueName           String   @default("")
  venueAddress        String   @default("")
  venueDescription    String   @default("")
  venuePhotoUrl       String   @default("")
  mapEmbedUrl         String   @default("")
  mapLatitude         Float?
  mapLongitude        Float?

  // Home Page
  heroImageUrl        String   @default("")
  bannerImageUrl      String   @default("")
  heroInvitationLine  String   @default("Together with their families, request the pleasure of your company")
  teaCeremonyLabel    String   @default("The Tradition")
  teaCeremonyTitle    String   @default("The Tea Ceremony")
  teaCeremonyImageUrl String   @default("")
  preludeLabel        String   @default("The Prelude")
  preludeTitle        String   @default("Our Story Begins Here")
  preludeText         String   @default("")

  // Meta & Branding
  metaTitle           String   @default("Dreamweavers - The Digital Keepsake")
  metaDescription     String   @default("")
  conciergeEmail      String   @default("concierge@dreamweavers.events")
  copyrightText       String   @default("© 2025 DREAMWEAVERS DIGITAL HEIRLOOMS. All rights reserved.")
  logoUrl             String   @default("")

  // RSVP Configuration
  rsvpDeadline        DateTime?
  rsvpHeaderText      String   @default("Enter your name to RSVP")
  rsvpVenueLine1      String   @default("")
  rsvpVenueLine2      String   @default("")
  attendanceOptions   String   // JSON array
  dietaryOptions      String   // JSON array

  // Navigation (which sections are visible)
  navItems            String   // JSON array of { key, label, icon, visible }

  // Legal
  privacyPolicyEnabled  Boolean @default(true)
  dataProtectionEnabled Boolean @default(true)
  tosEnabled           Boolean @default(true)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ============ SECTION CONTENT MODELS ============

model ScheduleEvent {
  id          String   @id @default(cuid())
  accountId   String
  account     WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  time        String   // "4:00 PM"
  title       String   // "The Ceremony"
  description String
  tag         String?  // "Formal Attire"
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([accountId, sortOrder])
}

model StoryMilestone {
  id          String   @id @default(cuid())
  accountId   String
  account     WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  date        String   // "October 2018"
  title       String   // "The First Chapter"
  description String   @db.Text
  imageUrl    String   @default("")
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([accountId, sortOrder])
}

model StoryTidbit {
  id          String   @id @default(cuid())
  accountId   String
  account     WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  question    String
  answer      String   @db.Text
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([accountId, sortOrder])
}

model MomentPhoto {
  id          String   @id @default(cuid())
  accountId   String
  account     WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  imageUrl    String
  caption     String
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([accountId, sortOrder])
}

model WishCard {
  id          String   @id @default(cuid())
  accountId   String
  account     WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  cardType    String   // "image" | "text-card" | "dark-card" | "minimal"
  role        String?  // "Maid of Honor"
  quote       String   @db.Text
  author      String
  imageUrl    String   @default("")
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([accountId, sortOrder])
}

model FAQItem {
  id          String   @id @default(cuid())
  accountId   String
  account     WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  question    String
  answer      String   @db.Text
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([accountId, sortOrder])
}

model TransportInfo {
  id              String   @id @default(cuid())
  accountId       String   @unique
  account         WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  parkingText     String   @default("")
  airportText     String   @default("")
  mrtStations     String   // JSON: [{ name, distance, description }]
  busServices     String   // JSON string of bus numbers
  busStopText     String   @default("")
  conciergeNote   String   @default("")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model HoneymoonDestination {
  id          String   @id @default(cuid())
  accountId   String
  account     WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  name        String
  imageUrl    String   @default("")
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([accountId, name])
}

model HoneymoonVote {
  id            String   @id @default(cuid())
  accountId     String
  account       WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  destinationId String
  ipAddress     String?
  createdAt     DateTime @default(now())

  @@index([accountId, destinationId])
}

// ============ GUEST & SUBMISSION MODELS ============

model Guest {
  id            String      @id @default(cuid())
  accountId     String
  account       WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  name          String
  email         String?
  phone         String?
  group         String?     // "family", "friends", "colleagues"
  invitedVia    String      @default("link") // "email", "whatsapp", "sms", "qr", "link"
  invitationSentAt DateTime?
  viewedAt      DateTime?
  rsvpStatus    RsvpStatus  @default(PENDING)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  rsvps         RSVPSubmission[]

  @@index([accountId, rsvpStatus])
}

enum RsvpStatus {
  PENDING
  ATTENDING
  DECLINED
  PARTIAL
}

model RSVPSubmission {
  id          String    @id @default(cuid())
  accountId   String
  account     WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  guestId     String?
  guest       Guest?    @relation(fields: [guestId], references: [id])
  firstName   String
  lastName    String
  partySize   Int
  guests      GuestResponse[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([accountId])
}

model GuestResponse {
  id          String   @id @default(cuid())
  name        String
  attendance  String   // "yes" | "no" | "partial"
  dietary     String?
  rsvpId      String
  rsvp        RSVPSubmission @relation(fields: [rsvpId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Wish {
  id          String   @id @default(cuid())
  accountId   String
  account     WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  name        String
  relationship String?
  message     String   @db.Text
  imageUrl    String?
  featured    Boolean  @default(false)
  approved    Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model ContactSubmission {
  id          String   @id @default(cuid())
  accountId   String
  account     WeddingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  name        String
  email       String
  contact     String?
  reason      String   @db.Text
  resolved    Boolean  @default(false)
  createdAt   DateTime @default(now())
}

// ============ PLATFORM INFRASTRUCTURE ============

model AuditLog {
  id          String   @id @default(cuid())
  accountId   String?
  userId      String?
  action      String   // "content.update", "guest.import", "account.suspend"
  entityType  String?  // "WeddingContent", "Guest", "ScheduleEvent"
  entityId    String?
  metadata    String?  // JSON
  ipAddress   String?
  createdAt   DateTime @default(now())

  @@index([accountId, createdAt])
  @@index([userId, createdAt])
}

model NotificationTemplate {
  id          String   @id @default(cuid())
  key         String   @unique // "invitation_email", "rsvp_confirmation_sms"
  channel     String   // "email", "sms", "whatsapp"
  subject     String?  // email only
  body        String   @db.Text
  variables   String   // JSON: ["{{coupleName}}", "{{guestName}}", "{{date}}"]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model InvitationLog {
  id          String   @id @default(cuid())
  accountId   String
  guestId     String?
  channel     String   // "email", "whatsapp", "sms", "link", "qr"
  sentTo      String   // email address or phone number
  status      String   // "sent", "delivered", "failed", "opened", "clicked"
  metadata    String?  // JSON: provider response
  createdAt   DateTime @default(now())

  @@index([accountId, createdAt])
}
```

---

## 8. Feature Toggle Framework

### 8.1 Feature Catalog

| Feature Key | Name | Category | Default | Description |
|---|---|---|---|---|
| `schedule` | Event Schedule | content | ON | Timeline of wedding events |
| `story` | Love Story | content | ON | Milestones, tidbits |
| `moments` | Photo Gallery | content | ON | Photo moments section |
| `wishes` | Wishes Heirloom | content | ON | Guest wishes & pre-seeded cards |
| `getting_there` | Venue & Transport | content | ON | Directions, map, transport |
| `faq` | FAQ | content | ON | Frequently asked questions |
| `tea_ceremony` | Tea Ceremony | content | ON | Tea ceremony section on home |
| `rsvp` | RSVP Form | rsvp | ON | Guest RSVP submission |
| `rsvp_dietary` | Dietary Options | rsvp | ON | Dietary requirement selection |
| `rsvp_multi_guest` | Multi-Guest RSVP | rsvp | ON | RSVP for party |
| `honeymoon_vote` | Honeymoon Voting | guest | ON | Guest votes on destination |
| `contact_concierge` | Contact Concierge | guest | ON | Contact form modal |
| `legal_documents` | Legal Documents | guest | ON | Privacy, ToS, Data Protection |
| `background_music` | Background Music | media | OFF | Audio playback |
| `countdown` | Countdown Timer | content | ON | Wedding countdown |
| `hero_banner` | Top Banner | content | ON | "Eleanor & James" banner |
| `custom_domain` | Custom Domain | advanced | OFF | Custom URL for invitation |
| `password_protect` | Password Protection | advanced | OFF | Require password to view |
| `analytics` | View Analytics | advanced | OFF | Page view tracking |
| `seating_plan` | Seating Plan | advanced | OFF | Table assignments |

### 8.2 Toggle Resolution Flow

```
Request → Auth Middleware (get role, accountId)
       → Feature Service.resolve(featureKey, accountId)
           1. Check AccountFeature row (explicit override)
           2. If no override, check FeatureCatalog.defaultEnabled
           3. If PLATFORM role, always return true
       → Return { enabled: boolean, reason?: string }
       → Frontend conditionally renders section
```

### 8.3 API Endpoint

```
GET /api/content/features
Response: {
  schedule: { enabled: true },
  story: { enabled: true },
  wishes: { enabled: true },
  // ... all features
}
```

Frontend calls this once on load and stores in Zustand. Sections with `enabled: false` are hidden from navigation and content.

---

## 9. Dynamic Content Model

### 9.1 Content Resolution Pipeline

```
Guest opens /eleanor-james-2027
  │
  ▼
Middleware: Extract slug → lookup WeddingAccount
  │
  ▼
API: GET /api/content?slug=eleanor-james-2027
  │
  ▼
Content Service:
  1. Load WeddingContent (all text, images, settings)
  2. Load ScheduleEvent[] (sorted by sortOrder)
  3. Load StoryMilestone[] (sorted)
  4. Load StoryTidbit[] (sorted)
  5. Load MomentPhoto[] (sorted)
  6. Load WishCard[] (pre-seeded, sorted)
  7. Load Wish[] (guest-submitted, approved only)
  8. Load FAQItem[] (sorted)
  9. Load TransportInfo (singleton)
  10. Load HoneymoonDestination[] + vote counts
  11. Load FeatureCatalog (filtered by account features)
  12. Assemble into single ContentBundle
  │
  ▼
Frontend: Store in Zustand → render all sections dynamically
```

### 9.2 ContentBundle Type

```typescript
interface ContentBundle {
  account: {
    slug: string;
    coupleName1: string;
    coupleName2: string;
    coupleDisplay: string; // "Eleanor & James"
    weddingDate: string;
    weddingTime: string;
  };
  content: WeddingContent;
  features: Record<string, { enabled: boolean }>;
  schedule: ScheduleEvent[];
  milestones: StoryMilestone[];
  tidbits: StoryTidbit[];
  photos: MomentPhoto[];
  wishCards: WishCard[];
  wishes: Wish[];
  faqs: FAQItem[];
  transport: TransportInfo | null;
  destinations: (HoneymoonDestination & { voteCount: number })[];
}
```

### 9.3 Fallback Strategy

Every field in `WeddingContent` has a sensible default. If a couple hasn't filled in a section:
- Text fields fall back to empty string (section hidden)
- Images fall back to a default placeholder
- Arrays (schedule, FAQs, etc.) return empty (section hidden)
- The frontend checks `content.field || defaultText` and `array.length > 0` before rendering

---

## 10. Frontend-to-CMS Field Mapping

### 10.1 HomePage

| Frontend Element | Current Hardcoded Value | CMS Source | Field |
|---|---|---|---|
| Banner H1 | `"Eleanor & James"` | `WeddingContent.coupleName1` + `coupleName2` | Computed: `"Eleanor & James"` |
| Banner BG image | Google URL | `WeddingContent.bannerImageUrl` | Upload |
| Date badge | `"December 25, 2027"` | `WeddingContent.weddingDate` | Date picker |
| Countdown target | `2027-12-25T16:00:00` | `WeddingContent.weddingDate` + `weddingTime` | Computed |
| Hero image | Google URL | `WeddingContent.heroImageUrl` | Upload |
| Invitation line | Long text | `WeddingContent.heroInvitationLine` | Textarea |
| Scroll label | `"Scroll"` | Static UI chrome | Not CMS-managed |
| Tea ceremony label | `"The Tradition"` | `WeddingContent.teaCeremonyLabel` | Text input |
| Tea ceremony title | `"The Tea Ceremony"` | `WeddingContent.teaCeremonyTitle` | Text input |
| Tea ceremony image | Google URL | `WeddingContent.teaCeremonyImageUrl` | Upload |
| Prelude label | `"The Prelude"` | `WeddingContent.preludeLabel` | Text input |
| Prelude title | `"Our Story Begins Here"` | `WeddingContent.preludeTitle` | Text input |
| Prelude text | Long paragraph | `WeddingContent.preludeText` | Rich textarea |

### 10.2 SchedulePage

| Frontend Element | CMS Source | Field |
|---|---|---|
| Calendar event title | Computed from account | `coupleName1 + " & " + coupleName2 + " Wedding"` |
| Calendar times | Computed | `weddingDate` + first/last event times |
| Banner title `"The Schedule"` | Static UI | Not CMS |
| Date line | `WeddingContent.weddingDate` | Date picker |
| Timeline events (×3) | `ScheduleEvent[]` | Repeater: time, title, description, tag |
| Venue name | `WeddingContent.venueName` | Text input |
| Venue description | `WeddingContent.venueDescription` | Textarea |
| Venue photo | `WeddingContent.venuePhotoUrl` | Upload |

### 10.3 RSVPPage

| Frontend Element | CMS Source | Field |
|---|---|---|
| Page H1 | Computed | `"Eleanor & James"` |
| Venue lines | `WeddingContent.rsvpVenueLine1/2` | Text inputs |
| Step heading | `WeddingContent.rsvpHeaderText` | Text input |
| Dietary options | `WeddingContent.dietaryOptions` | JSON editor / tag picker |
| Attendance options | `WeddingContent.attendanceOptions` | JSON editor / repeater |
| Result messages | Static UI with computed names | Partially CMS |

### 10.4 StoryPage

| Frontend Element | CMS Source | Field |
|---|---|---|
| Hero intro paragraph | Static UI | Not CMS |
| Timeline milestones | `StoryMilestone[]` | Repeater: date, title, description, image |
| Tidbits Q&A | `StoryTidbit[]` | Repeater: question, answer |
| Honeymoon destinations | `HoneymoonDestination[]` | Repeater: name, image |
| Honeymoon votes | `HoneymoonVote[]` | System-generated |

### 10.5 MomentsPage

| Frontend Element | CMS Source | Field |
|---|---|---|
| Intro paragraph | Static UI | Not CMS |
| Photos (×7) | `MomentPhoto[]` | Repeater: image upload, caption, drag-reorder |

### 10.6 WishesPage

| Frontend Element | CMS Source | Field |
|---|---|---|
| Intro text | Static UI | Not CMS |
| Pre-seeded cards (×5) | `WishCard[]` | Repeater: type, role, quote, author, image |
| Guest wishes | `Wish[]` (approved) | System-generated |
| Form labels | Static UI | Not CMS |

### 10.7 GettingTherePage

| Frontend Element | CMS Source | Field |
|---|---|---|
| Venue name | `WeddingContent.venueName` | Shared field |
| Venue address | `WeddingContent.venueAddress` | Shared field |
| Parking text | `TransportInfo.parkingText` | Rich textarea |
| Airport text | `TransportInfo.airportText` | Rich textarea |
| MRT stations | `TransportInfo.mrtStations` | JSON repeater |
| Bus info | `TransportInfo.busStopText` + `busServices` | Text + tag input |
| Map embed | `WeddingContent.mapEmbedUrl` | URL input |
| Concierge note | `TransportInfo.conciergeNote` | Text input |

### 10.8 QAPage

| Frontend Element | CMS Source | Field |
|---|---|---|
| FAQ items (×4) | `FAQItem[]` | Repeater: question, answer |
| CTA heading/description | Static UI | Not CMS |
| Concierge email | `WeddingContent.conciergeEmail` | Email input |

### 10.9 Shared / Cross-Cutting

| Frontend Element | CMS Source | Field |
|---|---|---|
| Meta title | `WeddingContent.metaTitle` | Text input |
| Meta description | `WeddingContent.metaDescription` | Textarea |
| Nav labels (8) | `WeddingContent.navItems` | JSON: per-label text + visible toggle |
| Logo | `WeddingContent.logoUrl` | Upload |
| Copyright | `WeddingContent.copyrightText` | Text input |
| Footer links | Feature toggles | `privacyPolicyEnabled`, `dataProtectionEnabled`, `tosEnabled` |
| Legal content | `NotificationTemplate` (future) | Full document editor |

---

## 11. Wedding Lifecycle Workflow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   DRAFT      │────→│  PUBLISHED   │────→│  ARCHIVED    │
│              │     │              │     │              │
│ Dreamweavers │     │ Couple edits │     │ Auto-archive │
│ creates      │     │ live content │     │ 30 days post │
│ account      │     │ Guests view  │     │ wedding date │
│ Couple sets  │     │ & RSVP       │     │              │
│ up content   │     │              │     │ Read-only    │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │
       │              ┌─────┴──────┐
       │              │ SUSPENDED  │
       │              │            │
       │              │ Dreamweavers│
       │              │ disables   │
       │              │ access     │
       │              └────────────┘
       │
  ┌────┴──────────────────────────────┐
  │         SETUP WIZARD              │
  │  Step 1 → 2 → 3 → 4 → 5 → 6 → 7 │
  │  (progressive, can skip & return)  │
  └───────────────────────────────────┘
```

### Status Transitions

| From | To | Trigger | Who |
|---|---|---|---|
| — | DRAFT | Account created | Dreamweavers |
| DRAFT | PUBLISHED | Couple clicks "Publish" / Dreamweavers activates | Couple / Dreamweavers |
| PUBLISHED | DRAFT | Couple clicks "Unpublish" | Couple |
| PUBLISHED | SUSPENDED | Dreamweavers suspends | Dreamweavers |
| SUSPENDED | PUBLISHED | Dreamweavers reactivates | Dreamweavers |
| PUBLISHED | ARCHIVED | Auto 30 days post-wedding, or manual | System / Dreamweavers |

---

## 12. Guest Invitation Workflow

```
Dreamweavers creates account
  │
  ▼
Couple completes setup wizard
  │
  ▼
Couple adds guests (manual / CSV import)
  │
  ▼
Couple sends invitations
  ├── Email: SMTP → guest inbox → {invitationUrl}
  ├── WhatsApp: WhatsApp API → guest chat → {invitationUrl}
  ├── SMS: Twilio/Vonage → guest phone → {shortUrl}
  ├── QR Code: Generated PNG → printed material → scan → {invitationUrl}
  └── Link: Couple copies {invitationUrl} → manual share
  │
  ▼
Guest opens {invitationUrl}/eleanor-james-2027
  │
  ├── Middleware: lookup WeddingAccount by slug
  ├── Load ContentBundle
  ├── Render invitation with all CMS-managed content
  ├── Log view in InvitationLog (status: "opened")
  └── Display RSVP, wishes, contact — all wired to account
```

### Invitation URL Structure

```
Production:  https://dreamweavers.events/eleanor-james-2027
Development: http://localhost:3000/eleanor-james-2027

Or with password: https://dreamweavers.events/eleanor-james-2027?key=abc123
```

---

## 13. RSVP Workflow

```
Guest opens invitation → navigates to RSVP section
  │
  ▼
Step 1: Enter name → lookup against Guest table (optional match)
  │
  ├── Matched: Pre-fill party size from guest record
  └── No match: Guest enters freely
  │
  ▼
Step 2: Enter party size (1-10)
  │
  ▼
Step 3: For each guest — select attendance + dietary
  │  Options come from WeddingContent.attendanceOptions / dietaryOptions
  │
  ▼
Step 4: Review & submit
  │
  ▼
POST /api/rsvp (with weddingAccountId from session/slug)
  │
  ├── Validate with Zod
  ├── Create RSVPSubmission + GuestResponse[] records
  ├── Update Guest.rsvpStatus if matched
  ├── Trigger notification (couple gets RSVP alert)
  └── Return success → show confirmation screen
```

### RSVP Data Flow

```
Guest form → Zod validation → Prisma create → Notification → Couple dashboard
                                          → Analytics event
```

---

## 14. Guest Management System

### 14.1 Guest Record Lifecycle

```
Added to Guest table
  │
  ├── Status: PENDING (no RSVP yet)
  │
  ├── Invitation sent → InvitationLog created
  │
  ├── Guest opens link → Guest.viewedAt updated
  │
  ├── Guest submits RSVP → Guest.rsvpStatus = ATTENDING/DECLINED/PARTIAL
  │
  └── Couple marks as "reminded" → re-send invitation
```

### 14.2 CSV Import Format

```csv
name,email,phone,group
"John Smith","john@example.com","+6591234567","family"
"Jane Doe","jane@example.com","","friends"
```

### 14.3 Guest List Features (Phase 1)

- Add single guest (name, email, phone, group)
- Bulk import via CSV
- Search by name/email
- Filter by group, RSVP status
- Sort by name, status, invitation date
- Export guest list + RSVP status as CSV

### 14.4 Guest List Features (Phase 2)

- Seating plan (table assignment, drag-drop)
- +1 management (allow guests to bring plus-ones)
- Dietary summary report
- Group messaging (send to all "family" guests)
- QR code per guest (personalized scan-in)

---

## 15. Notification Engine

### 15.1 Notification Types

| Trigger | Channel | Template Key | To |
|---|---|---|---|
| Invitation sent | Email/SMS/WhatsApp | `invitation_email` / `invitation_sms` / `invitation_whatsapp` | Guest |
| RSVP received | Email | `rsvp_notification` | Couple |
| New wish submitted | Email | `wish_notification` | Couple |
| New contact inquiry | Email | `contact_notification` | Couple + Dreamweavers |
| RSVP reminder | Email/SMS | `rsvp_reminder` | Guest (pending) |
| Wedding day reminder | Email/SMS | `wedding_reminder` | Guest (attending) |
| Account published | Email | `account_published` | Couple |
| Account suspended | Email | `account_suspended` | Couple |

### 15.2 Template Variables

```handlebars
{{coupleName}}       → "Eleanor & James"
{{guestName}}        → "John Smith"
{{date}}             → "December 25, 2027"
{{time}}             → "4:00 PM"
{{venueName}}        → "The Singapore EDITION"
{{venueAddress}}     → "38 Cuscaden Road, Singapore 249731"
{{invitationUrl}}    → "https://dreamweavers.events/eleanor-james-2027"
{{rsvpUrl}}          → "https://dreamweavers.events/eleanor-james-2027#rsvp"
{{brideName}}        → "Eleanor"
{{groomName}}        → "James"
```

### 15.3 Implementation (MVP)

```
Notification Service (internal module)
  ├── templateEngine.render(templateKey, variables) → HTML/text
  ├── emailChannel.send(to, subject, html) → SMTP (Resend/SendGrid)
  ├── smsChannel.send(to, text) → Twilio (Phase 2)
  ├── whatsappChannel.send(to, template) → WhatsApp API (Phase 2)
  └── queue.process() → process pending notifications in order
```

**MVP**: Email only via Resend (simple, reliable, generous free tier)
**Phase 2**: Add SMS (Twilio) and WhatsApp (Meta API)

---

## 16. Analytics Architecture

### 16.1 Tracked Events

| Event | Properties | Source |
|---|---|---|
| `invitation_viewed` | accountId, guestId?, referrer | Guest page load |
| `rsvp_submitted` | accountId, partySize, attendance | RSVP form |
| `wish_submitted` | accountId | Wishes form |
| `contact_submitted` | accountId | Contact form |
| `section_viewed` | accountId, section | Navigation |
| `honeymoon_voted` | accountId, destinationId | Story page |
| `invitation_opened` | accountId, guestId | Email tracking pixel |
| `invitation_clicked` | accountId, guestId | Email link tracking |

### 16.2 Analytics Storage (MVP)

```prisma
model AnalyticsEvent {
  id          String   @id @default(cuid())
  accountId   String
  eventType   String
  properties  String   // JSON
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([accountId, eventType, createdAt])
}
```

**MVP**: Store events in PostgreSQL, aggregate via SQL queries.
**Phase 2**: Stream to ClickHouse or BigQuery for real-time dashboards.

### 16.3 Couple Dashboard Metrics

| Metric | Calculation |
|---|---|
| Total invited | `COUNT(Guest)` |
| Invitations sent | `COUNT(InvitationLog WHERE status != 'failed')` |
| Invitations opened | `COUNT(Guest WHERE viewedAt IS NOT NULL)` |
| RSVPs received | `COUNT(RSVPSubmission)` |
| Attending | `COUNT(Guest WHERE rsvpStatus = 'ATTENDING')` |
| Declined | `COUNT(Guest WHERE rsvpStatus = 'DECLINED')` |
| Pending | `COUNT(Guest WHERE rsvpStatus = 'PENDING')` |
| Wishes received | `COUNT(Wish)` |
| Page views (7d) | `COUNT(AnalyticsEvent WHERE eventType='invitation_viewed' AND createdAt > NOW() - 7d)` |

---

## 17. Security Architecture

### 17.1 Authentication

```
Master CMS:  Credentials (email + password) → NextAuth.js JWT
Couple CMS:  Credentials (email + password) → NextAuth.js JWT
Guest:       No auth — access via public invitation URL (slug-based)
```

### 17.2 Authorization Layers

```
Layer 1: Route Middleware
  → Check JWT validity
  → Extract { userId, accountId, role }
  → Redirect unauthenticated to login

Layer 2: API Route Guards
  → Verify role has permission for action
  → Platform roles can access any account
  → Account roles can only access own accountId

Layer 3: Prisma Tenant Extension
  → Auto-inject weddingAccountId into all queries
  → Prevents cross-tenant data leakage

Layer 4: Rate Limiting
  → Guest API: 10 req/min per IP
  → CMS API: 100 req/min per user
  → Admin API: 200 req/min per user
```

### 17.3 Security Measures

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt (via NextAuth adapter) |
| JWT expiry | 24 hours (CMS), 7 days (remember me) |
| CSRF protection | NextAuth CSRF token |
| XSS prevention | React auto-escapes; sanitize user content |
| SQL injection | Prisma parameterized queries |
| File upload | Validate MIME type, size limit, scan for malware |
| Rate limiting | Upstash Redis (or in-memory for MVP) |
| CORS | Restrict to platform domains only |
| HTTPS | Enforced in production |
| Content Security Policy | Strict CSP headers |
| Input sanitization | Zod validation on all API inputs |
| Audit logging | All write operations logged |

### 17.4 Password-Protected Invitations (Feature Toggle)

When `password_protect` is enabled:
```
Guest opens /eleanor-james-2027
  → Check if account has password
  → Show password entry screen
  → On correct password: set encrypted cookie
  → On subsequent visits: cookie bypasses password screen
```

---

## 18. API Architecture

### 18.1 Route Structure

```
/api/
├── auth/                     # NextAuth.js handlers
│   ├── [...nextauth]/route.ts
│   └── register/route.ts     # Couple registration
├── content/                  # Guest-facing content API
│   ├── route.ts              # GET: load ContentBundle by slug
│   └── features/route.ts     # GET: feature toggle states
├── rsvp/route.ts             # POST: submit RSVP
├── wishes/route.ts           # POST: submit wish, GET: list wishes
├── contact/route.ts          # POST: submit contact form
├── honeymoon-vote/route.ts   # POST: submit honeymoon vote
├── admin/                    # Master CMS API (platform role required)
│   ├── route.ts              # GET: dashboard stats
│   ├── accounts/route.ts     # CRUD: wedding accounts
│   ├── features/route.ts     # CRUD: feature catalog
│   ├── templates/route.ts    # CRUD: notification templates
│   └── audit-logs/route.ts   # GET: audit trail
└── cms/                      # Couple CMS API (account role required)
    ├── content/route.ts      # GET/PUT: wedding content
    ├── schedule/route.ts     # CRUD: schedule events
    ├── milestones/route.ts   # CRUD: story milestones
    ├── tidbits/route.ts      # CRUD: story tidbits
    ├── photos/route.ts       # CRUD: moment photos
    ├── wish-cards/route.ts   # CRUD: pre-seeded wish cards
    ├── faqs/route.ts         # CRUD: FAQ items
    ├── transport/route.ts    # GET/PUT: transport info
    ├── destinations/route.ts # CRUD: honeymoon destinations
    ├── guests/route.ts       # CRUD: guest list
    ├── guests/import/route.ts # POST: CSV import
    ├── guests/export/route.ts # GET: CSV export
    ├── rsvps/route.ts        # GET: view submissions
    ├── wishes/route.ts       # GET/PUT: manage wishes (approve/feature)
    ├── contacts/route.ts     # GET: view inquiries
    ├── invitations/route.ts  # POST: send invitations
    ├── upload/route.ts       # POST: file upload
    └── settings/route.ts     # GET/PUT: account settings
```

### 18.2 API Design Principles

- **RESTful** for MVP (simple, well-understood)
- **tRPC** for Phase 2 (end-to-end type safety)
- **Zod validation** on every endpoint
- **Tenant isolation** via Prisma extension
- **Consistent response format**:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string, details?: ZodError }

// List
{ success: true, data: T[], pagination: { page, limit, total } }
```

### 18.3 File Upload API

```
POST /api/cms/upload
Content-Type: multipart/form-data
Body: { file, folder: "hero" | "banner" | "gallery" | "story" | "venue" | "logo" }

Response: { success: true, url: "/uploads/eleanor-james-2027/hero-abc123.jpg" }

Validation:
  - Max file size: 10MB (configurable per account)
  - Allowed types: image/jpeg, image/png, image/webp
  - Total storage: checked against account.maxStorageBytes
```

---

## 19. UI/UX Wireframe Descriptions

### 19.1 Master CMS — Dashboard

```
┌──────────────────────────────────────────────────────────┐
│ ☰ DREAMWEAVERS                              🔔 Admin ▾  │
├──────────┬───────────────────────────────────────────────┤
│          │  Dashboard                                     │
│ Dashboard│                                                │
│ Accounts │  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│ Templates│  │ Active   │ │ Pending  │ │ RSVP Rate    │  │
│ Features │  │ Weddings │ │ Setup    │ │ (Avg)        │  │
│ Content  │  │ 42       │ │ 8        │ │ 73%          │  │
│ Analytics│  └──────────┘ └──────────┘ └──────────────┘  │
│ Support  │                                                │
│ Settings │  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│          │  │ Wishes   │ │ Storage  │ │ Support      │  │
│          │  │ 1,204    │ │ 4.2 GB   │ │ 3 Open       │  │
│          │  └──────────┘ └──────────┘ └──────────────┘  │
│          │                                                │
│          │  Recent Activity                               │
│          │  ┌──────────────────────────────────────────┐  │
│          │  │ 2m ago  Eleanor & James published       │  │
│          │  │ 15m ago New RSVP from John Smith        │  │
│          │  │ 1h ago  Sophie & Liam completed setup   │  │
│          │  │ 2h ago  Account created: Tan & Wei      │  │
│          │  └──────────────────────────────────────────┘  │
└──────────┴───────────────────────────────────────────────┘
```

### 19.2 Master CMS — Account List

```
┌──────────────────────────────────────────────────────────┐
│  All Weddings                        [+ Create Account]  │
├──────────────────────────────────────────────────────────┤
│ Search: [________________]  Status: [All ▾]  Sort: [Newest ▾]│
├──────────────────────────────────────────────────────────┤
│ ☐ │ Couple              │ Date       │ Status  │ RSVP  │
│───┼─────────────────────┼────────────┼─────────┼───────│
│ ☐ │ Eleanor & James     │ Dec 25 '27 │ 🟢 Live │ 73%   │
│ ☐ │ Sophie & Liam       │ Mar 15 '27 │ 🟡 Draft│ —     │
│ ☐ │ Tan & Wei           │ Jun 8 '27  │ 🟢 Live │ 89%   │
│ ☐ │ Priya & Arjun       │ Sep 22 '27 │ 🔴 Susp.│ 45%   │
│───┴─────────────────────┴────────────┴─────────┴───────│
│ Showing 1-4 of 50          [← Prev] [1] [2] [3] [Next →]│
└──────────────────────────────────────────────────────────┘
```

### 19.3 Couple CMS — Setup Wizard (Step 1)

```
┌──────────────────────────────────────────────────────────┐
│  ✦ DREAMWEAVERS                                         │
├──────────────────────────────────────────────────────────┤
│                                                        │
│   Step 1 of 7                              [Skip Tour]  │
│                                                        │
│   ┌──────────────────────────────────────────────┐     │
│   │  ● ○ ○ ○ ○ ○ ○                                │     │
│   │  1  2  3  4  5  6  7                           │     │
│   └──────────────────────────────────────────────┘     │
│                                                        │
│   The Couple                                           │
│                                                        │
│   What should we call you?                             │
│                                                        │
│   Partner 1 *                                          │
│   ┌──────────────────────────────────────────────────┐ │
│   │ Eleanor                                          │ │
│   └──────────────────────────────────────────────────┘ │
│                                                        │
│   Partner 2 *                                          │
│   ┌──────────────────────────────────────────────────┐ │
│   │ James                                            │ │
│   └──────────────────────────────────────────────────┘ │
│                                                        │
│   Wedding Date *                                       │
│   ┌──────────────────────────────────────────────────┐ │
│   │ 📅  December 25, 2027                           │ │
│   └──────────────────────────────────────────────────┘ │
│                                                        │
│   Wedding Time *                                       │
│   ┌──────────────────────────────────────────────────┐ │
│   │ 🕐  4:00 PM                                    │ │
│   └──────────────────────────────────────────────────┘ │
│                                                        │
│                          [Cancel]  [Continue →]        │
└──────────────────────────────────────────────────────────┘
```

### 19.4 Couple CMS — Content Editor (Schedule)

```
┌──────────────────────────────────────────────────────────┐
│  ✦ ELEANOR & JAMES                                     │
├──────────┬───────────────────────────────────────────────┤
│          │  Edit: Schedule                    [Preview]  │
│ Overview │                                                │
│ Content  │  Your celebration timeline                    │
│ ├── Home │                                                │
│ ├── Sched│  ┌──────────────────────────────────────────┐ │
│ ├── Story│  │ ⏰ 4:00 PM  │ The Ceremony           [↕] │ │
│ ├── Momen│  │   Join us as we exchange our vows...  [✏] │ │
│ ├── Wishe│  │   Tag: Formal Attire                  [🗑] │ │
│ ├── Get T│  ├──────────────────────────────────────────┤ │
│ ├── Q&A  │  │ ⏰ 5:30 PM  │ Cocktail Hour          [↕] │ │
│ Branding│  │   Enjoy signature drinks...           [✏] │ │
│ Guests  │  ├──────────────────────────────────────────┤ │
│ RSVPs   │  │ ⏰ 7:00 PM  │ Dinner & Dancing        [↕] │ │
│ Wishes  │  │   A seated dinner followed by...      [✏] │ │
│ Messages│  └──────────────────────────────────────────┘ │
│ Settings│                                                │
│          │  [+ Add Event]                                │
│          │                                                │
│          │  Venue Information                             │
│          │  ┌──────────────────────────────────────────┐ │
│          │  │ Venue Name: [The Singapore EDITION    ] │ │
│          │  │ Description: [Nestled in the heart...  ] │ │
│          │  │ Venue Photo: [📷 Upload]                 │ │
│          │  └──────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────┘
```

### 19.5 Couple CMS — Live Preview

```
┌──────────────────────────────────────────────────────────┐
│  ✦ ELEANOR & JAMES                                     │
├──────────┬───────────────────────────────────────────────┤
│          │                    📱 Desktop  │  📱 Mobile  │
│ Overview │                                                │
│ Content  │  ┌──────────────────────────────────────────┐ │
│ ...      │  │                                          │ │
│          │  │     Live preview of the guest-facing    │ │
│          │  │     invitation renders here. Changes     │ │
│          │  │     reflect in real-time.               │ │
│          │  │                                          │ │
│          │  │     (iframe or server-rendered preview)  │ │
│          │  │                                          │ │
│          │  └──────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────┘
```

---

## 20. MVP Roadmap & Enterprise Expansion

### Phase 0: Foundation (Current → Week 2)

**Goal:** Convert existing hardcoded frontend to CMS-driven

- [ ] Add `weddingAccountId` (tenant ID) to all existing Prisma models
- [ ] Create `WeddingAccount`, `WeddingContent`, and all content models
- [ ] Build slug-based routing: `/[slug]` loads content from CMS
- [ ] Build `GET /api/content?slug=` endpoint
- [ ] Refactor all page components to read from `ContentBundle` (Zustand store)
- [ ] Create seed script: populate CMS with current hardcoded content
- [ ] Verify: existing invitation looks identical, but all data comes from DB

### Phase 1: Couple CMS — MVP (Weeks 2–4)

**Goal:** Couples can manage all their wedding content

- [ ] NextAuth.js setup: couple login/registration
- [ ] Couple CMS layout: sidebar navigation
- [ ] Setup wizard: 7-step guided onboarding
- [ ] Content editor pages: Home, Schedule, Story, Moments, Wishes, Getting There, Q&A
- [ ] File upload: hero, banner, gallery, story, venue images
- [ ] Guest list: add/edit/search/import CSV
- [ ] RSVP tracker: view submissions, filter by status
- [ ] Wishes management: approve/feature guest wishes
- [ ] Feature toggle framework: enable/disable sections
- [ ] Live preview: see changes in real-time
- [ ] Basic notification: email on RSVP/wish/contact

### Phase 2: Master CMS (Weeks 4–6)

**Goal:** Dreamweavers has full platform control

- [ ] Platform authentication: PLATFORM_OWNER, PLATFORM_ADMIN, PLATFORM_SUPPORT
- [ ] Account CRUD: create, view, suspend, archive weddings
- [ ] Feature catalog management: add/edit features
- [ ] Per-account feature assignment
- [ ] Platform analytics dashboard
- [ ] Audit logging
- [ ] Notification template management
- [ ] Support ticket view (basic)

### Phase 3: Guest Engagement (Weeks 6–8)

**Goal:** Robust invitation delivery and guest experience

- [ ] Invitation sending: email (Resend), SMS (Twilio), WhatsApp (Meta API)
- [ ] QR code generation per guest
- [ ] RSVP reminder automation (cron)
- [ ] Honeymoon voting (persist to DB)
- [ ] Password-protected invitations (feature toggle)
- [ ] Custom domain support (feature toggle)
- [ ] Email tracking: opened, clicked

### Phase 4: Enterprise (Weeks 8–12)

**Goal:** Scale to multi-tenant production

- [ ] Migrate SQLite → PostgreSQL
- [ ] Implement Row-Level Security
- [ ] Redis caching for content delivery
- [ ] CDN for media assets (Cloudflare R2)
- [ ] Seating plan editor (drag-drop tables)
- [ ] Advanced analytics (ClickHouse / BigQuery)
- [ ] White-label settings
- [ ] API rate limiting (Upstash)
- [ ] Automated backups
- [ ] Performance optimization (edge caching, ISR)

### Phase 5: Platform Expansion (Months 3–6)

**Goal:** Support multiple event types

- [ ] Event type templates: birthday, corporate, anniversary, baby shower, funeral
- [ ] Per-event-type content models (extensible)
- [ ] Theme marketplace
- [ ] Billing / subscription management (Stripe)
- [ ] Multi-language support (i18n)
- [ ] Couple CMS mobile app (React Native)
- [ ] Public API for third-party integrations
- [ ] Webhook system for event notifications

### Phase 6: AI Features (Months 6+)

**Goal:** AI-powered content assistance

- [ ] AI copywriting: suggest invitation wording, story narratives
- [ ] AI image enhancement: auto-crop, retouch uploaded photos
- [ ] Smart RSVP follow-up: AI-suggested reminder timing
- [ ] Guest sentiment analysis on wishes
- [ ] AI seating optimization (dietary, family proximity)
- [ ] Voice-to-text for story input
- [ ] Auto-translation for multilingual guests

---

## Appendix A: Technology Decisions Log

| Decision | Options Considered | Chosen | Why |
|---|---|---|---|
| DB (MVP) | SQLite, PostgreSQL, MongoDB | SQLite | Zero-config, perfect for single-tenant dev |
| DB (Prod) | PostgreSQL, MySQL, MongoDB | PostgreSQL | RLS, JSON support, Prisma's best DB |
| ORM | Prisma, Drizzle, TypeORM | Prisma | Already in use, type-safe, great DX |
| Auth | NextAuth, Clerk, Auth0 | NextAuth | Already available, self-hosted, free |
| API Style | REST, tRPC, GraphQL | REST → tRPC | REST for MVP simplicity, tRPC for type safety |
| Storage | S3, Cloudflare R2, Uploadthing | Uploadthing (MVP) → R2 | Easy Next.js integration |
| Email | Resend, SendGrid, Mailgun | Resend | Simplest API, great DX, React Email |
| SMS | Twilio, Vonage, SNS | Twilio | Most reliable, best docs |
| State | Zustand, Jotai, Redux | Zustand | Already in use, lightweight |
| Caching | Redis, Memcached, in-memory | In-memory (MVP) → Redis | Zero-config start, Redis for scale |
| Deployment | Vercel, AWS, Railway | Vercel (MVP) → AWS | Zero-config Next.js deploy |

---

## Appendix B: Risk Register

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Cross-tenant data leak | Critical | Low | Prisma extension + RLS + audit logs |
| File upload abuse | High | Medium | MIME validation, size limits, virus scan |
| Email delivery failure | Medium | Medium | Queue with retry, fallback provider |
| Performance at scale | High | Medium | Redis caching, CDN, DB indexing |
| Content loss | Critical | Low | Automated daily backups, soft deletes |
| Guest spam (RSVP/wishes) | Medium | High | Rate limiting, CAPTCHA, moderation queue |

---

*End of Blueprint v1.0*