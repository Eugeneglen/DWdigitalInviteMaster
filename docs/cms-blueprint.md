# Dreamweavers CMS Implementation Blueprint

> **Multi-Tenant SaaS Wedding CMS Platform**
> Stack: Next.js 16 · Prisma (SQLite) · Zustand · Tailwind CSS 4 · shadcn/ui
>
> Sections 1–10 of 20 · Part 1: Architecture, Data Model & Content Mapping

---

## Table of Contents (Part 1)

| # | Section | Scope |
|---|---------|-------|
| 1 | [Overall SaaS Architecture](#section-1-overall-saas-architecture) | 4-tier system design, deployment, data flow |
| 2 | [Information Architecture](#section-2-information-architecture) | Content taxonomy, hierarchy, media management |
| 3 | [Master CMS Navigation (Dreamweavers PTL)](#section-3-master-cms-navigation-dreamweavers-ptl) | Platform admin portal structure |
| 4 | [Wedding Couple CMS Navigation](#section-4-wedding-couple-cms-navigation) | Couple workspace structure |
| 5 | [User Roles & Permission Matrix](#section-5-user-roles--permission-matrix) | RBAC design with full permission matrix |
| 6 | [Multi-Tenant Architecture](#section-6-multi-tenant-architecture) | Tenant isolation, middleware, provisioning |
| 7 | [Database Schema & Entity Relationships](#section-7-database-schema--entity-relationships) | Complete Prisma schema |
| 8 | [Feature Toggle Framework](#section-8-feature-toggle-framework) | Feature flags, dependencies, defaults |
| 9 | [Dynamic Content Model](#section-9-dynamic-content-model) | JSON content blocks, validation, rendering |
| 10 | [Frontend-to-CMS Field Mapping](#section-10-frontend-to-cms-field-mapping) | Complete hardcoded field inventory |

---

## Section 1: Overall SaaS Architecture

### 1.1 The Four-Tier Architecture

The Dreamweavers platform is organized into four distinct, layered tiers, each with clear boundaries and responsibilities:

```
┌──────────────────────────────────────────────────────────────────┐
│                    TIER 1: PLATFORM LAYER                        │
│  Dreamweavers PTL — Master Admin, Billing, Global Config         │
│  Users: Platform Super Admin, Platform Support                   │
├──────────────────────────────────────────────────────────────────┤
│                    TIER 2: ACCOUNT LAYER                         │
│  Wedding Accounts — Tenant Root, Quotas, Feature Flags           │
│  Users: Account Owner (Couple), Account Editor                   │
├──────────────────────────────────────────────────────────────────┤
│                    TIER 3: CMS LAYER                             │
│  Content Management — Pages, Sections, Blocks, Media             │
│  Workflow: Edit → Preview → Publish                              │
├──────────────────────────────────────────────────────────────────┤
│                    TIER 4: GUEST LAYER                           │
│  Public-Facing Frontend — SPA, RSVP, Wishes, Contact             │
│  Users: Wedding Guests (read-only + UGC submission)              │
└──────────────────────────────────────────────────────────────────┘
```

| Tier | Responsibility | URL Pattern | Auth Required |
|------|---------------|-------------|---------------|
| **Platform** | Master admin portal, global settings, account CRUD, billing, platform analytics | `app.dreamweavers.events/admin/*` | Platform session (NextAuth) |
| **Account** | Wedding account settings, member management, feature toggles, theme config | `app.dreamweavers.events/admin/[accountId]/*` | Account session |
| **CMS** | Content editing, media library, guest management, preview/publish workflow | `app.dreamweavers.events/dashboard/[slug]/*` | Account session |
| **Guest** | Public wedding site, RSVP, wishes, contact, legal documents | `[weddingSlug].dreamweavers.events/*` | None (public) |

### 1.2 Single-Tenant to Multi-Tenant Transformation

The existing application is a single-tenant, hardcoded SPA. The transformation follows this migration path:

| Aspect | Current State (Single-Tenant) | Target State (Multi-Tenant) |
|--------|------------------------------|-----------------------------|
| **Content** | Hardcoded strings/URLs in 8 page components | CMS-managed content blocks stored in DB |
| **Navigation** | Static `NAV_ITEMS` array in `Header.tsx` | Dynamic nav driven by `ContentPage` records + feature flags |
| **Data** | 4 models, no `weddingId` scoping | All models gain `weddingId` FK; Prisma middleware auto-scopes |
| **Auth** | None | NextAuth v4 with JWT strategy; 5 role types |
| **Routing** | Single `page.tsx` with Zustand section switching | Subdomain/hostname-based tenant resolution → same SPA renderer |
| **Media** | External URLs (Google, ChatGLM CDN) | `MediaAsset` model + local storage + signed URLs |
| **APIs** | 5 public endpoints, no auth | Scoped by tenant; CMS APIs protected; guest APIs rate-limited |

**Key principle:** The existing SPA rendering engine (Zustand-driven section switching via `useNavigationStore`) remains intact. Only the *source* of content changes — from hardcoded constants to API-fetched CMS content blocks hydrated into the same component tree.

### 1.3 Master Admin Portal vs. Couple Workspace

```
┌─────────────────────────────────────────────────────┐
│  DREAMWEAVERS PTL (Platform Admin)                  │
│  URL: app.dreamweavers.events/admin                  │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Dashboard   │  │ Wedding      │  │ Platform   │ │
│  │ (global     │  │ Accounts     │  │ Content    │ │
│  │  metrics)   │  │ (CRUD,       │  │ (templates,│ │
│  │             │  │  status)     │  │  legal,    │ │
│  └─────────────┘  └──────────────┘  │  defaults) │ │
│                                     └────────────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Features    │  │ User         │  │ Analytics  │ │
│  │ (flags,     │  │ Management   │  │ & Reports  │ │
│  │  plans)     │  │ (platform    │  │            │ │
│  │             │  │  admins)     │  │            │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────┘
                        │
                        │ creates/manages
                        ▼
┌─────────────────────────────────────────────────────┐
│  COUPLE WORKSPACE (Account CMS)                     │
│  URL: app.dreamweavers.events/dashboard/[slug]      │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Dashboard   │  │ Content      │  │ Media      │ │
│  │ (wedding    │  │ Editor       │  │ Library    │ │
│  │  metrics)   │  │ (8 pages)    │  │ (uploads)  │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Guest       │  │ Wishes &     │  │ Settings   │ │
│  │ Management  │  │ Messages     │  │ (theme,    │ │
│  │ (invites,   │  │ (moderation) │  │  details)  │ │
│  │  RSVPs)     │  │              │  │            │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
│  ┌─────────────┐                                    │
│  │ Preview &   │                                    │
│  │ Publish     │                                    │
│  └─────────────┘                                    │
└─────────────────────────────────────────────────────┘
                        │
                        │ published content
                        ▼
┌─────────────────────────────────────────────────────┐
│  GUEST-FACING SITE (Public Frontend)                │
│  URL: [slug].dreamweavers.events                     │
│  Same SPA renderer, content from CMS API             │
└─────────────────────────────────────────────────────┘
```

### 1.4 Technology Choices & Rationale

| Technology | Role | Rationale |
|-----------|------|-----------|
| **Next.js 16** | Full-stack framework | Already in use; App Router for CMS admin routes, same codebase for guest site |
| **Prisma + SQLite** | ORM + Database | Already in use; SQLite is sufficient for SaaS at this scale; zero-ops; single-file DB simplifies backups |
| **Zustand** | Client state management | Already in use; lightweight; holds navigation state + CMS content cache |
| **shadcn/ui** | Component library | 48 components already installed; provides all form/table/dialog primitives for CMS |
| **next-auth@4** | Authentication | Already installed (unused); JWT strategy; supports multiple session types (platform vs account) |
| **@tanstack/react-query** | Server state | Already installed (unused); perfect for CMS data fetching, cache invalidation, optimistic updates |
| **Zod** | Validation | Already in use; shared schemas between frontend forms and API routes |
| **@mdxeditor/editor** | Rich text editing | Already installed (unused); for richtext content blocks |
| **@dnd-kit** | Drag & drop | Already installed (unused); for reordering sections, gallery items, timeline milestones |
| **recharts** | Charts | Already installed (unused); for platform and wedding analytics dashboards |
| **next-intl** | i18n | Already installed (unused); future-proofing for multi-language CMS content |

**Why NOT add new dependencies:** Every capability needed is already present in `package.json`. The CMS implementation consumes zero new packages.

### 1.5 Deployment Architecture (Monorepo)

```
dreamweavers/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Guest-facing SPA entry (existing)
│   │   ├── layout.tsx                  # Root layout (existing)
│   │   ├── (guest)/                    # Guest-facing route group (existing pages)
│   │   ├── (platform)/                 # NEW: Platform admin routes
│   │   │   └── admin/
│   │   │       ├── layout.tsx          # Platform admin layout + auth
│   │   │       ├── page.tsx            # Platform dashboard
│   │   │       ├── accounts/
│   │   │       │   ├── page.tsx        # Account list
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx    # Account detail
│   │   │       ├── content/            # Platform content management
│   │   │       ├── features/           # Feature flag management
│   │   │       ├── users/              # Platform user management
│   │   │       ├── analytics/          # Platform analytics
│   │   │       ├── settings/           # System settings
│   │   │       └── audit-logs/         # Audit trail
│   │   ├── (cms)/                      # NEW: Couple CMS routes
│   │   │   └── dashboard/
│   │   │       └── [slug]/
│   │   │           ├── layout.tsx      # CMS layout + account auth
│   │   │           ├── page.tsx        # Wedding dashboard
│   │   │           ├── content/        # Content editor (per page)
│   │   │           ├── media/          # Media library
│   │   │           ├── guests/         # Guest management
│   │   │           ├── wishes/         # Wishes moderation
│   │   │           ├── settings/       # Wedding settings
│   │   │           └── preview/        # Live preview
│   │   └── api/
│   │       ├── rsvp/route.ts           # EXISTING (extend with weddingId)
│   │       ├── wishes/route.ts         # EXISTING (extend with weddingId)
│   │       ├── contact/route.ts        # EXISTING (extend with weddingId)
│   │       ├── admin/route.ts          # EXISTING (becomes CMS API)
│   │       └── (cms)/                  # NEW: Protected CMS API routes
│   │           ├── content/            # Content CRUD
│   │           ├── media/              # Media upload/management
│   │           ├── guests/             # Guest CRUD
│   │           ├── accounts/           # Account management
│   │           └── platform/           # Platform admin API
│   ├── components/
│   │   ├── wedding/                    # EXISTING: Guest-facing components
│   │   ├── cms/                        # NEW: CMS admin components
│   │   └── ui/                         # EXISTING: 48 shadcn/ui components
│   ├── store/                          # Zustand stores
│   │   ├── useNavigationStore.ts       # EXISTING
│   │   ├── useContentStore.ts          # NEW: CMS content state
│   │   └── useAuthStore.ts             # NEW: Auth state
│   ├── lib/
│   │   ├── db.ts                       # EXISTING: Prisma client
│   │   ├── auth.ts                     # NEW: NextAuth config
│   │   ├── tenant.ts                   # NEW: Tenant resolution
│   │   └── permissions.ts              # NEW: Permission checking
│   └── hooks/                          # Custom hooks
├── prisma/
│   └── schema.prisma                   # EXTEND: New models
└── public/
    └── uploads/                        # NEW: Local media storage
```

### 1.6 SPA Sections as CMS-Driven Templates

The existing 8 SPA sections become *template pages* managed by the CMS. Each page is a `ContentPage` record with associated `ContentSection` and `ContentBlock` records. The rendering pipeline remains identical — only the data source changes:

```
BEFORE (Hardcoded):
  Component → const HERO_IMG = 'https://...' → <img src={HERO_IMG} />

AFTER (CMS-driven):
  API: GET /api/content/home?slug=eleanor-james
  → { blocks: [{ key: 'heroImage', type: 'image', value: 'https://...' }] }
  → Zustand store (useContentStore)
  → Component → const heroImage = useContentBlock('heroImage') → <img src={heroImage} />
```

### 1.7 Data Flow: CMS Content → API → Frontend Rendering

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌─────────────┐
│  CMS Editor │────▶│  CMS API     │────▶│  SQLite (Prisma) │────▶│  Guest API  │
│  (Couple    │ PUT │  /api/cms/   │ SQL │  ContentBlock    │ GET │  /api/      │
│   Workspace)│     │  content/*   │     │  ContentSection  │     │  content/*  │
└─────────────┘     └──────────────┘     │  ContentPage     │     └──────┬──────┘
                                          │  MediaAsset      │            │
                                          └──────────────────┘            │
                                                                          ▼
                                                                 ┌─────────────────┐
                                                                 │  Guest Frontend │
                                                                 │  (React Query    │
                                                                 │   → Zustand      │
                                                                 │   → Components)  │
                                                                 └─────────────────┘
```

**Publishing model:** Content is always editable in draft state. The "Publish" action snapshots current content as the live version. Guest API serves only published content.

---

## Section 2: Information Architecture

### 2.1 Content Taxonomy

All content in the platform falls into three categories:

| Category | Owner | Mutability | Examples |
|----------|-------|------------|----------|
| **Global Platform Content** | Dreamweavers (platform) | Platform admin only | Legal documents, default templates, system emails, platform branding |
| **Per-Wedding Content** | Wedding Account (couple) | CMS editor | Page text, images, timeline items, FAQs, venue info, couple names |
| **Guest-Generated Content (UGC)** | Wedding Guests | Guest-facing forms; moderated by couple | RSVPs, wishes/messages, contact submissions, honeymoon votes |

### 2.2 Content Types Hierarchy

```
Wedding Account (Tenant Root)
├── ContentPage (8 pages per wedding)
│   ├── ContentSection (logical grouping within a page)
│   │   └── ContentBlock (individual editable field)
│   │       ├── key: string (unique within section)
│   │       ├── type: text | richtext | image | gallery | timeline-item |
│   │       │        | faq-item | venue-info | map-embed
│   │       ├── value: string | JSON (depending on type)
│   │       └── meta: { alt?, label?, required?, placeholder? }
│   └── Ordering: sortOrder integer
├── MediaAsset (uploaded files)
│   ├── Stored in /public/uploads/{weddingId}/
│   └── Referenced by ContentBlock value (URL or mediaId)
└── FeatureFlag (per-wedding toggles)
```

### 2.3 Content Model for Each of the 8 Existing Pages

#### 2.3.1 HomePage (`home`)

| Section | Block Key | Type | Current Hardcoded Value |
|---------|-----------|------|------------------------|
| banner | `coupleName` | text | `"Eleanor & James"` |
| banner | `bannerImage` | image | `https://lh3.googleusercontent.com/...` (BANNER_BG) |
| hero | `weddingDate` | text | `"December 25, 2027"` |
| hero | `weddingDateIso` | text | `"2027-12-25T16:00:00"` |
| hero | `heroImage` | image | `https://lh3.googleusercontent.com/...` (HERO_IMG) |
| hero | `heroDescription` | text | `"Together with their families, request the pleasure of your company"` |
| hero | `heroAltText` | text | `"Hero Wedding Portrait"` |
| countdown | `scrollIndicatorText` | text | `"Scroll"` |
| teaCeremony | `teaCeremonyLabel` | text | `"The Tradition"` |
| teaCeremony | `teaCeremonyTitle` | text | `"The Tea Ceremony"` |
| teaCeremony | `teaCeremonyImage` | image | `https://lh3.googleusercontent.com/...` (TEA_IMG) |
| teaCeremony | `teaCeremonyImageAlt` | text | `"The Tea Ceremony"` |
| narrative | `narrativeLabel` | text | `"The Prelude"` |
| narrative | `narrativeTitle` | text | `"Our Story Begins Here"` |
| narrative | `narrativeBody` | richtext | `"Every great romance is a narrative woven over time..."` |

#### 2.3.2 SchedulePage (`schedule`)

| Section | Block Key | Type | Current Hardcoded Value |
|---------|-----------|------|------------------------|
| banner | `pageTitle` | text | `"The Schedule"` |
| banner | `bannerImage` | image | `https://lh3.googleusercontent.com/...` (BANNER_BG) |
| intro | `ceremonyImage` | image | `https://lh3.googleusercontent.com/...` (CEREMONY_IMG) |
| intro | `celebrationImage` | image | `https://lh3.googleusercontent.com/...` (CELEBRATION_IMG) |
| intro | `dateLine` | text | `"Saturday, December 25, 2027"` |
| timeline | `timelineSectionTitle` | text | `"The Celebration"` |
| timeline | `timelineSectionDate` | text | `"December 25, 2027"` |
| timeline | `timelineItems` | timeline-item[] | 3 items (Ceremony, Cocktail, Dinner) — JSON array |
| actions | `addCalendarLabel` | text | `"Add to Calendar"` |
| actions | `directionsLabel` | text | `"Directions"` |
| calendar | `calendarTitle` | text | `"Eleanor & James Wedding"` |
| calendar | `calendarStart` | text | `"20271225T160000"` |
| calendar | `calendarEnd` | text | `"20271225T230000"` |
| calendar | `calendarDetails` | richtext | Multi-line event details |
| calendar | `calendarLocation` | text | `"The Grand Estate"` |
| venue | `venueLabel` | text | `"Wedding Venue"` |
| venue | `venueName` | text | `"The Singapore EDITION"` |
| venue | `venueDescription` | richtext | `"Nestled in the heart of Orchard Road..."` |
| venue | `venueImage` | image | `https://sfile.chatglm.cn/images-ppt/4adf4afbb9a2.jpg` |

#### 2.3.3 RSVPPage (`rsvp`)

| Section | Block Key | Type | Current Hardcoded Value |
|---------|-----------|------|------------------------|
| header | `headerTitle` | text | `"Eleanor & James"` |
| header | `venueAddress` | text | `"The Singapore EDITION, 38 Cuscaden Road"` |
| header | `venueCity` | text | `"Singapore 249731"` |
| step1 | `step1Title` | text | `"Enter your name to RSVP"` |
| step1 | `step1Subtitle` | text | `"You can respond for more guests in the following steps."` |
| step1 | `firstNameLabel` | text | `"First Name"` |
| step1 | `lastNameLabel` | text | `"Last Name"` |
| step2 | `step2Title` | text | `"How many people are in your party?"` |
| step2 | `step2Hint` | text | `"Include yourself and anyone attending with you."` |
| step3 | `step3Title` | text | `"Confirm each guest and their dietary needs."` |
| step3 | `step3Hint` | text | `"Dietary selections are optional."` |
| step3 | `guestNamePlaceholder` | text | `"Guest name"` |
| step3 | `addGuestLabel` | text | `"+ Add Another Guest"` |
| step3 | `dietaryOptions` | text[] | `["Halal", "Vegetarian", "No Seafood"]` — JSON array |
| step4 | `attendanceQuestion` | text | `"Will you be able to join us for our Wedding Solemnisation?"` |
| step4 | `attendanceOptions` | text[] | 3 options — JSON array |
| result | `allAttendingTitle` | text | `"Thank you"` |
| result | `allAttendingMessage` | text | `"Your RSVP has been received. We can't wait to celebrate with you."` |
| result | `allDeclinedTitle` | text | `"We'll Miss You"` |
| result | `mixedTitle` | text | `"Thank you"` |
| actions | `nextLabel` | text | `"Next"` |
| actions | `backLabel` | text | `"Back"` |
| actions | `continueLabel` | text | `"Continue"` |
| actions | `saveContinueLabel` | text | `"Save & Continue"` |

#### 2.3.4 GettingTherePage (`getting-there`)

| Section | Block Key | Type | Current Hardcoded Value |
|---------|-----------|------|------------------------|
| banner | `pageTitle` | text | `"Getting There"` |
| banner | `pageSubtitle` | text | `"The Singapore EDITION, Orchard"` |
| address | `addressLabel` | text | `"ADDRESS"` |
| address | `venueName` | text | `"The Singapore EDITION"` |
| address | `venueAddress` | text | `"38 Cuscaden Road, Singapore 249731"` |
| transit | `tabCarLabel` | text | `"BY CAR"` |
| transit | `tabTransitLabel` | text | `"PUBLIC TRANSIT"` |
| car | `parkingLabel` | text | `"PARKING"` |
| car | `parkingInfo` | richtext | Valet and basement car park info |
| car | `parkingConciergeNote` | text | `"Kindly inform the concierge that you are attending the Dreamweavers event."` |
| car | `airportLabel` | text | `"FROM THE AIRPORT"` |
| car | `airportInfo` | text | `"Via CTE / Orchard Road, the journey..."` |
| mrt | `mrtLabel` | text | `"MRT"` |
| mrt | `mrtStations` | venue-info[] | 2 stations (Orchard Blvd TE13, Orchard NS22/TE14) — JSON |
| bus | `busLabel` | text | `"BUS"` |
| bus | `busInfo` | richtext | Bus stop names and bus numbers |
| map | `mapLabel` | text | `"FIND YOUR WAY"` |
| map | `mapEmbedUrl` | map-embed | Google Maps embed URL |
| map | `mapSearchUrl` | text | Google Maps search URL |
| map | `openMapsLabel` | text | `"Open in Maps"` |

#### 2.3.5 StoryPage (`story`)

| Section | Block Key | Type | Current Hardcoded Value |
|---------|-----------|------|------------------------|
| banner | `pageTitle` | text | `"Our Story"` |
| hero | `heroIntro` | text | `"A narrative woven through time, capturing the moments that led us here."` |
| hero | `heroImage` | image | `https://lh3.googleusercontent.com/...` (HERO_IMG) |
| timeline | `milestones` | timeline-item[] | 2 milestones (First Chapter, Proposal) — JSON array |
| tidbits | `tidbitsTitle` | text | `"Tidbits"` |
| tidbits | `tidbitsSubtitle` | text | `"A few things you might not know."` |
| tidbits | `tidbits` | faq-item[] | 2 Q&A items — JSON array |
| honeymoon | `honeymoonLabel` | text | `"AFTER THE 'I DO'"` |
| honeymoon | `honeymoonTitle` | text | `"Where Next?"` |
| honeymoon | `honeymoonSubtitle` | text | `"Help us choose our honeymoon destination. Cast your vote!"` |
| honeymoon | `destinations` | text[] | `["Amalfi Coast", "Kyoto"]` — JSON array |
| honeymoon | `suggestPlaceholder` | text | `"Suggest a destination..."` |
| honeymoon | `submitLabel` | text | `"Submit"` |

#### 2.3.6 MomentsPage (`moments`)

| Section | Block Key | Type | Current Hardcoded Value |
|---------|-----------|------|------------------------|
| banner | `pageTitle` | text | `"Moments"` |
| intro | `introText` | text | `"The Journey Before the I Do—from childhood dreams to our first steps together."` |
| gallery | `photos` | gallery[] | 7 photos with alt + src — JSON array |

#### 2.3.7 WishesPage (`wishes`)

| Section | Block Key | Type | Current Hardcoded Value |
|---------|-----------|------|------------------------|
| banner | `pageTitle` | text | `"Wishes & Blessings"` |
| intro | `introLabel` | text | `"The Living Heirloom"` |
| intro | `introText` | text | `"A curated sanctuary of wisdom and love from those we cherish most."` |
| wishes | `prepopulatedWishes` | richtext[] | 5 pre-populated wish cards — JSON array |
| form | `formSectionLabel` | text | `"YOUR TURN"` |
| form | `formSectionTitle` | text | `"Contribute to the Heirloom"` |
| form | `fullNameLabel` | text | `"Full Name"` |
| form | `relationshipLabel` | text | `"Relationship"` |
| form | `messageLabel` | text | `"Your Message"` |
| form | `uploadText` | text | `"Attach a photo or memento"` |
| form | `uploadHint` | text | `"JPG, PNG, WebP up to 10MB"` |
| form | `submitLabel` | text | `"Weave into Archive"` |
| form | `submittingLabel` | text | `"Submitting..."` |
| form | `submittedLabel` | text | `"Woven"` |

#### 2.3.8 QAPage (`qa`)

| Section | Block Key | Type | Current Hardcoded Value |
|---------|-----------|------|------------------------|
| banner | `pageTitle` | text | `"Frequently Asked"` |
| intro | `introText` | text | `"Everything you need to know for our celebration."` |
| faqs | `faqs` | faq-item[] | 4 FAQ items — JSON array |
| cta | `ctaLabel` | text | `"NEED MORE HELP?"` |
| cta | `ctaTitle` | text | `"Still Seeking Clarity?"` |
| cta | `ctaDescription` | text | `"Our concierge is standing by to assist..."` |
| cta | `ctaButtonLabel` | text | `"Message the Couple"` |
| cta | `ctaEmail` | text | `"concierge@dreamweavers.events"` |

### 2.4 Media Asset Management Hierarchy

```
MediaAsset
├── id: String (cuid)
├── weddingId: String (FK → Account)
├── fileName: String
├── originalName: String
├── mimeType: String
├── size: Int (bytes)
├── width: Int? (extracted via sharp)
├── height: Int? (extracted via sharp)
├── url: String (/public/uploads/{weddingId}/{fileName})
├── alt: String? (CMS-editable)
├── folder: String? (organizational folder path)
├── uploadedById: String? (FK → User)
└── createdAt: DateTime
```

**Storage strategy:** Local filesystem under `public/uploads/{weddingId}/`. The `sharp` package (already installed) handles image processing (resize, format conversion). No external S3/cloud storage required at this stage.

### 2.5 User-Generated Content as a Separate Category

UGC is treated distinctly from CMS content — it is *not* managed through the content block system. Instead, it has dedicated models with moderation workflows:

| UGC Type | Model | Moderation | Display |
|----------|-------|------------|---------|
| RSVP Submissions | `RSVPSubmission` + `GuestResponse` | None (direct) | RSVP dashboard for couple |
| Wishes | `Wish` | Optional: `status` field (pending/approved/hidden) | Wishes page (approved only) |
| Contact Messages | `ContactSubmission` | None (direct) | Contact dashboard for couple |
| Honeymoon Votes | (stored in `ContentBlock` as JSON counter) | None | Story page (live count) |

### 2.6 Legal Document Management

Legal documents are platform-level content (Tier 1), not per-wedding:

| Document | Current Location | CMS Model |
|----------|-----------------|-----------|
| Privacy Policy | `src/lib/legal-content.tsx` | `LegalDocument` with `slug: 'privacy-policy'` |
| Terms of Service | `src/lib/legal-content.tsx` | `LegalDocument` with `slug: 'terms-of-service'` |
| Data Protection | `src/lib/legal-content.tsx` | `LegalDocument` with `slug: 'data-protection'` |

The `LegalDocument` model stores the full document content as JSON (matching the current TSX structure) and is served via API. Platform admins can edit legal documents; all weddings display the same versions.

---

## Section 3: Master CMS Navigation (Dreamweavers PTL)

The platform admin portal is the operational hub for Dreamweavers staff. Accessible at `app.dreamweavers.events/admin`.

### 3.1 Navigation Structure

```
PTL Admin
├── Dashboard
│   └── Overview (default landing page)
├── Wedding Accounts
│   ├── Account List
│   ├── Account Detail
│   │   ├── Overview
│   │   ├── Content (view couple's content)
│   │   ├── Members
│   │   ├── Activity Log
│   │   └── Danger Zone (suspend, delete)
│   └── Create New Account
├── Platform Content
│   ├── Content Templates
│   │   ├── Default Content per Page Type
│   │   └── Template Variants
│   ├── Legal Documents
│   │   ├── Privacy Policy
│   │   ├── Terms of Service
│   │   └── Data Protection
│   ├── Email Templates
│   │   ├── Welcome Email
│   │   ├── Invitation Email
│   │   └── System Notifications
│   └── Global Default Assets
│       └── Default images, icons, placeholder content
├── Feature Management
│   ├── Feature Flags (global on/off)
│   ├── Plan Definitions
│   │   ├── Free Tier
│   │   ├── Premium Tier
│   │   └── Custom Tier
│   └── Feature Dependency Rules
├── User Management
│   ├── Platform Admins
│   │   ├── Admin List
│   │   └── Create Admin
│   ├── Support Staff
│   │   ├── Staff List
│   │   └── Create Staff
│   └── Role Permissions
├── Analytics & Reporting
│   ├── Platform Overview
│   │   ├── Total Accounts (active/inactive/suspended)
│   │   ├── Total Guest Interactions
│   │   ├── Growth Trends
│   │   └── Revenue Metrics
│   ├── Per-Account Analytics
│   └── Export Reports
├── System Settings
│   ├── Email Configuration (SMTP)
│   ├── SMS Configuration (provider, API key)
│   ├── Storage Settings (limits, retention)
│   ├── API Keys (external integrations)
│   └── Platform Branding (logo, colors, name)
└── Audit Logs
    ├── All Actions (filterable)
    ├── By User
    ├── By Account
    └── By Action Type
```

### 3.2 Page Descriptions

| Navigation Item | Purpose | Key Data |
|----------------|---------|----------|
| **Dashboard → Overview** | At-a-glance platform health | Total accounts, active weddings, RSVP counts, wish counts, storage usage, recent sign-ups |
| **Wedding Accounts → Account List** | Searchable, filterable table of all wedding accounts | Name, slug, status, plan, member count, created date, last published |
| **Wedding Accounts → Account Detail** | Deep-dive into a single account | Full account info, content summary, member list, feature flags, activity |
| **Wedding Accounts → Create New Account** | Provision new wedding account | Form: couple names, email, slug, plan selection |
| **Platform Content → Content Templates** | Manage default content that seeds new weddings | Per-page default blocks; edit defaults that apply on account creation |
| **Platform Content → Legal Documents** | Edit legal docs shown in footer across all weddings | Rich text editor for each document |
| **Platform Content → Email Templates** | Configure transactional email content | Subject, body (HTML), variables |
| **Feature Management → Feature Flags** | Toggle platform-wide features | Feature name, key, enabled/disabled, description |
| **Feature Management → Plan Definitions** | Define pricing tiers and feature bundles | Plan name, price, feature list, limits |
| **User Management → Platform Admins** | CRUD for platform super admins | Name, email, role, last login |
| **User Management → Support Staff** | CRUD for support staff (read-only access to accounts) | Name, email, assigned accounts |
| **Analytics → Platform Overview** | Aggregate metrics with charts | recharts-powered dashboards, date range filters |
| **System Settings → Email** | Configure SMTP for transactional emails | Host, port, username, password, from address |
| **System Settings → Storage** | Set global storage limits per plan | Max MB per account, allowed file types |
| **Audit Logs** | Immutable log of all admin actions | Timestamp, user, action, target, before/after state |

---

## Section 4: Wedding Couple CMS Navigation

The couple workspace is where account owners and editors manage their wedding content. Accessible at `app.dreamweavers.events/dashboard/[slug]`.

### 4.1 Navigation Structure

```
Couple CMS
├── Dashboard
│   └── Wedding Overview (default landing page)
├── Content Editor
│   ├── Home Page
│   │   ├── Banner Section
│   │   ├── Hero Section
│   │   ├── Tea Ceremony Section
│   │   └── Narrative Section
│   ├── Schedule Page
│   │   ├── Banner & Intro
│   │   ├── Timeline Events
│   │   ├── Calendar Integration
│   │   └── Venue Section
│   ├── RSVP Page
│   │   ├── Header & Venue
│   │   ├── Step Labels & Copy
│   │   ├── Dietary Options
│   │   ├── Attendance Options
│   │   └── Result Messages
│   ├── Getting There Page
│   │   ├── Address & Venue
│   │   ├── Car Directions
│   │   ├── Public Transit
│   │   └── Map Embed
│   ├── Story Page
│   │   ├── Hero Intro
│   │   ├── Timeline Milestones
│   │   ├── Tidbits
│   │   └── Honeymoon Widget
│   ├── Moments Page
│   │   ├── Intro Text
│   │   └── Photo Gallery
│   ├── Wishes Page
│   │   ├── Intro Section
│   │   ├── Pre-populated Wishes
│   │   └── Form Labels
│   └── Q&A Page
│       ├── Intro Text
│       ├── FAQ Items
│       └── CTA Section
├── Media Library
│   ├── All Media (grid/list view)
│   ├── Upload New
│   ├── Folders (optional organization)
│   └── Image Editor (crop, resize via sharp)
├── Guest Management
│   ├── Guest List
│   │   ├── Table View (all guests)
│   │   ├── Add Guest
│   │   ├── Import CSV
│   │   └── Export CSV
│   ├── Invitations
│   │   ├── Create Invitation
│   │   ├── Invitation List (status: sent/opened/responded)
│   │   └── Send Reminders
│   └── RSVP Tracker
│       ├── Summary (attending/declined/pending counts)
│       ├── Dietary Requirements Summary
│       └── Individual RSVP Details
├── Wishes & Messages
│   ├── All Wishes (table/card view)
│   ├── Moderation Queue (pending approval)
│   ├── Hidden Wishes
│   └── Contact Messages
│       ├── All Messages
│       └── Reply/Mark Resolved
├── Settings
│   ├── Wedding Details
│   │   ├── Couple Names
│   │   ├── Wedding Date & Time
│   │   ├── Slug / URL
│   │   └── Status (draft/published/unpublished)
│   ├── Appearance
│   │   ├── Theme (future: color customization)
│   │   ├── Animations (on/off)
│   │   ├── Cursor Effects (on/off)
│   │   ├── Dark Mode (on/off)
│   │   └── Custom Domain (advanced)
│   ├── Notifications
│   │   ├── Email on New RSVP
│   │   ├── Email on New Wish
│   │   ├── Email on New Contact Message
│   │   └── Daily/Weekly Digest
│   ├── Password Protection
│   │   └── Enable/disable, set password
│   └── Account Members
│       ├── Invite Editor
│       ├── Member List
│       └── Remove Member
└── Preview & Publish
    ├── Live Preview (full-screen, mobile-responsive)
    ├── Preview Specific Page
    ├── Publish Changes
    ├── Unpublish
    └── Publish History
```

### 4.2 Page Descriptions

| Navigation Item | Purpose | Key Interactions |
|----------------|---------|-----------------|
| **Dashboard → Wedding Overview** | Quick stats for this wedding | RSVP count/summary, wish count, contact messages, last published date, feature flag summary |
| **Content Editor → [Page]** | Edit all content blocks for a page | Inline editing, rich text editor (MDXEditor), image picker from media library, drag-and-drop reordering (dnd-kit) for array blocks |
| **Media Library → All Media** | Browse uploaded images/files | Grid view with thumbnails, list view with metadata, search, filter by type/date, select for insertion into content blocks |
| **Media Library → Upload** | Upload new media | Drag-and-drop zone, multi-file, auto-resize via sharp, progress indicators |
| **Guest Management → Guest List** | Manage the guest list | Table with sort/filter, add individual guests, bulk import CSV, export CSV |
| **Guest Management → Invitations** | Create and track invitations | Generate unique invitation tokens, track sent/opened/responded status, send email reminders |
| **Guest Management → RSVP Tracker** | Monitor RSVP responses | Summary cards (attending/declined/pending), dietary breakdown, individual response detail |
| **Wishes → Moderation Queue** | Approve/hide incoming wishes | Card preview of each wish, approve/hide/delete actions, batch operations |
| **Wishes → Contact Messages** | View and manage contact submissions | Message detail with reply option, mark as resolved |
| **Settings → Wedding Details** | Core wedding information | Edit couple names (propagates to all pages), date, URL slug |
| **Settings → Appearance** | Visual feature toggles | Switches for animations, cursor effects, dark mode |
| **Settings → Notifications** | Email notification preferences | Toggle per-event-type email notifications |
| **Preview & Publish → Live Preview** | Full-screen preview of the wedding site | Opens in new tab/window, responsive viewport toggle, shares same content store |
| **Preview & Publish → Publish** | Push draft content to live | Confirmation dialog, publish timestamp recorded, triggers cache invalidation |

---

## Section 5: User Roles & Permission Matrix

### 5.1 Role Definitions

| Role | Scope | Description | Count Typical |
|------|-------|-------------|---------------|
| **Platform Super Admin** | Platform (all accounts) | Full platform control. Can manage all accounts, users, settings, and content. Has unrestricted access to every tier. | 1–3 |
| **Platform Support** | Platform (read accounts, limited write) | Read-only access to all accounts for support purposes. Can view content, RSVPs, wishes, and contact messages. Cannot edit content or modify account settings. | 2–5 |
| **Account Owner** | Single wedding account | The couple (or primary contact). Full control over their wedding: content, media, guests, wishes, settings, publish. Can invite editors. | 1–2 per account |
| **Account Editor** | Single wedding account | Invited by the owner (wedding planner, family member). Can edit content and manage media. Cannot delete the account, modify members, or publish/unpublish. | 0–5 per account |
| **Guest** | Single wedding account (read-only) | Public-facing access only. Can view published content, submit RSVPs, post wishes, send contact messages. No CMS access. | Unlimited |

### 5.2 Permission Matrix

| Permission Category | Action | Platform Super Admin | Platform Support | Account Owner | Account Editor | Guest |
|--------------------|--------|:--------------------:|:----------------:|:-------------:|:--------------:|:-----:|
| **Account Management** | | | | | | |
| | Create account | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Read account details | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ |
| | Update account settings | ✅ | ❌ | ✅ (own) | ❌ | ❌ |
| | Delete / suspend account | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Content Editing** | | | | | | |
| | View content (all pages) | ✅ | ✅ | ✅ (own) | ✅ (own) | ✅ (published only) |
| | Edit page content | ✅ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| | Edit page sections | ✅ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| | Edit individual fields/blocks | ✅ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| | Reorder sections/blocks | ✅ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| **Media Management** | | | | | | |
| | View media library | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ |
| | Upload media | ✅ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| | Delete media | ✅ | ❌ | ✅ (own) | ❌ | ❌ |
| | Organize media (folders) | ✅ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| **Guest Management** | | | | | | |
| | View guest list | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ |
| | Add / edit guests | ✅ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| | Delete guests | ✅ | ❌ | ✅ (own) | ❌ | ❌ |
| | Import / export guest CSV | ✅ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| | Create / send invitations | ✅ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| | View RSVPs | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ (own response only) |
| | Export RSVP data | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ |
| **Wishes Moderation** | | | | | | |
| | View all wishes | ✅ | ✅ | ✅ (own) | ✅ (own) | ✅ (approved only) |
| | Approve wish | ✅ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| | Hide wish | ✅ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| | Delete wish | ✅ | ✅ | ✅ (own) | ❌ | ❌ |
| | Submit wish (as guest) | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Settings Access** | | | | | | |
| | Edit wedding details | ✅ | ❌ | ✅ (own) | ❌ | ❌ |
| | Edit theme / appearance | ✅ | ❌ | ✅ (own) | ❌ | ❌ |
| | Configure notifications | ✅ | ❌ | ✅ (own) | ❌ | ❌ |
| | Set password protection | ✅ | ❌ | ✅ (own) | ❌ | ❌ |
| **Analytics Access** | | | | | | |
| | View wedding analytics | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ |
| | View platform analytics | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Publish / Unpublish** | | | | | | |
| | Preview site | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ |
| | Publish changes | ✅ | ❌ | ✅ (own) | ❌ | ❌ |
| | Unpublish site | ✅ | ❌ | ✅ (own) | ❌ | ❌ |
| **User Management** | | | | | | |
| | Manage platform admins | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Manage platform support | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Invite account editors | ✅ | ❌ | ✅ (own) | ❌ | ❌ |
| | Remove account editors | ✅ | ❌ | ✅ (own) | ❌ | ❌ |
| | View audit logs | ✅ | ✅ | ❌ | ❌ | ❌ |

### 5.3 Permission Enforcement

Permissions are enforced at two levels:

1. **API level (server-side):** Every CMS API route checks the authenticated user's role against the required permission before executing any database operation. Implemented via a `requirePermission(user, action, resource)` utility function.

2. **UI level (client-side):** Navigation items, buttons, and form fields are conditionally rendered based on the user's role. This is a UX optimization, not a security boundary.

```typescript
// Example: Permission check utility
// src/lib/permissions.ts

type Role = 'platform_super_admin' | 'platform_support' | 'account_owner' | 'account_editor' | 'guest';

const PERMISSION_MATRIX: Record<Role, Set<string>> = {
  platform_super_admin: new Set(['*']), // Wildcard: all permissions
  platform_support: new Set([
    'account:read', 'content:read', 'media:read',
    'guest:read', 'rsvp:read', 'wish:read', 'contact:read',
    'analytics:read:account', 'analytics:read:platform',
    'audit:read',
  ]),
  account_owner: new Set([
    'account:read:own', 'account:update:own',
    'content:read:own', 'content:write:own',
    'media:read:own', 'media:write:own', 'media:delete:own',
    'guest:read:own', 'guest:write:own', 'guest:delete:own',
    'guest:import:own', 'guest:export:own',
    'invitation:read:own', 'invitation:write:own',
    'wish:read:own', 'wish:moderate:own', 'wish:delete:own',
    'contact:read:own',
    'settings:read:own', 'settings:write:own',
    'analytics:read:own',
    'publish:preview:own', 'publish:write:own',
    'member:invite:own', 'member:remove:own',
  ]),
  account_editor: new Set([
    'content:read:own', 'content:write:own',
    'media:read:own', 'media:write:own',
    'guest:read:own', 'guest:write:own', 'guest:import:own', 'guest:export:own',
    'invitation:read:own', 'invitation:write:own',
    'wish:read:own', 'wish:moderate:own',
    'contact:read:own',
    'analytics:read:own',
    'publish:preview:own',
  ]),
  guest: new Set([
    'content:read:published',
    'rsvp:submit', 'wish:submit', 'contact:submit',
    'rsvp:read:own',
  ]),
};
```

---

## Section 6: Multi-Tenant Architecture

### 6.1 Tenant Isolation Strategy

**Approach: Row-Level Isolation via `weddingId` Foreign Key**

Every tenant-scoped model includes a `weddingId` field that references the `Account` model. All queries automatically filter by the resolved `weddingId`. This is the simplest, most performant approach for SQLite and avoids the complexity of separate databases or schemas.

```
┌──────────────────────────────────────────────────────┐
│                     Shared SQLite DB                 │
│                                                      │
│  ┌────────────────────┐    ┌──────────────────────┐ │
│  │ Account (wedding1) │◄───│ ContentPage          │ │
│  │ id: "acct_abc"     │    │ weddingId: "acct_abc" │ │
│  └────────────────────┘    └──────────────────────┘ │
│           ▲                                        │
│  ┌────────┴───────────┐    ┌──────────────────────┐ │
│  │ Account (wedding2) │◄───│ ContentPage          │ │
│  │ id: "acct_xyz"     │    │ weddingId: "acct_xyz" │ │
│  └────────────────────┘    └──────────────────────┘ │
│                                                      │
│  Platform-scoped tables (no weddingId):              │
│  User, PlatformSetting, LegalDocument, AuditLog      │
└──────────────────────────────────────────────────────┘
```

### 6.2 Database Schema Approach

- **Single shared SQLite database** — all tenants share the same physical `.db` file
- **Tenant-scoped queries** — every Prisma query on tenant data includes `where: { weddingId }` filter
- **Platform-scoped tables** — `User`, `PlatformSetting`, `LegalDocument`, `AuditLog` have no `weddingId` (or use `weddingId?: String` for audit trail entries that reference a specific account)
- **Index strategy** — all `weddingId` FK fields are indexed: `@@index([weddingId])`

### 6.3 Extending Existing Models with `weddingId`

| Current Model | Current Fields | Extension |
|--------------|----------------|-----------|
| `RSVPSubmission` | id, firstName, lastName, partySize, createdAt, updatedAt | + `weddingId String` (indexed, FK → Account) |
| `GuestResponse` | id, name, attendance, dietary, rsvpId, createdAt, updatedAt | No direct `weddingId` (accessed via parent RSVPSubmission) |
| `Wish` | id, name, relationship, message, imageUrl, createdAt | + `weddingId String` (indexed, FK → Account) + `status String @default("approved")` |
| `ContactSubmission` | id, name, email, contact, reason, createdAt | + `weddingId String` (indexed, FK → Account) |

### 6.4 Request Context: Resolving `weddingId`

The `weddingId` is resolved from the incoming request using a priority chain:

```
1. Subdomain:  {slug}.dreamweavers.events    → lookup Account by slug
2. Path param: /api/content/[weddingId]/*     → direct from URL
3. Session:    req.session.weddingId          → from authenticated CMS session
4. Header:     x-wedding-id                   → for API-only access (internal)
```

**Implementation:**

```typescript
// src/lib/tenant.ts

import { db } from '@/lib/db';
import { headers } from 'next/headers';

export async function resolveWeddingId(request: Request): Promise<string | null> {
  // 1. Check session (for CMS admin requests)
  // ... NextAuth session check ...

  // 2. Check subdomain
  const host = headers().get('host') || '';
  const subdomain = host.split('.')[0];
  if (subdomain && subdomain !== 'app' && subdomain !== 'www') {
    const account = await db.account.findUnique({
      where: { slug: subdomain, status: 'published' },
      select: { id: true },
    });
    if (account) return account.id;
  }

  // 3. Check x-wedding-id header (internal API)
  const headerId = headers().get('x-wedding-id');
  if (headerId) return headerId;

  return null;
}
```

### 6.5 Data Scoping Middleware (Prisma Middleware)

Prisma middleware automatically injects `weddingId` into all tenant-scoped queries, preventing accidental cross-tenant data leakage:

```typescript
// src/lib/prisma-middleware.ts

import { Prisma } from '@prisma/client';

const TENANT_SCOPED_MODELS = [
  'ContentPage', 'ContentSection', 'ContentBlock',
  'MediaAsset', 'FeatureFlag',
  'Guest', 'Invitation',
  'RSVPSubmission', 'GuestResponse',
  'Wish', 'ContactSubmission',
  'NotificationLog',
];

export function tenantMiddleware(weddingId: string) {
  return async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
    const model = params.model as string;

    if (TENANT_SCOPED_MODELS.includes(model)) {
      // Inject weddingId filter
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        params.args.where = { ...params.args.where, weddingId };
      } else if (params.action.startsWith('find')) {
        params.args.where = { ...params.args.where, weddingId };
      } else if (params.action === 'create') {
        params.args.data = { ...params.args.data, weddingId };
      } else if (params.action === 'update' || params.action === 'delete') {
        params.args.where = { ...params.args.where, weddingId };
      }
    }

    return next(params);
  };
}
```

**Important:** The middleware is only active for guest-facing and CMS requests. Platform admin requests bypass tenant scoping (they operate across all tenants).

### 6.6 Tenant Provisioning Workflow

When a new wedding account is created:

```
1. Platform admin creates Account record
   ├── coupleName1, coupleName2, email, slug
   ├── status: 'draft'
   ├── plan: selected plan
   └── Generate unique accountId (cuid)

2. Seed content from platform templates
   ├── For each of the 8 default pages:
   │   ├── Create ContentPage (slug, title, sortOrder)
   │   ├── For each default section in template:
   │   │   ├── Create ContentSection
   │   │   └── For each default block in section:
   │   │       └── Create ContentBlock (key, type, value)
   │   └── Set default feature flags
   └── Create upload directory: /public/uploads/{accountId}/

3. Create AccountMember for the owner
   └── role: 'account_owner'

4. Send welcome email (if configured)

5. Account is now accessible at:
   ├── CMS: app.dreamweavers.events/dashboard/{slug}
   └── Guest: {slug}.dreamweavers.events (returns 404 until published)
```

### 6.7 Tenant Limits and Quotas

| Resource | Free Tier | Premium Tier | Enforcement Point |
|----------|-----------|--------------|-------------------|
| Content pages | 8 (fixed) | 8 + custom | Account creation / CMS |
| Media storage | 50 MB | 500 MB | Upload API |
| Max file size | 5 MB | 10 MB | Upload API |
| Guest list size | 100 | 1,000 | Guest management API |
| Wishes | 50 | Unlimited | Wishes POST API |
| Account editors | 1 | 5 | Member invitation API |
| Custom domain | ❌ | ✅ | Settings API |
| Password protection | ❌ | ✅ | Settings API |

### 6.8 Cross-Tenant Data Isolation Guarantees

| Guarantee | Mechanism |
|-----------|-----------|
| **Query isolation** | Prisma middleware auto-injects `weddingId` filter on all tenant-scoped models |
| **Write isolation** | Prisma middleware auto-injects `weddingId` on all `create` operations |
| **Delete isolation** | Prisma middleware requires `weddingId` match on all `delete` operations |
| **API route isolation** | Each API route resolves `weddingId` before any DB operation; returns 404 if unresolvable |
| **Media isolation** | Uploads stored in `public/uploads/{weddingId}/` — filesystem-level separation |
| **Cache isolation** | React Query cache keys include `weddingId` prefix |
| **Session isolation** | NextAuth JWT includes `weddingId` claim; CMS routes validate claim matches requested account |
| **Audit trail** | All write operations logged with `weddingId` for forensic review |

---

## Section 7: Database Schema & Entity Relationships

### 7.1 Complete Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════════════════════════
// PLATFORM-SCOPED MODELS (no weddingId)
// ═══════════════════════════════════════════════════════════════

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String?
  image         String?
  role          String    @default("account_owner") // platform_super_admin | platform_support | account_owner | account_editor
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Platform admin relationships
  platformMemberships AccountMember[]
  auditActions       AuditLog[]

  @@index([email])
  @@index([role])
}

model PlatformSetting {
  id    String @id @default(cuid())
  key   String @unique
  value String // JSON string for complex values
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model LegalDocument {
  id        String   @id @default(cuid())
  slug      String   @unique // 'privacy-policy' | 'terms-of-service' | 'data-protection'
  title     String
  content   String   // JSON: matches current legal-content.tsx structure
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}

// ═══════════════════════════════════════════════════════════════
// TENANT ROOT
// ═══════════════════════════════════════════════════════════════

model Account {
  id          String   @id @default(cuid())
  slug        String   @unique // URL-safe identifier, e.g. "eleanor-james"
  coupleName1 String   // "Eleanor"
  coupleName2 String   // "James"
  email       String
  phone       String?
  weddingDate DateTime?
  status      String   @default("draft") // draft | published | unpublished | suspended | archived
  plan        String   @default("free")  // free | premium | custom
  customDomain String?  // e.g. "eleanorjames.wedding"
  passwordProtect Boolean @default(false)
  sitePassword   String?  // hashed password for password-protected sites
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relationships
  members        AccountMember[]
  pages          ContentPage[]
  media          MediaAsset[]
  featureFlags   FeatureFlag[]
  guests         Guest[]
  invitations    Invitation[]
  rsvps          RSVPSubmission[]
  wishes         Wish[]
  contactSubs    ContactSubmission[]
  notifications  NotificationLog[]
  auditEntries   AuditLog[]

  @@index([slug])
  @@index([status])
  @@index([plan])
}

model AccountMember {
  id        String   @id @default(cuid())
  accountId String
  userId    String
  role      String   @default("account_editor") // account_owner | account_editor
  invitedAt DateTime @default(now())
  acceptedAt DateTime?
  createdAt  DateTime @default(now())

  account Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([accountId, userId])
  @@index([accountId])
  @@index([userId])
}

// ═══════════════════════════════════════════════════════════════
// CONTENT MANAGEMENT (CMS LAYER)
// ═══════════════════════════════════════════════════════════════

model ContentPage {
  id        String @id @default(cuid())
  accountId String
  slug      String // 'home' | 'schedule' | 'rsvp' | 'getting-there' | 'story' | 'moments' | 'wishes' | 'qa'
  title     String // Display title
  sortOrder Int    @default(0)
  isPublished Boolean @default(false)
  publishedAt DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  account  Account         @relation(fields: [accountId], references: [id], onDelete: Cascade)
  sections ContentSection[]

  @@unique([accountId, slug])
  @@index([accountId])
  @@index([sortOrder])
}

model ContentSection {
  id        String @id @default(cuid())
  pageId    String
  slug      String // e.g. 'hero', 'banner', 'timeline', 'teaCeremony'
  title     String // Display label for CMS editor
  sortOrder Int    @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  page   ContentPage   @relation(fields: [pageId], references: [id], onDelete: Cascade)
  blocks ContentBlock[]

  @@unique([pageId, slug])
  @@index([pageId])
  @@index([sortOrder])
}

model ContentBlock {
  id        String @id @default(cuid())
  sectionId String
  key       String   // Unique within section: 'heroImage', 'coupleName', etc.
  type      String   // text | richtext | image | gallery | timeline-item | faq-item | venue-info | map-embed
  value     String   // The actual content (plain text, HTML/MDX for richtext, URL for image, JSON for arrays)
  meta      String?  // JSON: { alt?, label?, required?, placeholder?, accept? }
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  section ContentSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)

  @@unique([sectionId, key])
  @@index([sectionId])
  @@index([type])
}

// ═══════════════════════════════════════════════════════════════
// MEDIA MANAGEMENT
// ═══════════════════════════════════════════════════════════════

model MediaAsset {
  id           String  @id @default(cuid())
  accountId    String
  fileName     String  // Stored filename on disk
  originalName String  // Original uploaded filename
  mimeType     String  // image/jpeg, image/png, image/webp
  size         Int     // File size in bytes
  width        Int?    // Image width (extracted via sharp)
  height       Int?    // Image height (extracted via sharp)
  url          String  // /uploads/{accountId}/{fileName}
  alt          String? // Accessible description / CMS alt text
  folder       String? // Organizational folder path
  uploadedById String? // User who uploaded
  createdAt    DateTime @default(now())

  account Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
  uploader User?   @relation("MediaUploader", fields: [uploadedById], references: [id], onDelete: SetNull)

  @@index([accountId])
  @@index([folder])
  @@index([mimeType])
}

// ═══════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════

model FeatureFlag {
  id          String   @id @default(cuid())
  accountId   String?
  featureKey  String   // e.g. 'page.schedule', 'feature.rsvp', 'display.animations'
  featureName String   // Human-readable name
  enabled     Boolean  @default(true)
  category    String   @default("page") // page | interactive | display | advanced
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // If accountId is null, this is a platform-wide default flag
  // If accountId is set, this overrides the platform default for this account
  account Account? @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@unique([accountId, featureKey]) // SQLite uses IGNORE for null accountId handling
  @@index([accountId])
  @@index([featureKey])
  @@index([category])
}

// ═══════════════════════════════════════════════════════════════
// GUEST MANAGEMENT
// ═══════════════════════════════════════════════════════════════

model Guest {
  id          String   @id @default(cuid())
  accountId   String
  firstName   String
  lastName    String
  email       String?
  phone       String?
  partySize   Int      @default(1)
  tableNumber Int?
  dietary     String?  // Stored as comma-separated string
  notes       String?
  status      String   @default("invited") // invited | sent | opened | responded
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  account     Account      @relation(fields: [accountId], references: [id], onDelete: Cascade)
  invitations Invitation[]
  rsvps       RSVPSubmission[]

  @@index([accountId])
  @@index([email])
  @@index([status])
}

model Invitation {
  id          String   @id @default(cuid())
  accountId   String
  guestId     String
  token       String   @unique // Unique URL token for invitation link
  sentAt      DateTime?
  openedAt    DateTime?
  respondedAt DateTime?
  createdAt   DateTime @default(now())

  account Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
  guest   Guest   @relation(fields: [guestId], references: [id], onDelete: Cascade)

  @@index([accountId])
  @@index([guestId])
  @@index([token])
}

// ═══════════════════════════════════════════════════════════════
// USER-GENERATED CONTENT (extended with weddingId)
// ═══════════════════════════════════════════════════════════════

model RSVPSubmission {
  id        String   @id @default(cuid())
  accountId String
  firstName String
  lastName  String
  partySize Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  account Account         @relation(fields: [accountId], references: [id], onDelete: Cascade)
  guests  GuestResponse[]
  guestRecords Guest[]    @relation("GuestRSVP")

  @@index([accountId])
  @@index([createdAt])
}

model GuestResponse {
  id        String   @id @default(cuid())
  name      String
  attendance String   // "yes" | "no" | "partial"
  dietary   String?
  rsvpId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  rsvp RSVPSubmission @relation(fields: [rsvpId], references: [id], onDelete: Cascade)

  @@index([rsvpId])
}

model Wish {
  id          String   @id @default(cuid())
  accountId   String
  name        String
  relationship String?
  message     String
  imageUrl    String?  // base64 data URL or media asset URL
  status      String   @default("approved") // pending | approved | hidden
  createdAt   DateTime @default(now())

  account Account @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@index([accountId])
  @@index([status])
  @@index([createdAt])
}

model ContactSubmission {
  id        String   @id @default(cuid())
  accountId String
  name      String
  email     String
  contact   String?
  reason    String
  status    String   @default("open") // open | resolved
  createdAt DateTime @default(now())

  account Account @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@index([accountId])
  @@index([status])
  @@index([createdAt])
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM MODELS
// ═══════════════════════════════════════════════════════════════

model NotificationLog {
  id          String   @id @default(cuid())
  accountId   String
  type        String   // 'rsvp' | 'wish' | 'contact' | 'system'
  title       String
  message     String
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())

  account Account @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@index([accountId])
  @@index([read])
  @@index([createdAt])
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  accountId String?  // null for platform-level actions
  action    String   // 'account.create' | 'content.update' | 'media.upload' | etc.
  resource  String?  // e.g. 'ContentBlock', 'Account'
  resourceId String?
  details   String?  // JSON: before/after state or relevant metadata
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  user    User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  account Account? @relation(fields: [accountId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([accountId])
  @@index([action])
  @@index([createdAt])
}
```

### 7.2 Entity Relationship Diagram

```
User ─────────────┬──< AccountMember >──── Account (Tenant Root)
                  │                              │
                  │                              ├── ContentPage ──< ContentSection ──< ContentBlock
                  │                              ├── MediaAsset
                  │                              ├── FeatureFlag
                  │                              ├── Guest ──< Invitation
                  │                              │       └──< RSVPSubmission ──< GuestResponse
                  │                              ├── Wish
                  │                              ├── ContactSubmission
                  │                              └── NotificationLog
                  │
                  ├──< AuditLog >──── Account?
                  └──< MediaAsset (uploader)

PlatformSetting (standalone)
LegalDocument (standalone)
```

### 7.3 Model Count Summary

| Category | Models | Count |
|----------|--------|-------|
| Platform-scoped | User, PlatformSetting, LegalDocument | 3 |
| Tenant root | Account, AccountMember | 2 |
| Content management | ContentPage, ContentSection, ContentBlock | 3 |
| Media | MediaAsset | 1 |
| Features | FeatureFlag | 1 |
| Guest management | Guest, Invitation | 2 |
| UGC (extended) | RSVPSubmission, GuestResponse, Wish, ContactSubmission | 4 |
| System | NotificationLog, AuditLog | 2 |
| **Total** | | **18** |

---

## Section 8: Feature Toggle Framework

### 8.1 Two-Tier Toggle System

Feature flags operate at two levels with a fallback chain:

```
Account-specific flag  →  (if null)  →  Platform default flag  →  (if null)  →  Hardcoded default
```

| Level | Model | `accountId` | Purpose |
|-------|-------|-------------|---------|
| Platform default | `FeatureFlag` | `null` | Default state for all new accounts; controlled by platform admins |
| Account-specific | `FeatureFlag` | `{accountId}` | Override for a specific wedding; controlled by couple or platform admin |

### 8.2 Feature Categories & Complete Feature List

#### 8.2.1 Page Visibility

Controls whether entire pages appear in the guest-facing navigation and are accessible.

| Feature Key | Display Name | Default | Description |
|-------------|-------------|---------|-------------|
| `page.home` | Home Page | `true` | Main landing page with hero, countdown, narrative |
| `page.schedule` | Schedule Page | `true` | Wedding day timeline and venue info |
| `page.rsvp` | RSVP Page | `true` | Guest RSVP form (multi-step) |
| `page.getting-there` | Getting There Page | `true` | Venue directions, parking, transit, map |
| `page.story` | Story Page | `true` | Couple's story timeline, tidbits, honeymoon |
| `page.moments` | Moments Page | `true` | Photo gallery |
| `page.wishes` | Wishes Page | `true` | Guest wish wall with submission form |
| `page.qa` | Q&A Page | `true` | Frequently asked questions accordion |

#### 8.2.2 Interactive Features

Controls functional features within pages.

| Feature Key | Display Name | Default | Description |
|-------------|-------------|---------|-------------|
| `feature.rsvp` | RSVP Submission | `true` | Enable the RSVP form submission |
| `feature.wishes-form` | Wishes Form | `true` | Enable the wish submission form |
| `feature.wishes-images` | Wish Image Upload | `true` | Allow guests to attach images to wishes |
| `feature.contact-form` | Contact Form | `true` | Enable the contact concierge modal |
| `feature.honeymoon-voting` | Honeymoon Voting | `true` | Enable the honeymoon destination voting widget |
| `feature.calendar-export` | Calendar Export | `true` | Show "Add to Calendar" button on schedule page |
| `feature.rsvp-auto-fill` | RSVP Auto-Fill | `true` | Allow pre-filling RSVP via URL params (`?first=&last=&party=`) |

#### 8.2.3 Display Options

Controls visual features and effects.

| Feature Key | Display Name | Default | Description |
|-------------|-------------|---------|-------------|
| `display.golden-dust` | Golden Dust Overlay | `true` | Floating golden particle animation |
| `display.bokeh` | Hero Bokeh Lights | `true` | Animated bokeh light orbs on home page hero |
| `display.cursor-effects` | Cursor Effects | `true` | Custom cursor sparkle trail |
| `display.dark-mode` | Dark Mode | `false` | Enable dark color theme variant |
| `display.animations` | Page Animations | `true` | Scroll-triggered reveal animations |
| `display.bottom-nav` | Bottom Navigation | `true` | Mobile bottom navigation bar |
| `display.section-banners` | Section Banners | `true` | Full-width banner images on inner pages |

#### 8.2.4 Advanced

Controls premium/advanced features.

| Feature Key | Display Name | Default | Plan Required | Description |
|-------------|-------------|---------|---------------|-------------|
| `advanced.custom-domain` | Custom Domain | `false` | Premium | Point a custom domain to the wedding site |
| `advanced.password-protection` | Password Protection | `false` | Premium | Require password to access the site |
| `advanced.analytics` | Analytics Dashboard | `true` | All | Show analytics in couple dashboard |
| `advanced.guest-csv-import` | CSV Guest Import | `true` | All | Import guest list from CSV file |
| `advanced.rsvp-reminder` | RSVP Reminders | `false` | Premium | Send automated RSVP reminder emails |
| `advanced.wish-moderation` | Wish Moderation | `false` | Free/Custom | New wishes require approval before display |

### 8.3 Implementation: FeatureFlag Model + React Hook

#### Database Query (API side)

```typescript
// src/lib/features.ts

import { db } from '@/lib/db';

interface FeatureConfig {
  featureKey: string;
  enabled: boolean;
}

export async function getFeatureFlags(accountId: string): Promise<Map<string, boolean>> {
  // 1. Get all platform defaults (where accountId IS NULL)
  const platformDefaults = await db.featureFlag.findMany({
    where: { accountId: null },
  });

  // 2. Get account-specific overrides
  const accountOverrides = await db.featureFlag.findMany({
    where: { accountId },
  });

  // 3. Merge: account override wins over platform default
  const flags = new Map<string, boolean>();
  for (const pf of platformDefaults) {
    flags.set(pf.featureKey, pf.enabled);
  }
  for (const af of accountOverrides) {
    flags.set(af.featureKey, af.enabled);
  }

  return flags;
}

export function isFeatureEnabled(flags: Map<string, boolean>, key: string, defaultVal = true): boolean {
  return flags.get(key) ?? defaultVal;
}
```

#### React Hook (Client side)

```typescript
// src/hooks/useFeatureFlag.ts

'use client';

import { useQuery } from '@tanstack/react-query';

export function useFeatureFlag(featureKey: string, defaultValue = true): boolean {
  const { data: flags } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const res = await fetch('/api/content/features');
      const data = await res.json();
      return new Map<string, boolean>(Object.entries(data.flags));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (!flags) return defaultValue;
  return flags.get(featureKey) ?? defaultValue;
}

// Composable hook for page visibility
export function usePageVisible(pageSlug: string): boolean {
  return useFeatureFlag(`page.${pageSlug}`, true);
}
```

#### Usage in Components

```typescript
// Example: Conditionally render RSVP page
import { usePageVisible } from '@/hooks/useFeatureFlag';

export default function RSVPPage() {
  const visible = usePageVisible('rsvp');
  if (!visible) return <PageDisabled />;
  // ... existing RSVP page content
}
```

### 8.4 Default Feature Set for New Accounts

When a new `Account` is provisioned, the following `FeatureFlag` records are seeded:

```typescript
const DEFAULT_FEATURES = [
  // Page Visibility — all enabled by default
  { featureKey: 'page.home', enabled: true, category: 'page' },
  { featureKey: 'page.schedule', enabled: true, category: 'page' },
  { featureKey: 'page.rsvp', enabled: true, category: 'page' },
  { featureKey: 'page.getting-there', enabled: true, category: 'page' },
  { featureKey: 'page.story', enabled: true, category: 'page' },
  { featureKey: 'page.moments', enabled: true, category: 'page' },
  { featureKey: 'page.wishes', enabled: true, category: 'page' },
  { featureKey: 'page.qa', enabled: true, category: 'page' },
  // Interactive Features
  { featureKey: 'feature.rsvp', enabled: true, category: 'interactive' },
  { featureKey: 'feature.wishes-form', enabled: true, category: 'interactive' },
  { featureKey: 'feature.wishes-images', enabled: true, category: 'interactive' },
  { featureKey: 'feature.contact-form', enabled: true, category: 'interactive' },
  { featureKey: 'feature.honeymoon-voting', enabled: true, category: 'interactive' },
  { featureKey: 'feature.calendar-export', enabled: true, category: 'interactive' },
  { featureKey: 'feature.rsvp-auto-fill', enabled: true, category: 'interactive' },
  // Display Options
  { featureKey: 'display.golden-dust', enabled: true, category: 'display' },
  { featureKey: 'display.bokeh', enabled: true, category: 'display' },
  { featureKey: 'display.cursor-effects', enabled: true, category: 'display' },
  { featureKey: 'display.dark-mode', enabled: false, category: 'display' },
  { featureKey: 'display.animations', enabled: true, category: 'display' },
  { featureKey: 'display.bottom-nav', enabled: true, category: 'display' },
  { featureKey: 'display.section-banners', enabled: true, category: 'display' },
  // Advanced
  { featureKey: 'advanced.custom-domain', enabled: false, category: 'advanced' },
  { featureKey: 'advanced.password-protection', enabled: false, category: 'advanced' },
  { featureKey: 'advanced.analytics', enabled: true, category: 'advanced' },
  { featureKey: 'advanced.guest-csv-import', enabled: true, category: 'advanced' },
  { featureKey: 'advanced.rsvp-reminder', enabled: false, category: 'advanced' },
  { featureKey: 'advanced.wish-moderation', enabled: false, category: 'advanced' },
];
```

### 8.5 Feature Dependency Management

Some features depend on others being enabled. Dependencies are enforced in the CMS UI (disable parent → warn about children) and validated server-side:

| Feature | Depends On | Dependency Type |
|---------|-----------|-----------------|
| `feature.rsvp` | `page.rsvp` | Page must be visible to accept RSVPs |
| `feature.wishes-form` | `page.wishes` | Page must be visible for the form to appear |
| `feature.honeymoon-voting` | `page.story` | Voting widget is embedded in Story page |
| `feature.calendar-export` | `page.schedule` | Calendar button is on Schedule page |
| `feature.rsvp-auto-fill` | `feature.rsvp` | Auto-fill requires RSVP to be active |
| `feature.wishes-images` | `feature.wishes-form` | Image upload is part of the wish form |
| `advanced.password-protection` | (none) | Standalone |
| `advanced.custom-domain` | (none) | Standalone |

**Validation rule:** If a dependency is disabled, the dependent feature is also automatically disabled (cascading). The CMS UI shows a warning: *"Disabling X will also disable Y."*

---

## Section 9: Dynamic Content Model

### 9.1 The JSON-Based Content Block System

The CMS stores all wedding content in a normalized, three-level hierarchy:

```
ContentPage (1 per page type)
  └── ContentSection (logical grouping)
       └── ContentBlock (individual editable field)
```

Each `ContentBlock` has a `type` that determines how it is rendered and validated, and a `value` field that holds the content as a string or JSON string.

### 9.2 How Hardcoded Content Becomes CMS-Managed

**Current state (hardcoded):**

```tsx
// HomePage.tsx (current)
const HERO_IMG = 'https://lh3.googleusercontent.com/...';
const WEDDING_DATE = new Date('2027-12-25T16:00:00').getTime();
// ...
<h1>Eleanor &amp; James</h1>
```

**Target state (CMS-driven):**

```tsx
// HomePage.tsx (CMS-driven)
import { useContentBlock } from '@/hooks/useContent';

export default function HomePage() {
  const heroImage = useContentBlock('home', 'hero', 'heroImage');
  const coupleName = useContentBlock('home', 'banner', 'coupleName');
  const weddingDate = useContentBlock('home', 'hero', 'weddingDateIso');
  // ...
  return (
    <img src={heroImage} alt="Hero Wedding Portrait" />
    <h1>{coupleName}</h1>
    // ...
  );
}
```

**Content hook implementation:**

```typescript
// src/hooks/useContent.ts

'use client';

import { useQuery } from '@tanstack/react-query';
import { useContentStore } from '@/store/useContentStore';

export function useContentBlock(pageSlug: string, sectionSlug: string, blockKey: string): string {
  const { pages } = useContentStore();

  // Fetch content if not already loaded
  useQuery({
    queryKey: ['content', pageSlug],
    queryFn: async () => {
      const res = await fetch(`/api/content/${pageSlug}`);
      return res.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !pages[pageSlug], // Don't refetch if already in store
  });

  const page = pages[pageSlug];
  const section = page?.sections?.find((s: any) => s.slug === sectionSlug);
  const block = section?.blocks?.find((b: any) => b.key === blockKey);

  return block?.value ?? '';
}

// For JSON array blocks (timeline items, FAQs, photos)
export function useContentJSON(pageSlug: string, sectionSlug: string, blockKey: string): any[] {
  const raw = useContentBlock(pageSlug, sectionSlug, blockKey);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
```

### 9.3 Content Block Types

| Block Type | `value` Format | Editor Component | Rendering Notes |
|-----------|---------------|------------------|-----------------|
| `text` | Plain string | `<Input>` or `<Textarea>` | Rendered as-is, no HTML |
| `richtext` | HTML/MDX string | `@mdxeditor/editor` | Rendered via `dangerouslySetInnerHTML` or `react-markdown` |
| `image` | URL string (media asset or external) | Image picker + URL input | Rendered as `<img src={value}>` |
| `gallery` | JSON array: `[{alt, src, sortOrder}]` | Drag-and-drop grid (dnd-kit) + upload | Rendered as masonry grid |
| `timeline-item` | JSON array: `[{date, title, body, image, sortOrder}]` | Sortable list editor (dnd-kit) | Rendered as vertical timeline |
| `faq-item` | JSON array: `[{question, answer, sortOrder}]` | Accordion editor | Rendered as collapsible accordion |
| `venue-info` | JSON array: `[{name, code, description, sortOrder}]` | Repeater form | Rendered as info cards |
| `map-embed` | URL string (iframe src) | URL input + preview | Rendered as `<iframe src={value}>` |

### 9.4 Content Versioning Approach

**Strategy: Last-Saved Wins with `updatedAt` Timestamp**

- No complex versioning system (no content history, no branching)
- Each `ContentBlock` has `createdAt` and `updatedAt` timestamps
- The CMS editor shows "Last saved: {updatedAt}" for each block
- "Publish" action copies all current block values to a published snapshot (implemented via `ContentPage.isPublished` + `publishedAt`)
- If needed in the future, an `AuditLog` entry captures before/after state on every content update

**Publishing flow:**

```
1. Couple edits content in CMS → ContentBlock.value updated → updatedAt set
2. Guest API serves only ContentBlocks where ContentPage.isPublished = true
3. Couple clicks "Publish" → ContentPage.isPublished = true, publishedAt = now()
4. Couple clicks "Unpublish" → ContentPage.isPublished = false
```

### 9.5 Content Validation (Zod Schemas Per Block Type)

Each block type has a corresponding Zod schema used for validation on both client (form) and server (API):

```typescript
// src/lib/content-validation.ts

import { z } from 'zod';

export const blockTypeSchemas: Record<string, z.ZodType> = {
  text: z.string().max(10000),
  richtext: z.string().max(50000),
  image: z.string().url().max(2048),
  map_embed: z.string().url().max(2048),

  gallery: z.array(
    z.object({
      alt: z.string().max(200),
      src: z.string().url().max(2048),
      sortOrder: z.number().int().min(0),
    })
  ).max(50),

  'timeline-item': z.array(
    z.object({
      date: z.string().max(50),
      title: z.string().max(200),
      body: z.string().max(2000),
      image: z.string().url().max(2048).optional(),
      tag: z.string().max(50).optional(),
      sortOrder: z.number().int().min(0),
    })
  ).max(20),

  'faq-item': z.array(
    z.object({
      question: z.string().max(500),
      answer: z.string().max(5000),
      sortOrder: z.number().int().min(0),
    })
  ).max(20),

  'venue-info': z.array(
    z.object({
      name: z.string().max(200),
      code: z.string().max(20).optional(),
      description: z.string().max(1000),
      sortOrder: z.number().int().min(0),
    })
  ).max(10),
};

export function validateBlock(type: string, value: string): { valid: boolean; errors?: string[] } {
  const schema = blockTypeSchemas[type];
  if (!schema) return { valid: false, errors: [`Unknown block type: ${type}`] };

  try {
    const parsed = JSON.parse(value);
    schema.parse(parsed);
    return { valid: true };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { valid: false, errors: e.errors.map((err) => `${err.path.join('.')}: ${err.message}`) };
    }
    // For non-JSON types (text, richtext, image, map_embed)
    if (['text', 'richtext', 'image', 'map-embed'].includes(type)) {
      try {
        schema.parse(value);
        return { valid: true };
      } catch (valErr) {
        if (valErr instanceof z.ZodError) {
          return { valid: false, errors: valErr.errors.map((err) => err.message) };
        }
      }
    }
    return { valid: false, errors: ['Invalid value format'] };
  }
}
```

### 9.6 Default/Seed Content for New Weddings

When a new `Account` is provisioned, the system seeds content from platform templates. The default content mirrors the current hardcoded values (Eleanor & James wedding) but is stored as CMS records that the couple immediately edits.

```typescript
// Example: Seed function for HomePage
async function seedHomePageContent(accountId: string) {
  const page = await db.contentPage.create({
    data: {
      accountId,
      slug: 'home',
      title: 'Home',
      sortOrder: 0,
      sections: {
        create: [
          {
            slug: 'banner',
            title: 'Banner',
            sortOrder: 0,
            blocks: {
              create: [
                { key: 'coupleName', type: 'text', value: 'Your Names', meta: '{"label":"Couple Names","required":true}' },
                { key: 'bannerImage', type: 'image', value: '', meta: '{"label":"Banner Background Image","required":true}' },
              ],
            },
          },
          {
            slug: 'hero',
            title: 'Hero Section',
            sortOrder: 1,
            blocks: {
              create: [
                { key: 'heroImage', type: 'image', value: '', meta: '{"label":"Hero Image","required":true}' },
                { key: 'weddingDate', type: 'text', value: 'Your Wedding Date', meta: '{"label":"Wedding Date (display)"}' },
                { key: 'weddingDateIso', type: 'text', value: '', meta: '{"label":"Wedding Date (ISO 8601)"}' },
                { key: 'heroDescription', type: 'text', value: 'Your invitation message here.', meta: '{"label":"Hero Description"}' },
              ],
            },
          },
          // ... teaCeremony, narrative sections
        ],
      },
    },
  });
  return page;
}
```

### 9.7 How the Frontend Reads Content

**API endpoint (guest-facing):**

```
GET /api/content/home?weddingId={resolved}
```

**Response structure:**

```json
{
  "page": {
    "slug": "home",
    "title": "Home",
    "isPublished": true,
    "publishedAt": "2027-06-15T10:00:00Z",
    "sections": [
      {
        "slug": "banner",
        "title": "Banner",
        "sortOrder": 0,
        "blocks": [
          {
            "key": "coupleName",
            "type": "text",
            "value": "Eleanor & James",
            "meta": { "label": "Couple Names", "required": true }
          },
          {
            "key": "bannerImage",
            "type": "image",
            "value": "https://lh3.googleusercontent.com/...",
            "meta": { "label": "Banner Background Image", "required": true }
          }
        ]
      },
      {
        "slug": "hero",
        "title": "Hero Section",
        "sortOrder": 1,
        "blocks": [
          { "key": "heroImage", "type": "image", "value": "https://...", "meta": null },
          { "key": "weddingDate", "type": "text", "value": "December 25, 2027", "meta": null },
          { "key": "weddingDateIso", "type": "text", "value": "2027-12-25T16:00:00", "meta": null },
          { "key": "heroDescription", "type": "text", "value": "Together with their families...", "meta": null }
        ]
      }
    ]
  }
}
```

**Caching strategy:**

- React Query with `staleTime: 10 minutes` (content doesn't change frequently on the guest site)
- Zustand store as a secondary cache layer (content persists across section navigation within the SPA)
- Cache invalidation: When couple publishes, a cache-busting query key update is triggered
- For the CMS editor: `staleTime: 0` (always fresh while editing)

### 9.8 Content Rendering Pipeline

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌───────────────┐
│ Guest visits │────▶│ GET /api/content/ │────▶│ React Query     │────▶│ Zustand Store │
│ section      │     │ {pageSlug}        │    │ (fetch + cache) │     │ (useContent-  │
│              │     │                   │     │                 │     │  Store.ts)    │
└──────────────┘     └──────────────────┘     └─────────────────┘     └───────┬───────┘
                                                                               │
                          ┌────────────────────────────────────────────────────┘
                          │
                          ▼
                 ┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐
                 │ useContentBlock( │────▶│ Block value      │────▶│ Component       │
                 │ page, section,   │     │ (string or JSON) │     │ renders with    │
                 │ key)             │     │                  │     │ the value       │
                 └──────────────────┘     └──────────────────┘     └─────────────────┘
```

**Zustand content store:**

```typescript
// src/store/useContentStore.ts

import { create } from 'zustand';

interface ContentSection {
  slug: string;
  title: string;
  sortOrder: number;
  blocks: ContentBlock[];
}

interface ContentBlock {
  key: string;
  type: string;
  value: string;
  meta: any;
}

interface ContentPage {
  slug: string;
  title: string;
  isPublished: boolean;
  sections: ContentSection[];
}

interface ContentState {
  pages: Record<string, ContentPage | null>;
  weddingId: string | null;
  setWeddingId: (id: string) => void;
  setPage: (slug: string, page: ContentPage) => void;
  getBlock: (pageSlug: string, sectionSlug: string, blockKey: string) => ContentBlock | undefined;
}

export const useContentStore = create<ContentState>((set, get) => ({
  pages: {},
  weddingId: null,
  setWeddingId: (id) => set({ weddingId: id }),
  setPage: (slug, page) =>
    set((state) => ({ pages: { ...state.pages, [slug]: page } })),
  getBlock: (pageSlug, sectionSlug, blockKey) => {
    const page = get().pages[pageSlug];
    if (!page) return undefined;
    const section = page.sections.find((s) => s.slug === sectionSlug);
    if (!section) return undefined;
    return section.blocks.find((b) => b.key === blockKey);
  },
}));
```

---

## Section 10: Frontend-to-CMS Field Mapping

This section provides a **complete inventory** of every hardcoded content field in the current codebase, mapped to its corresponding CMS content block definition.

### 10.1 HomePage Field Mapping

| # | Field Description | Component Location | Current Hardcoded Value | CMS Block Type | Field Key | Required | Default Value |
|---|------------------|-------------------|------------------------|----------------|-----------|----------|---------------|
| 1 | Couple name (banner) | `HomePage.tsx:65` | `"Eleanor & James"` | text | `banner.coupleName` | ✅ | `"Your Names"` |
| 2 | Banner background image | `HomePage.tsx:38` | `https://lh3.googleusercontent.com/...AB6AXuA-OyKf...` | image | `banner.bannerImage` | ✅ | `""` |
| 3 | Hero image | `HomePage.tsx:8` | `https://lh3.googleusercontent.com/...AB6AXuBeAe38...` | image | `hero.heroImage` | ✅ | `""` |
| 4 | Hero image alt text | `HomePage.tsx:79` | `"Hero Wedding Portrait"` | text | `hero.heroAltText` | ❌ | `"Hero Wedding Portrait"` |
| 5 | Wedding date (display) | `HomePage.tsx:96` | `"December 25, 2027"` | text | `hero.weddingDate` | ✅ | `"Your Wedding Date"` |
| 6 | Wedding date (ISO) | `HomePage.tsx:13` | `"2027-12-25T16:00:00"` | text | `hero.weddingDateIso` | ✅ | `""` |
| 7 | Hero description | `HomePage.tsx:102` | `"Together with their families, request the pleasure of your company"` | text | `hero.heroDescription` | ❌ | `"Your invitation message here."` |
| 8 | Scroll indicator text | `HomePage.tsx:135` | `"Scroll"` | text | `hero.scrollIndicatorText` | ❌ | `"Scroll"` |
| 9 | Tea ceremony label | `HomePage.tsx:155` | `"The Tradition"` | text | `teaCeremony.teaCeremonyLabel` | ❌ | `"The Tradition"` |
| 10 | Tea ceremony title | `HomePage.tsx:157` | `"The Tea Ceremony"` | text | `teaCeremony.teaCeremonyTitle` | ✅ | `"The Tea Ceremony"` |
| 11 | Tea ceremony image | `HomePage.tsx:10` | `https://lh3.googleusercontent.com/...AB6AXuA6SiJt...` | image | `teaCeremony.teaCeremonyImage` | ❌ | `""` |
| 12 | Tea ceremony image alt | `HomePage.tsx:148` | `"The Tea Ceremony"` | text | `teaCeremony.teaCeremonyImageAlt` | ❌ | `"The Tea Ceremony"` |
| 13 | Narrative label | `HomePage.tsx:167` | `"The Prelude"` | text | `narrative.narrativeLabel` | ❌ | `"The Prelude"` |
| 14 | Narrative title | `HomePage.tsx:169` | `"Our Story Begins Here"` | text | `narrative.narrativeTitle` | ✅ | `"Our Story Begins Here"` |
| 15 | Narrative body | `HomePage.tsx:172` | `"Every great romance is a narrative woven over time. Ours began with a serendipitous meeting and has evolved into a tapestry of shared adventures, quiet moments, and a profound commitment to one another."` | richtext | `narrative.narrativeBody` | ❌ | `"Your story begins here..."` |

### 10.2 SchedulePage Field Mapping

| # | Field Description | Component Location | Current Hardcoded Value | CMS Block Type | Field Key | Required | Default Value |
|---|------------------|-------------------|------------------------|----------------|-----------|----------|---------------|
| 1 | Page title | `SchedulePage.tsx:38` | `"The Schedule"` | text | `banner.pageTitle` | ✅ | `"The Schedule"` |
| 2 | Banner background image | `SchedulePage.tsx:12` | `https://lh3.googleusercontent.com/...AB6AXuA-OyKf...` | image | `banner.bannerImage` | ❌ | `""` (inherits from platform default) |
| 3 | Ceremony intro image | `SchedulePage.tsx:7` | `https://lh3.googleusercontent.com/...AB6AXuAsLNSE...` | image | `intro.ceremonyImage` | ❌ | `""` |
| 4 | Celebration intro image | `SchedulePage.tsx:8` | `https://lh3.googleusercontent.com/...AB6AXuC01POr...` | image | `intro.celebrationImage` | ❌ | `""` |
| 5 | Date line | `SchedulePage.tsx:55` | `"Saturday, December 25, 2027"` | text | `intro.dateLine` | ✅ | `""` |
| 6 | Timeline section title | `SchedulePage.tsx:63` | `"The Celebration"` | text | `timeline.timelineSectionTitle` | ❌ | `"The Celebration"` |
| 7 | Timeline section date | `SchedulePage.tsx:65` | `"December 25, 2027"` | text | `timeline.timelineSectionDate` | ❌ | `""` |
| 8 | Timeline items (array) | `SchedulePage.tsx:70-100` | `[{time:"4:00 PM", title:"The Ceremony", body:"Join us as we exchange...", tag:"Formal Attire"}, {time:"5:30 PM", title:"Cocktail Hour", body:"Enjoy signature drinks..."}, {time:"7:00 PM", title:"Dinner & Dancing", body:"A seated dinner..."}]` | timeline-item[] | `timeline.timelineItems` | ✅ | `[]` |
| 9 | Add to Calendar label | `SchedulePage.tsx:112` | `"Add to Calendar"` | text | `actions.addCalendarLabel` | ❌ | `"Add to Calendar"` |
| 10 | Directions label | `SchedulePage.tsx:119` | `"Directions"` | text | `actions.directionsLabel` | ❌ | `"Directions"` |
| 11 | Calendar event title | `SchedulePage.tsx:21` | `"Eleanor & James Wedding"` | text | `calendar.calendarTitle` | ❌ | `""` |
| 12 | Calendar start datetime | `SchedulePage.tsx:22` | `"20271225T160000"` | text | `calendar.calendarStart` | ❌ | `""` |
| 13 | Calendar end datetime | `SchedulePage.tsx:22` | `"20271225T230000"` | text | `calendar.calendarEnd` | ❌ | `""` |
| 14 | Calendar event details | `SchedulePage.tsx:23` | `"Join us for our wedding celebration!\n\n4:00 PM — The Ceremony\n5:30 PM — Cocktail Hour\n7:00 PM — Dinner & Dancing\n\nFormal attire requested."` | richtext | `calendar.calendarDetails` | ❌ | `""` |
| 15 | Calendar location | `SchedulePage.tsx:24` | `"The Grand Estate"` | text | `calendar.calendarLocation` | ❌ | `""` |
| 16 | Venue section label | `SchedulePage.tsx:135` | `"Wedding Venue"` | text | `venue.venueLabel` | ❌ | `"Wedding Venue"` |
| 17 | Venue name | `SchedulePage.tsx:136` | `"The Singapore EDITION"` | text | `venue.venueName` | ✅ | `""` |
| 18 | Venue description | `SchedulePage.tsx:137-139` | `"Nestled in the heart of Orchard Road, The Singapore EDITION is a luxury boutique hotel..."` | richtext | `venue.venueDescription` | ❌ | `""` |
| 19 | Venue image | `SchedulePage.tsx:130` | `https://sfile.chatglm.cn/images-ppt/4adf4afbb9a2.jpg` | image | `venue.venueImage` | ❌ | `""` |

### 10.3 RSVPPage Field Mapping

| # | Field Description | Component Location | Current Hardcoded Value | CMS Block Type | Field Key | Required | Default Value |
|---|------------------|-------------------|------------------------|----------------|-----------|----------|---------------|
| 1 | Header couple name | `RSVPPage.tsx:242` | `"Eleanor & James"` | text | `header.headerTitle` | ✅ | `""` (auto-populated from account) |
| 2 | Venue address line 1 | `RSVPPage.tsx:243` | `"The Singapore EDITION, 38 Cuscaden Road"` | text | `header.venueAddress` | ✅ | `""` |
| 3 | Venue address line 2 | `RSVPPage.tsx:244` | `"Singapore 249731"` | text | `header.venueCity` | ❌ | `""` |
| 4 | Step 1 title | `RSVPPage.tsx:258` | `"Enter your name to RSVP"` | text | `step1.step1Title` | ❌ | `"Enter your name to RSVP"` |
| 5 | Step 1 subtitle | `RSVPPage.tsx:259-260` | `"You can respond for more guests in the following steps."` | text | `step1.step1Subtitle` | ❌ | `"You can respond for more guests in the following steps."` |
| 6 | First Name label | `RSVPPage.tsx:267` | `"First Name"` | text | `step1.firstNameLabel` | ❌ | `"First Name"` |
| 7 | Last Name label | `RSVPPage.tsx:278` | `"Last Name"` | text | `step1.lastNameLabel` | ❌ | `"Last Name"` |
| 8 | Step 2 title | `RSVPPage.tsx:304` | `"How many people are in your party?"` | text | `step2.step2Title` | ❌ | `"How many people are in your party?"` |
| 9 | Step 2 hint | `RSVPPage.tsx:323-324` | `"Include yourself and anyone attending with you."` | text | `step2.step2Hint` | ❌ | `"Include yourself and anyone attending with you."` |
| 10 | Step 3 title | `RSVPPage.tsx:347` | `"Confirm each guest and their dietary needs."` | text | `step3.step3Title` | ❌ | `"Confirm each guest and their dietary needs."` |
| 11 | Step 3 hint | `RSVPPage.tsx:348-349` | `"Dietary selections are optional."` | text | `step3.step3Hint` | ❌ | `"Dietary selections are optional."` |
| 12 | Guest name placeholder | `RSVPPage.tsx:363` | `"Guest name"` | text | `step3.guestNamePlaceholder` | ❌ | `"Guest name"` |
| 13 | Add Guest label | `RSVPPage.tsx:399` | `"+ Add Another Guest"` | text | `step3.addGuestLabel` | ❌ | `"+ Add Another Guest"` |
| 14 | Dietary options (array) | `RSVPPage.tsx:13` | `["Halal", "Vegetarian", "No Seafood"]` | text[] | `step3.dietaryOptions` | ❌ | `["Halal", "Vegetarian", "No Seafood"]` |
| 15 | Attendance question | `RSVPPage.tsx:436` | `"Will you be able to join us for our Wedding Solemnisation?"` | text | `step4.attendanceQuestion` | ❌ | `"Will you be able to join us?"` |
| 16 | Attendance options (array) | `RSVPPage.tsx:15-19` | `[{val:"yes",label:"Yes!"},{val:"partial",label:"Yes, but I won't be staying..."},{val:"no",label:"I'm sorry, I won't be able to make it"}]` | text[] | `step4.attendanceOptions` | ❌ | (see default) |
| 17 | All-attending result title | `RSVPPage.tsx:198` | `"Thank you"` | text | `result.allAttendingTitle` | ❌ | `"Thank You"` |
| 18 | All-attending result message | `RSVPPage.tsx:219` | `"Your RSVP has been received. We can't wait to celebrate with you."` | text | `result.allAttendingMessage` | ❌ | `"Your RSVP has been received."` |
| 19 | All-declined result title | `RSVPPage.tsx:203` | `"We'll Miss You"` | text | `result.allDeclinedTitle` | ❌ | `"We'll Miss You"` |
| 20 | Mixed result title | `RSVPPage.tsx:212` | `"Thank you"` | text | `result.mixedTitle` | ❌ | `"Thank You"` |
| 21 | Next button label | `RSVPPage.tsx:293` | `"Next"` | text | `actions.nextLabel` | ❌ | `"Next"` |
| 22 | Back button label | `RSVPPage.tsx:328,405,455` | `"Back"` | text | `actions.backLabel` | ❌ | `"Back"` |
| 23 | Continue button label | `RSVPPage.tsx:413` | `"Continue"` | text | `actions.continueLabel` | ❌ | `"Continue"` |
| 24 | Save & Continue label | `RSVPPage.tsx:463` | `"Save & Continue"` | text | `actions.saveContinueLabel` | ❌ | `"Save & Continue"` |

### 10.4 GettingTherePage Field Mapping

| # | Field Description | Component Location | Current Hardcoded Value | CMS Block Type | Field Key | Required | Default Value |
|---|------------------|-------------------|------------------------|----------------|-----------|----------|---------------|
| 1 | Page title | `GettingTherePage.tsx:11` | `"Getting There"` | text | `banner.pageTitle` | ✅ | `"Getting There"` |
| 2 | Page subtitle | `GettingTherePage.tsx:11` | `"The Singapore EDITION, Orchard"` | text | `banner.pageSubtitle` | ❌ | `""` |
| 3 | Address label | `GettingTherePage.tsx:20` | `"ADDRESS"` | text | `address.addressLabel` | ❌ | `"ADDRESS"` |
| 4 | Venue name | `GettingTherePage.tsx:24-25` | `"The Singapore EDITION"` | text | `address.venueName` | ✅ | `""` |
| 5 | Venue address | `GettingTherePage.tsx:28` | `"38 Cuscaden Road, Singapore 249731"` | text | `address.venueAddress` | ✅ | `""` |
| 6 | Tab: By Car label | `GettingTherePage.tsx:44` | `"BY CAR"` | text | `transit.tabCarLabel` | ❌ | `"BY CAR"` |
| 7 | Tab: Public Transit label | `GettingTherePage.tsx:53` | `"PUBLIC TRANSIT"` | text | `transit.tabTransitLabel` | ❌ | `"PUBLIC TRANSIT"` |
| 8 | Parking label | `GettingTherePage.tsx:69` | `"PARKING"` | text | `car.parkingLabel` | ❌ | `"PARKING"` |
| 9 | Parking info | `GettingTherePage.tsx:72-73` | `"Valet parking is available at the hotel entrance. Alternatively, guests may utilise the hotel's basement car park, subject to availability."` | richtext | `car.parkingInfo` | ❌ | `""` |
| 10 | Parking concierge note | `GettingTherePage.tsx:76` | `"Kindly inform the concierge that you are attending the Dreamweavers event."` | text | `car.parkingConciergeNote` | ❌ | `""` |
| 11 | Airport label | `GettingTherePage.tsx:84` | `"FROM THE AIRPORT"` | text | `car.airportLabel` | ❌ | `"FROM THE AIRPORT"` |
| 12 | Airport info | `GettingTherePage.tsx:88` | `"Via CTE / Orchard Road, the journey from Singapore Changi Airport is approximately 25–30 minutes, subject to traffic conditions."` | text | `car.airportInfo` | ❌ | `""` |
| 13 | MRT label | `GettingTherePage.tsx:103` | `"MRT"` | text | `mrt.mrtLabel` | ❌ | `"MRT"` |
| 14 | MRT stations (array) | `GettingTherePage.tsx:107-124` | `[{name:"Orchard Boulevard MRT Station",code:"(TE13)",desc:"Approximately 4–5 minutes' walk"},{name:"Orchard MRT Station",code:"(NS22/TE14)",desc:"Approximately 8–10 minutes' walk"}]` | venue-info[] | `mrt.mrtStations` | ❌ | `[]` |
| 15 | Bus label | `GettingTherePage.tsx:131` | `"BUS"` | text | `bus.busLabel` | ❌ | `"BUS"` |
| 16 | Bus info | `GettingTherePage.tsx:136-142` | `"Guests may alight at Bef Tomlinson Rd (09121) or Opp Four Seasons Hotel (09111)...Available bus services: 7, 36, 36A, 36B, 77, 105, 106, 111, 123, 132, 174, and 174e."` | richtext | `bus.busInfo` | ❌ | `""` |
| 17 | Map section label | `GettingTherePage.tsx:151` | `"FIND YOUR WAY"` | text | `map.mapLabel` | ❌ | `"FIND YOUR WAY"` |
| 18 | Map embed URL | `GettingTherePage.tsx:155` | `https://maps.google.com/maps?q=The+Singapore+EDITION+38+Cuscaden+Road+Singapore+249731&...` | map-embed | `map.mapEmbedUrl` | ❌ | `""` |
| 19 | Map search URL | `GettingTherePage.tsx:166` | `https://www.google.com/maps/search/The+Singapore+EDITION+38+Cuscaden+Road+Singapore+249731` | text | `map.mapSearchUrl` | ❌ | `""` |
| 20 | Open in Maps label | `GettingTherePage.tsx:172` | `"Open in Maps"` | text | `map.openMapsLabel` | ❌ | `"Open in Maps"` |

### 10.5 StoryPage Field Mapping

| # | Field Description | Component Location | Current Hardcoded Value | CMS Block Type | Field Key | Required | Default Value |
|---|------------------|-------------------|------------------------|----------------|-----------|----------|---------------|
| 1 | Page title | `StoryPage.tsx:78` | `"Our Story"` | text | `banner.pageTitle` | ✅ | `"Our Story"` |
| 2 | Hero intro text | `StoryPage.tsx:83-84` | `"A narrative woven through time, capturing the moments that led us here."` | text | `hero.heroIntro` | ❌ | `"A narrative woven through time..."` |
| 3 | Hero image | `StoryPage.tsx:7` | `https://lh3.googleusercontent.com/...AB6AXuBZxkwi...` | image | `hero.heroImage` | ❌ | `""` |
| 4 | Timeline milestones (array) | `StoryPage.tsx:96-147` | `[{date:"October 2018",title:"The First Chapter",body:"It began over accidentally swapped coffee orders...",image:CHAPTER1_IMG},{date:"December 2021",title:"The Proposal",body:"Underneath a canopy of winter stars...",image:PROPOSAL_IMG}]` | timeline-item[] | `timeline.milestones` | ❌ | `[]` |
| 5 | Tidbits section title | `StoryPage.tsx:154` | `"Tidbits"` | text | `tidbits.tidbitsTitle` | ❌ | `"Tidbits"` |
| 6 | Tidbits subtitle | `StoryPage.tsx:157` | `"A few things you might not know."` | text | `tidbits.tidbitsSubtitle` | ❌ | `"A few things you might not know."` |
| 7 | Tidbits items (array) | `StoryPage.tsx:15-24` | `[{q:"Who said \"I love you\" first?",a:"It was mutual, during a particularly chaotic road trip..."},{q:"Favorite shared hobby?",a:"Collecting vintage records and spending Sunday mornings..."}]` | faq-item[] | `tidbits.tidbits` | ❌ | `[]` |
| 8 | Honeymoon label | `StoryPage.tsx:184` | `"AFTER THE 'I DO'"` | text | `honeymoon.honeymoonLabel` | ❌ | `"AFTER THE 'I DO'"` |
| 9 | Honeymoon title | `StoryPage.tsx:188` | `"Where Next?"` | text | `honeymoon.honeymoonTitle` | ❌ | `"Where Next?"` |
| 10 | Honeymoon subtitle | `StoryPage.tsx:194` | `"Help us choose our honeymoon destination. Cast your vote!"` | text | `honeymoon.honeymoonSubtitle` | ❌ | `"Help us choose our honeymoon destination. Cast your vote!"` |
| 11 | Honeymoon destinations (array) | `StoryPage.tsx:26-29` | `[{name:"Amalfi Coast",votes:0},{name:"Kyoto",votes:0}]` | text[] | `honeymoon.destinations` | ❌ | `[]` |
| 12 | Suggest placeholder | `StoryPage.tsx:233` | `"Suggest a destination..."` | text | `honeymoon.suggestPlaceholder` | ❌ | `"Suggest a destination..."` |
| 13 | Submit label | `StoryPage.tsx:244` | `"Submit"` | text | `honeymoon.submitLabel` | ❌ | `"Submit"` |

### 10.6 MomentsPage Field Mapping

| # | Field Description | Component Location | Current Hardcoded Value | CMS Block Type | Field Key | Required | Default Value |
|---|------------------|-------------------|------------------------|----------------|-----------|----------|---------------|
| 1 | Page title | `MomentsPage.tsx:65` | `"Moments"` | text | `banner.pageTitle` | ✅ | `"Moments"` |
| 2 | Intro text | `MomentsPage.tsx:70-71` | `"The Journey Before the I Do—from childhood dreams to our first steps together."` | text | `intro.introText` | ❌ | `"The journey to our special day."` |
| 3 | Photos array | `MomentsPage.tsx:6-35` | 7 items: `[{alt:"Early Years",src:"https://..."},{alt:"College Days",src:"https://..."},{alt:"First Summer",src:"https://..."},{alt:"Where it Began",src:"https://..."},{alt:"Academic Milestones",src:"https://..."},{alt:"Early Adventures",src:"https://..."},{alt:"Social Circles",src:"https://..."}]` | gallery[] | `gallery.photos` | ❌ | `[]` |

### 10.7 WishesPage Field Mapping

| # | Field Description | Component Location | Current Hardcoded Value | CMS Block Type | Field Key | Required | Default Value |
|---|------------------|-------------------|------------------------|----------------|-----------|----------|---------------|
| 1 | Page title | `WishesPage.tsx:194` | `"Wishes & Blessings"` | text | `banner.pageTitle` | ✅ | `"Wishes & Blessings"` |
| 2 | Intro label | `WishesPage.tsx:200` | `"The Living Heirloom"` | text | `intro.introLabel` | ❌ | `"The Living Heirloom"` |
| 3 | Intro text | `WishesPage.tsx:202-203` | `"A curated sanctuary of wisdom and love from those we cherish most."` | text | `intro.introText` | ❌ | `"Leave us your wishes and blessings."` |
| 4 | Pre-populated wishes (array) | `WishesPage.tsx:6-36` | 5 items with types: `image` (2), `text-card` (1), `dark-card` (1), `minimal` (1) | richtext[] | `wishes.prepopulatedWishes` | ❌ | `[]` |
| 5 | Form section label | `WishesPage.tsx:299` | `"YOUR TURN"` | text | `form.formSectionLabel` | ❌ | `"YOUR TURN"` |
| 6 | Form section title | `WishesPage.tsx:304` | `"Contribute to the Heirloom"` | text | `form.formSectionTitle` | ❌ | `"Leave Your Wish"` |
| 7 | Full Name label | `WishesPage.tsx:313` | `"Full Name"` | text | `form.fullNameLabel` | ❌ | `"Full Name"` |
| 8 | Relationship label | `WishesPage.tsx:328` | `"Relationship"` | text | `form.relationshipLabel` | ❌ | `"Relationship"` |
| 9 | Message label | `WishesPage.tsx:341` | `"Your Message"` | text | `form.messageLabel` | ❌ | `"Your Message"` |
| 10 | Upload text | `WishesPage.tsx:412` | `"Attach a photo or memento"` | text | `form.uploadText` | ❌ | `"Attach a photo or memento"` |
| 11 | Upload hint | `WishesPage.tsx:415` | `"JPG, PNG, WebP up to 10MB"` | text | `form.uploadHint` | ❌ | `"JPG, PNG, WebP up to 10MB"` |
| 12 | Submit button label | `WishesPage.tsx:442` | `"Weave into Archive"` | text | `form.submitLabel` | ❌ | `"Send Your Wish"` |
| 13 | Submitting button label | `WishesPage.tsx:442` | `"Submitting..."` | text | `form.submittingLabel` | ❌ | `"Submitting..."` |
| 14 | Submitted button label | `WishesPage.tsx:442` | `"Woven"` | text | `form.submittedLabel` | ❌ | `"Sent!"` |

### 10.8 QAPage Field Mapping

| # | Field Description | Component Location | Current Hardcoded Value | CMS Block Type | Field Key | Required | Default Value |
|---|------------------|-------------------|------------------------|----------------|-----------|----------|---------------|
| 1 | Page title | `QAPage.tsx:34` | `"Frequently Asked"` | text | `banner.pageTitle` | ✅ | `"Frequently Asked"` |
| 2 | Intro text | `QAPage.tsx:41-42` | `"Everything you need to know for our celebration."` | text | `intro.introText` | ❌ | `"Everything you need to know."` |
| 3 | FAQ items (array) | `QAPage.tsx:6-23` | 4 items: dress code, transportation, children, dietary requirements | faq-item[] | `faqs.faqs` | ❌ | `[]` |
| 4 | CTA label | `QAPage.tsx:93` | `"NEED MORE HELP?"` | text | `cta.ctaLabel` | ❌ | `"NEED MORE HELP?"` |
| 5 | CTA title | `QAPage.tsx:99` | `"Still Seeking Clarity?"` | text | `cta.ctaTitle` | ❌ | `"Still Seeking Clarity?"` |
| 6 | CTA description | `QAPage.tsx:104-105` | `"Our concierge is standing by to assist with any questions about the event, travel, accommodations, or special arrangements."` | text | `cta.ctaDescription` | ❌ | `"Contact us if you have any questions."` |
| 7 | CTA button label | `QAPage.tsx:112` | `"Message the Couple"` | text | `cta.ctaButtonLabel` | ❌ | `"Message the Couple"` |
| 8 | CTA email | `QAPage.tsx:108` | `"concierge@dreamweavers.events"` | text | `cta.ctaEmail` | ❌ | `""` |

### 10.9 Shared Components Field Mapping

These fields appear across multiple pages or in shared components (Header, Footer, SectionBanner).

| # | Field Description | Component Location | Current Hardcoded Value | CMS Block Type | Field Key | Required | Default Value |
|---|------------------|-------------------|------------------------|----------------|-----------|----------|---------------|
| 1 | Navigation items | `Header.tsx:5-14` | `["Home","Schedule","RSVP","Getting There","Story","Wishes","Q&A","Moments"]` | — (derived from `ContentPage` records + feature flags) | — | — | — |
| 2 | Banner background (shared) | `SectionBanner.tsx:3` | `https://lh3.googleusercontent.com/...AB6AXuA-OyKf...` | image | Per-page `banner.bannerImage` | ❌ | `""` (inherits from platform default) |
| 3 | Footer copyright | `Footer.tsx:48-49` | `"© 2026 DREAMWEAVERS DIGITAL HEIRLOOMS. All rights reserved."` | text | `footer.copyrightText` (platform-level) | ❌ | `"© 2026 DREAMWEAVERS DIGITAL HEIRLOOMS. All rights reserved."` |
| 4 | Footer: Contact Concierge | `Footer.tsx:24-26` | `"Contact Concierge"` | text | `footer.contactConciergeLabel` (platform-level) | ❌ | `"Contact Concierge"` |
| 5 | Footer: Privacy Policy | `Footer.tsx:29-31` | `"Privacy Policy"` | text | `footer.privacyPolicyLabel` (platform-level) | ❌ | `"Privacy Policy"` |
| 6 | Footer: Data Protection | `Footer.tsx:34-36` | `"Data Protection"` | text | `footer.dataProtectionLabel` (platform-level) | ❌ | `"Data Protection"` |
| 7 | Footer: Terms of Service | `Footer.tsx:39-41` | `"Terms of Service"` | text | `footer.termsOfServiceLabel` (platform-level) | ❌ | `"Terms of Service"` |
| 8 | Couple name (used in Header FAB context) | `Header.tsx` + `Footer.tsx` | `"Eleanor & James"` (implicit) | text | Shared via `Account.coupleName1` + `Account.coupleName2` | ✅ | `""` |
| 9 | Venue name (used in multiple pages) | `SchedulePage.tsx`, `RSVPPage.tsx`, `GettingTherePage.tsx` | `"The Singapore EDITION"` | text | Shared via `address.venueName` + `venue.venueName` | ✅ | `""` |
| 10 | Logo image | `Header.tsx:29` | `"/dreamweavers-logo.png"` | text | Platform-level `PlatformSetting` | ❌ | `"/dreamweavers-logo.png"` |

### 10.10 Field Count Summary

| Page | Total Fields | Text | Richtext | Image | Gallery | Timeline | FAQ | Venue-Info | Map | JSON/Array |
|------|-------------|------|----------|-------|---------|----------|-----|------------|-----|------------|
| **HomePage** | 15 | 8 | 1 | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| **SchedulePage** | 19 | 6 | 2 | 3 | 0 | 1 | 0 | 0 | 0 | 7 |
| **RSVPPage** | 24 | 17 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 |
| **GettingTherePage** | 20 | 8 | 2 | 0 | 0 | 0 | 0 | 1 | 1 | 1 |
| **StoryPage** | 13 | 6 | 0 | 1 | 0 | 1 | 1 | 0 | 0 | 2 |
| **MomentsPage** | 3 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| **WishesPage** | 14 | 10 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| **QAPage** | 8 | 5 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| **Shared** | 10 | 5 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| **TOTAL** | **126** | **66** | **5** | **8** | **2** | **2** | **2** | **1** | **1** | **13** |

> **Note:** The 13 JSON/Array fields contain nested sub-fields. When expanded, the total individual editable values exceeds 80+, consistent with the original estimate of "~80+ individual content fields across all pages."

---

*End of Part 1 (Sections 1–10). Part 2 (Sections 11–20) will cover: API Route Design, CMS Editor UI Components, Auth Implementation, Media Upload Pipeline, Guest Management System, Publishing Workflow, Analytics Implementation, Seed Data & Migration, Testing Strategy, and Implementation Roadmap.*

---

# Dreamweavers CMS Implementation Blueprint — Part 2

> **Sections 11–20 of 20 · Part 2: Workflows, Security, API & Implementation**

---

## Table of Contents (Part 2)

| # | Section | Scope |
|---|---------|-------|
| 11 | [Wedding Lifecycle Workflow](#section-11-wedding-lifecycle-workflow) | 5-phase account lifecycle, status transitions |
| 12 | [Guest Invitation Workflow](#section-12-guest-invitation-workflow) | Guest list management, invitation delivery, auth model |
| 13 | [RSVP Workflow](#section-13-rsvp-workflow) | 4-step RSVP form, modification, dietary reports |
| 14 | [Guest Management System](#section-14-guest-management-system) | Guest data model, views, grouping, seating |
| 15 | [Notification Engine](#section-15-notification-engine) | Triggers, templates, channels, delivery |
| 16 | [Analytics Architecture](#section-16-analytics-architecture) | Event collection, dashboards, privacy, charts |
| 17 | [Security Architecture](#section-17-security-architecture) | Auth, authorization, rate limiting, audit logging |
| 18 | [API Architecture](#section-18-api-architecture) | Route organization, endpoint specs, standards |
| 19 | [UI/UX Wireframes (Described)](#section-19-uiux-wireframes-described) | Admin portal, workspace, content editor screens |
| 20 | [MVP Implementation Roadmap](#section-20-mvp-implementation-roadmap) | 4-phase, 8-week implementation plan |

---

## Section 11: Wedding Lifecycle Workflow

The complete lifecycle of a wedding account with 5 phases:

1. **Provisioning** (status: `draft`)
   - Account creation by platform admin or couple self-signup
   - Template selection (default: full 8-section template)
   - Initial content seed (default content from Platform Content library)
   - Welcome email sent to account owner
   - Workspace becomes accessible

2. **Setup Phase** (status: `setup`)
   - Couple edits content via Content Editor (all 8 pages)
   - Media uploaded to Media Library
   - Guest list imported (CSV) or manually entered
   - Invitation settings configured
   - Preview mode: couple can preview the live site
   - Test RSVP flow
   - Setup progress checklist tracks completion

3. **Active Phase** (status: `active`)
   - Site is published and accessible to guests
   - Invitations sent (email, SMS, shareable links)
   - RSVPs tracked in real-time
   - Wishes received and moderated
   - Contact messages received
   - Analytics collected
   - Content can still be edited (edits go live immediately or after re-publish)

4. **Event Day** (status: `event_day`)
   - Content locked (optional: read-only mode)
   - Live dashboard for couple (real-time guest check-in count)
   - Emergency content changes allowed (with audit log)

5. **Post-Event** (status: `archived`)
   - Site transitions to "keepsake" mode
   - Guest data export available (CSV, PDF)
   - Wishes and messages downloadable
   - Photo moments exportable
   - Account can be reactivated for anniversary mode (future feature)

Status enum and transitions:
```
draft → setup → active → event_day → archived
                                     ↑
setup → active (can skip event_day)
active → archived (can skip event_day)
archived → setup (reactivate)
```

Status-based UI changes:
- `draft`: Only workspace accessible, no guest-facing URL
- `setup`: Workspace + preview URL (password-protected)
- `active`: Full public URL, workspace still accessible
- `event_day`: Workspace shows live dashboard prominently
- `archived`: Workspace shows export options, site becomes read-only keepsake

## Section 12: Guest Invitation Workflow

**Guest List Management:**
- Manual add: form with name, email, phone (optional), group tag
- CSV import: column mapping UI, validation, duplicate detection
- Bulk operations: delete selected, change group, mark as sent
- Guest groups/tags: "Family - Bride", "Family - Groom", "Friends - College", "Colleagues", etc. (configurable per wedding)
- Search and filter: by name, group, RSVP status, invitation status

**Invitation Creation:**
- Each guest record generates a unique invitation with:
  - `token`: cryptographically random string (32 bytes, URL-safe base64)
  - `guestId`: FK to Guest
  - `weddingId`: FK to WeddingAccount
  - `status`: enum (pending, sent, delivered, opened, responded)
  - `sentAt`, `openedAt`, `respondedAt`: timestamps
  - `channel`: email | sms | link (how it was delivered)

**Invitation Delivery:**
- Email: SMTP or API (Resend/SendGrid) with branded template
  - Subject: "You're Invited to {{coupleName}}'s Wedding"
  - Body: personal message from couple (CMS-editable) + RSVP link
- SMS: future phase (Twilio/SNS)
- Shareable link: couple can copy/paste unique link
- QR Code: generated per guest for printed invitations

**Guest Authentication Model:**
- No account creation required for guests
- Token-based access: `/invite/[token]` resolves to guest context
- Token stored in URL (no login, no session)
- Token is single-use for RSVP (after submission, token status = responded)
- Edit link: separate `editToken` sent in confirmation email for modifications

**Password Protection (Feature Toggle):**
- When enabled, the site requires a password before any content is shown
- Password stored hashed on WeddingAccount model
- Shared password for all guests (wedding-specific, not per-guest)

**URL Structure:**
- Primary: `/invite/[token]` — guest-facing site with pre-filled context
- Fallback: `/[weddingSlug]` — public site (if no password protection)
- Admin: `/workspace/[weddingId]` — couple workspace
- Platform: `/admin` — Dreamweavers PTL

## Section 13: RSVP Workflow

**Pre-RSVP (Guest arrives):**
1. Guest clicks invitation link: `/invite/[token]`
2. API resolves token → returns guest context (name, party size allowed, plus-one status)
3. Frontend loads with guest context pre-populated

**RSVP Flow (4-step form, CMS-driven):**

Step 1 — Identify (CMS fields: `step1Title`, `step1Subtitle`):
- First name + Last name inputs
- Auto-filled from invitation token (editable)
- Validation: both required

Step 2 — Party Size (CMS fields: `step2Title`, `step2Hint`):
- Number stepper: 1 to maxPartySize (from invitation/guest record)
- If guest has plusOne=true, minimum is 2

Step 3 — Guest Details (CMS fields: `step3Title`, `step3Hint`, `step3AddLabel`, `dietaryOptions[]`):
- For each guest in party: name input + dietary selection (pills)
- Dietary options loaded from CMS content (default: ['Halal', 'Vegetarian', 'No Seafood'])
- "Add Another Guest" button (up to party size from step 2)

Step 4 — Attendance (CMS fields: `step4Question`, `attendanceOptions[]`):
- Per-guest attendance selection (radio buttons)
- Options from CMS (default: yes, partial, no)
- If "no" selected, skip dietary for that guest

**Post-RSVP:**
- Result screen with 3 variants (CMS fields: `resultAllAttending`, `resultAllDeclined`, `resultMixed`)
- Confirmation email to guest (template from notification engine)
- Real-time notification to couple (dashboard update)
- RSVP record created: RSVPSubmission + GuestResponse records
- Invitation status updated to `responded`

**RSVP Modification:**
- Confirmation email includes `editToken` link
- Guest can modify RSVP up until `rsvpDeadline` (account setting)
- Modification creates new GuestResponse records (audit trail preserved)

**RSVP Deadline:**
- Optional per-wedding setting (date/time)
- After deadline: RSVP form shows "RSVP has closed" message
- Admin can override deadline for individual guests

**Dietary Summary Report:**
- Aggregated count per dietary option
- Exportable as PDF for catering
- Filterable by attendance status (only count attending guests)

**Waitlist (Future Feature Toggle):**
- When maxGuests reached, new RSVPs go to waitlist
- Auto-promote if space opens (cancellation)
- Manual promote/deny by couple

## Section 14: Guest Management System

**Guest Data Model:**
```
Guest {
  id, weddingId, firstName, lastName, email?, phone?,
  groupTag?, tableAssignment?, plusOne, maxPartySize,
  rsvpStatus: 'pending' | 'responded' | 'declined',
  invitationStatus: 'pending' | 'sent' | 'opened' | 'responded',
  notes?, createdAt, updatedAt
}
```

**Guest List Views:**
- **Table View**: Data table (shadcn Table) with columns: Name, Email, Group, RSVP Status, Party Size, Actions
- **List View**: Card-based list with status badges
- **Kanban View**: Columns by status (Not Sent, Sent, Opened, Responded, Declined)
- Search: by name or email
- Filters: by group tag, RSVP status, invitation status, dietary requirement

**Guest Grouping:**
- Tags system (free-form text, with autocomplete from existing tags)
- Default suggested tags: "Family - Bride", "Family - Groom", "Friends", "Colleagues", "VIP"
- Bulk group assignment
- Filter by group

**Table/Seating Assignment:**
- Drag-and-drop using @dnd-kit (already in dependencies)
- Visual table layout editor
- Assign guests to tables
- Unassigned guests bucket
- Export seating chart

**Guest Communication:**
- Individual: compose email to single guest
- Group: compose email to all guests in a group
- Broadcast: compose email to all guests
- Templates: use notification engine templates
- Preview before sending

**RSVP Tracking Dashboard:**
- Summary cards: Total Invited, RSVPs Received, Attending, Declined, Pending
- Pie chart: Attending vs Declined vs Pending (recharts)
- Dietary breakdown: bar chart of dietary requirements
- Timeline: RSVP submissions over time (line chart)
- Recent RSVPs: live feed of latest responses

**Data Export:**
- CSV export: all guest data with RSVP responses
- PDF export: formatted guest list with dietary summary
- Excel export: for seating planning

**Bulk Operations:**
- Select multiple guests → change group, mark as sent, resend invitation, delete
- Select all / deselect all
- Select by filter result

## Section 15: Notification Engine

**Notification Channels (MVP):**
- Email: primary channel (SMTP or API: Resend)
- SMS: future (Twilio)
- In-App: future (real-time via WebSocket)

**Notification Triggers:**

| Category | Trigger | Recipient | Template |
|----------|---------|-----------|----------|
| Account | Welcome email | Account owner | `account.welcome` |
| Account | Setup reminder (7 days inactive) | Account owner | `account.setupReminder` |
| Account | Site published confirmation | Account owner | `account.published` |
| Guest | Invitation sent | Guest | `guest.invitation` |
| Guest | RSVP reminder (before deadline) | Guest (pending) | `guest.rsvpReminder` |
| Guest | Event reminder (1 week before) | Guest (attending) | `guest.eventReminder` |
| Guest | Thank you (post-event) | Guest (attended) | `guest.thankYou` |
| Guest | RSVP confirmation | Guest (just responded) | `guest.rsvpConfirmation` |
| Admin | New RSVP received | Account owner | `admin.newRsvp` |
| Admin | New wish submitted | Account owner | `admin.newWish` |
| Admin | New contact message | Account owner | `admin.newContact` |
| Admin | Daily digest | Account owner | `admin.dailyDigest` |
| System | Approaching limits | Account owner | `system.limitsWarning` |

**Template Variables (Merge Fields):**
```
{{coupleName}}     — "Eleanor & James"
{{guestFirstName}} — "Sarah"
{{guestLastName}}  — "Chen"
{{weddingDate}}    — "December 25, 2027"
{{venueName}}      — "The Singapore EDITION"
{{venueAddress}}   — "38 Cuscaden Road, Singapore 249731"
{{rsvpLink}}       — "https://dreamweavers.events/invite/abc123"
{{editLink}}       — "https://dreamweavers.events/invite/edit/xyz789"
{{siteUrl}}        — "https://dreamweavers.events/eleanor-james"
{{platformName}}   — "Dreamweavers"
```

**Template Storage:**
- System templates: stored in `NotificationTemplate` model
- Per-account overrides: account can customize subject and body
- Rich text support: templates support basic HTML
- Preview: render template with sample data before saving

**Notification Preferences:**
- Per-account settings: opt-in/out by notification category
- Guest opt-out: unsubscribe link in emails (respects GDPR)

**Email Delivery (MVP):**
- SMTP configuration in Platform Settings
- Alternative: Resend API (API key in env)
- From address: `noreply@dreamweavers.events` (or custom domain)
- Reply-to: couple's email or support email

## Section 16: Analytics Architecture

**Metrics Collection:**
- Page view: which section viewed, timestamp, referrer
- Time on page: section enter/exit timestamps
- RSVP conversion: invitation opened → RSVP submitted
- Wish submission count
- Contact message count
- Device/browser breakdown

**Analytics Data Model:**
```
AnalyticsEvent {
  id, weddingId, eventType: 'page_view' | 'rsvp' | 'wish' | 'contact' | 'session_start' | 'session_end',
  metadata: Json (flexible payload per event type),
  guestId?, // null for anonymous
  sessionId, // browser session
  ipAddress?, // hashed for privacy
  userAgent?, createdAt
}
```

**Aggregation Strategy:**
- Raw events stored for 90 days
- Daily aggregation job: roll up into daily summaries
- Summary model: `AnalyticsSummary { weddingId, date, pageViews, rsvpCount, wishCount, contactCount, uniqueVisitors }`

**Dashboard Views:**

*Platform Admin Dashboard:*
- Total accounts, Active sites, Draft accounts
- Total guests across all weddings
- Total RSVPs (all weddings), Average RSVP rate
- Chart: new accounts over time (line)
- Chart: RSVP conversion rates across weddings (bar)
- Recent activity feed (latest 20 events across all weddings)

*Couple Dashboard:*
- Page views by section (horizontal bar chart)
- RSVP progress: pie chart (Attending / Declined / Pending)
- Wishes count (stat card)
- Guest engagement timeline (area chart: page views per day)
- Recent submissions feed (RSVPs, wishes, contacts)
- Setup progress checklist (content filled? guests added? invitations sent? published?)

**Chart Implementation (recharts — already installed):**
- `ResponsiveContainer` for responsive sizing
- `PieChart` for RSVP breakdown
- `BarChart` for page views by section
- `LineChart` for engagement over time
- `AreaChart` for timeline views
- Custom tooltip components matching the design system (paper-cream bg, charcoal-ink text, gold accents)

**Real-time Updates (MVP):**
- Polling: couple dashboard polls `/api/workspace/analytics` every 30 seconds
- WebSocket: future phase for live guest check-in during event

**Privacy & Compliance:**
- IP addresses hashed before storage
- User agent stored but not used for profiling
- Guest analytics: anonymous by default (no guestId unless from invitation link)
- Data retention: raw events 90 days, summaries 2 years
- Right to deletion: guest data can be anonymized/deleted per GDPR

**Export:**
- CSV export of all analytics data
- PDF report generation for couple (pre-formatted)

## Section 17: Security Architecture

**Authentication (NextAuth.js v4 — already in dependencies):**

*Platform Admin:*
```
Provider: CredentialsProvider
  - Email + bcrypt-hashed password
  - Platform admin users stored in User model (role = 'platform_admin')
  - Session: JWT strategy (for API routes) + database session (for UI)
```

*Couple / Account Members:*
```
Provider: CredentialsProvider (MVP) or MagicLinkProvider (future)
  - Email + password (set during account creation)
  - Account membership verified via AccountMember table
  - Session includes: userId, weddingId, role
```

*Guests:*
```
No authentication required
  - Access via invitation token in URL
  - Token validated server-side on each request
  - No session, no cookies
```

**Authorization Middleware (Next.js middleware.ts):**

| Route Pattern | Required Auth | Validation |
|---------------|--------------|------------|
| `/admin/*` | Platform Admin session | `role === 'platform_admin'` |
| `/workspace/*` | Account Member session | `weddingId` matches session, `role` has permission |
| `/api/admin/*` | Platform Admin | Session or API key |
| `/api/workspace/*` | Account Member | Session with matching `weddingId` |
| `/api/guest/*` | Valid token | Token exists, not expired, not revoked |
| `/api/content/*` | Public | No auth (rate limited) |
| `/invite/[token]` | Valid token | Token resolves to active wedding |

**Implementation:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/admin')) {
    // Check session for platform_admin role
    // Redirect to /admin/login if not authenticated
  }
  
  if (pathname.startsWith('/workspace')) {
    // Check session for account member
    // Verify weddingId from URL matches session
    // Redirect to /workspace/login if not authenticated
  }
  
  if (pathname.startsWith('/api/admin')) {
    // Check Authorization header or session
    // Return 401 if not authenticated
  }
  
  if (pathname.startsWith('/api/workspace')) {
    // Check session for account member
    // Return 401/403 if not authorized
  }
}
```

**Rate Limiting (MVP — in-memory):**
- Guest endpoints: 10 requests/minute per IP
- RSVP submission: 5 per minute per IP
- Wishes submission: 10 per minute per IP
- Contact submission: 3 per minute per IP
- Admin/Workspace: 100 per minute per session
- Implementation: simple Map-based counter with TTL

**Input Validation:**
- ALL endpoints use Zod schemas (already established pattern)
- File uploads: type whitelist + size limit + image compression
- No raw SQL (Prisma parameterized queries)
- JSON body size limit: 10MB

**CSRF Protection:**
- Next.js built-in CSRF protection for form submissions
- SameSite cookies for session management
- API routes use Bearer token or session cookie

**Content Security Policy:**
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com
img-src 'self' data: blob: https://lh3.googleusercontent.com
frame-src https://www.google.com
connect-src 'self'
```

**Audit Logging:**
- All write operations (create, update, delete) logged to AuditLog
- Fields: userId, action, resource, resourceId, changes (JSON diff), ipAddress, timestamp
- Viewable in Platform Admin → Audit Logs
- Retained for 1 year

**PII Handling:**
- Guest data: encrypted email/phone fields (application-level encryption)
- Data minimization: collect only what's needed
- Retention policy: guest data deletable after event + 90 days
- Right to access: guests can request their data export
- Right to erasure: guests can request deletion (anonymize in analytics)

## Section 18: API Architecture

**Route Organization:**
```
src/app/api/
├── admin/                    # Platform Admin APIs
│   ├── route.ts              # Dashboard stats
│   ├── accounts/
│   │   ├── route.ts          # GET (list), POST (create)
│   │   └── [id]/
│   │       └── route.ts      # GET, PUT, DELETE
│   ├── analytics/
│   │   └── route.ts          # GET platform-wide analytics
│   ├── audit-logs/
│   │   └── route.ts          # GET (paginated)
│   ├── features/
│   │   └── route.ts          # GET, POST (global feature definitions)
│   └── settings/
│       └── route.ts          # GET, PUT (platform settings)
├── workspace/                # Couple Workspace APIs
│   ├── content/
│   │   └── [pageSlug]/
│   │       └── route.ts      # GET, PUT (page content)
│   ├── settings/
│   │   └── route.ts          # GET, PUT (wedding settings)
│   ├── media/
│   │   ├── route.ts          # GET (list), POST (upload)
│   │   └── [id]/
│   │       └── route.ts      # GET, DELETE
│   ├── guests/
│   │   ├── route.ts          # GET (list), POST (add)
│   │   ├── import/
│   │   │   └── route.ts      # POST (CSV import)
│   │   ├── export/
│   │   │   └── route.ts      # GET (CSV/PDF export)
│   │   └── [id]/
│   │       └── route.ts      # GET, PUT, DELETE
│   ├── rsvp/
│   │   ├── summary/
│   │   │   └── route.ts      # GET (RSVP analytics)
│   │   └── dietary/
│   │       └── route.ts      # GET (dietary summary)
│   ├── wishes/
│   │   ├── route.ts          # GET (list with pagination)
│   │   └── [id]/
│   │       └── route.ts      # PATCH (moderate), DELETE
│   ├── contacts/
│   │   └── route.ts          # GET (list)
│   ├── notifications/
│   │   └── route.ts          # GET (preferences), PUT (update)
│   ├── publish/
│   │   └── route.ts          # POST (publish/unpublish)
│   └── analytics/
│       └── route.ts          # GET (wedding-specific analytics)
├── guest/                    # Guest-Facing APIs
│   ├── invite/
│   │   └── [token]/
│   │       └── route.ts      # GET (resolve invitation)
│   ├── rsvp/
│   │   └── route.ts          # POST (submit RSVP)
│   ├── wishes/
│   │   └── route.ts          # POST (submit wish), GET (public wishes)
│   └── contact/
│       └── route.ts          # POST (submit contact form)
├── content/                  # Public Content Delivery
│   └── [weddingSlug]/
│       └── [pageSlug]/
│           └── route.ts      # GET (cached page content)
└── auth/                     # NextAuth routes
    └── [...nextauth]/
        └── route.ts          # NextAuth handler
```

**Key Endpoint Specifications:**

`GET /api/admin/accounts`
- Auth: Platform Admin
- Query: ?page=1&limit=20&status=active&search=eleanor
- Response: `{ accounts: Account[], total: number, page: number, limit: number }`
- DB: `db.weddingAccount.findMany({ skip, take, where, include: { owner: true } })`

`POST /api/admin/accounts`
- Auth: Platform Admin
- Body: `{ coupleName, slug, ownerEmail, ownerName, plan }`
- Response: `{ account: Account }`
- DB: Create WeddingAccount + User + AccountMember + seed default content

`GET /api/workspace/content/[pageSlug]`
- Auth: Account Member (session.weddingId)
- Response: `{ page: { slug, sections: ContentSection[] } }`
- DB: `db.contentPage.findUnique({ where: { weddingId_slug }, include: { sections: { include: { blocks: true } } } })`

`PUT /api/workspace/content/[pageSlug]`
- Auth: Account Member with `content:edit` permission
- Body: `{ sections: [{ sectionKey, blocks: [{ blockKey, type, value }] }] }`
- Response: `{ success: true }`
- DB: Upsert content blocks, update ContentPage.updatedAt, create AuditLog entry

`POST /api/workspace/media`
- Auth: Account Member with `media:upload` permission
- Body: FormData (file)
- Response: `{ asset: { id, url, filename, mimeType, size } }`
- Storage: Save to `public/uploads/[weddingId]/[filename]`, create MediaAsset record

`GET /api/guest/invite/[token]`
- Auth: None (public, rate limited)
- Response: `{ guest: { firstName, lastName, maxPartySize, plusOne }, wedding: { coupleName, content: { home: {...}, schedule: {...} } } }`
- DB: Resolve token → Guest + WeddingAccount + ContentPages

`POST /api/guest/rsvp`
- Auth: None (public, rate limited)
- Body: `{ token, firstName, lastName, partySize, guests: [{ name, attendance, dietary }] }`
- Response: `{ success: true, id }`
- DB: Create RSVPSubmission + GuestResponse, update Guest.rsvpStatus, update Invitation.status

`GET /api/content/[weddingSlug]/[pageSlug]`
- Auth: None (public, cached)
- Response: `{ page: { slug, title, sections: ContentSection[] } }`
- Cache: ISR with revalidation every 60 seconds
- DB: `db.contentPage.findUnique({ where: { weddingId_slug, wedding: { status: 'active' } } })`

**Response Standards:**
- Success: `{ success: true, data: T }` or `{ data: T }` for GET
- Error: `{ error: string, details?: object }` with appropriate HTTP status
- List: `{ items: T[], total: number, page: number, limit: number }`
- Paginated: `?page=1&limit=20` (default: page 1, limit 20)

## Section 19: UI/UX Wireframes (Described)

**Design Language for CMS:**
- Extend the existing wedding design system into the CMS
- Paper-cream backgrounds, cinematic-gold accents, charcoal-ink text
- `.input-line` style for form fields (bottom border, no background)
- `text-[11px] tracking-[0.18em] uppercase` labels
- shadcn/ui components for structure (Card, Table, Dialog, Tabs, etc.)
- Consistent sidebar navigation pattern

### Master Admin Portal Screens

**Login Page (`/admin/login`):**
- Centered card (max-w-md) on paper-cream background
- Dreamweavers logo at top
- Email input + Password input (`.input-line` style)
- "Sign In" button (charcoal-ink bg, paper-cream text)
- Gold accent line at top of card

**Dashboard (`/admin`):**
- Top: 4 stat cards in a row (Total Accounts, Active Sites, Total Guests, Total RSVPs)
  - Each: label (uppercase, 11px, tracking), value (48px, Playfair Display), gold bottom border
- Middle: 2-column grid
  - Left: "New Accounts Over Time" line chart (recharts, charcoal lines on cream bg)
  - Right: "Recent Activity" feed (scrollable list, max-h-96, custom-scrollbar)
- Bottom: "Top Performing Weddings" table (shadcn Table, 5 rows)

**Accounts List (`/admin/accounts`):**
- Top bar: Search input + Status filter (Tabs: All, Draft, Setup, Active, Archived)
- Table (shadcn Table): Name, Slug, Status (Badge), Owner, Guests, RSVPs, Created, Actions
- Click row → Account Detail page
- "New Account" button (top right, charcoal-ink)

**Account Detail (`/admin/accounts/[id]`):**
- Left sidebar (w-64): Account nav (Overview, Content, Guests, Wishes, Settings)
- Main area: Dynamic based on sidebar selection
- Overview: Same stat cards as dashboard but wedding-specific + recent activity
- Content: Read-only preview of wedding content (all 8 pages)

**Feature Flags (`/admin/features`):**
- Grouped by category (Page Visibility, Interactive Features, Display Options)
- Each flag: Label + Description + Global Switch (shadcn Switch)
- Table layout with category headers

**Settings (`/admin/settings`):**
- Section: Email (SMTP host, port, user, pass, from address)
- Section: Platform (name, URL, logo upload)
- Section: Limits (default guests per plan, media storage per plan)
- Save button per section

### Couple Workspace Screens

**Login Page (`/workspace/login`):**
- Same centered card pattern as admin login
- Email + Password (or "Send Magic Link" button)
- Wedding name displayed: "Sign in to [Couple Name]'s Workspace"

**Couple Dashboard (`/workspace`):**
- Top: Welcome message "Welcome back, [Name]" (Playfair Display, 32px)
- Setup Progress Checklist (if status=setup):
  - Checklist items: Edit home page, Upload photos, Add guests, Send invitations, Preview site, Publish
  - Each: icon + label + checkmark when complete (cinematic-gold)
  - Progress bar at top
- Stat cards row: Page Views, RSVPs Received, Wishes, Messages
- Two-column:
  - Left: RSVP Progress pie chart (Attending/Declined/Pending)
  - Right: Recent Submissions feed (wishes + RSVPs + contacts, max-h-80)
- Bottom: Quick Actions row (Edit Content, Add Guests, Preview Site)

**Content Editor (`/workspace/content`):**
- Left sidebar (w-64): Page list with icons
  - Home, Schedule, RSVP, Getting There, Story, Wishes, Q&A, Moments
  - Each: Material Symbol icon + label + completion indicator (gold dot if all required fields filled)
- Main area: Form-based editor for selected page
  - Page title (editable, Playfair Display, 24px)
  - Sections listed vertically, each in a Card component
  - Each section:
    - Section header (uppercase, 11px, gold)
    - Fields within section using `.input-line` style
    - Image fields: Dropzone upload area (existing pattern from Wishes upload)
    - Array fields (timeline, FAQs, photos): Sortable list items with @dnd-kit
      - Each item: Card with fields + drag handle + delete button
      - "Add Item" button at bottom
    - Rich text fields: MDXEditor (already in dependencies)
  - Sticky bottom bar: "Save Draft" + "Preview" + "Publish Changes" buttons

**Media Library (`/workspace/media`):**
- Top bar: Upload button (charcoal-ink) + Search input + Filter (All, Images, Documents)
- Grid view: 4 columns on desktop, 2 on mobile
  - Each item: Thumbnail (aspect-square, object-cover) + filename + size
  - Hover: overlay with delete button + copy URL button
- Click: Lightbox modal (shadcn Dialog) with full preview + metadata + delete
- Upload: Click "Upload" → file picker → multi-file support → progress indicator

**Guest Management (`/workspace/guests`):**
- Top bar: "Add Guest" button + "Import CSV" button + Search input
- Tabs: All Guests, Pending, Attending, Declined
- Table (shadcn Table):
  - Columns: Checkbox, Name, Email, Group (Badge), RSVP Status (Badge with color), Party, Actions
  - Row click → Guest detail slide-over (shadcn Sheet)
  - Bulk actions: Select rows → "Send Invitations" / "Change Group" / "Export Selected"
- Guest Detail Sheet:
  - Guest info (name, email, phone, group)
  - RSVP details (if responded: attendance, dietary, party members)
  - Timeline: invitation sent → opened → responded (timestamps)
  - Actions: Send Invitation, Edit Guest, Delete Guest

**RSVP Analytics (`/workspace/guests/analytics`):**
- Summary cards: Total Invited, Responded, Attending, Declined, Pending
- Pie chart: RSVP breakdown (recharts, gold/champagne/charcoal palette)
- Bar chart: Dietary requirements summary
- Table: All responses with filter/sort/export

**Wishes Moderation (`/workspace/wishes`):**
- Tab bar: All, Published, Hidden, With Photos
- Masonry-style card list (matching the wedding site's wish cards)
- Each card: Guest name, relationship, message, image (if any), timestamp
- Actions per card: "Hide" / "Unhide" toggle + "Delete" button
- "Export All" button (downloads as PDF)

**Live Preview (`/workspace/preview`):**
- Full-width iframe showing the wedding site
- Top bar: "Desktop" / "Tablet" / "Mobile" viewport toggles
- "Open in New Tab" button
- Overlay badge: "PREVIEW MODE" (gold, top-left corner)

## Section 20: MVP Implementation Roadmap

### Phase 0: Foundation (Current Sprint)

**Deliverables:**
- Extended Prisma schema (all 18+ models from Section 7)
- Multi-tenant Prisma middleware (automatic weddingId scoping)
- NextAuth.js configuration (credentials provider for platform admin)
- Basic admin login flow
- Database seed script (default content, platform settings, demo account)
- Route group scaffolding (`/admin/`, `/workspace/`, `/guest/`, `/api/content/`)

**Files to Create:**
```
prisma/schema.prisma              — Extended with all new models
prisma/seed.ts                    — Seed data script
src/lib/tenant.ts                 — Tenant resolution utilities
src/lib/permissions.ts            — Permission checking utilities
src/middleware.ts                  — Auth/authorization middleware
src/app/api/auth/[...nextauth]/route.ts — NextAuth handler
src/app/api/auth/[...nextauth]/auth.config.ts — Auth config
src/app/admin/login/page.tsx      — Admin login page
src/app/admin/layout.tsx          — Admin layout with sidebar
src/app/admin/page.tsx            — Admin dashboard (scaffold)
src/app/workspace/layout.tsx      — Workspace layout (scaffold)
src/app/workspace/login/page.tsx  — Workspace login page (scaffold)
```

**Files to Modify:**
```
src/app/api/admin/route.ts        — Add auth check, weddingId scoping
src/app/api/rsvp/route.ts         — Add weddingId, invitation token support
src/app/api/wishes/route.ts       — Add weddingId
src/app/api/contact/route.ts      — Add weddingId
```

**Complexity:** High (schema design is foundational, gets all relationships right)
**Dependencies:** None (this is the foundation)

---

### Phase 1: Core CMS (Weeks 1-3)

**Week 1: Content Model + APIs**
- ContentPage, ContentSection, ContentBlock CRUD APIs
- Content seed data for all 8 pages (migrate hardcoded values to seed)
- Content delivery API (`/api/content/[weddingSlug]/pageSlug`)
- Workspace content editor: backend APIs

**Week 2: Content Editor UI**
- Workspace sidebar navigation
- Content editor form for each page (all 8)
- Dynamic content rendering: modify frontend components to read from API
- `.input-line` form fields for all text content
- Image upload for all image fields
- Array field editors (timeline items, FAQs, gallery) with add/remove

**Week 3: Media + Preview + Polish**
- Media Library UI (upload, grid, delete)
- Live preview (iframe-based)
- Account CRUD in admin portal
- Basic admin dashboard with real data
- Publishing workflow (draft → published)

**Files to Create:**
```
src/app/api/workspace/content/[pageSlug]/route.ts
src/app/api/workspace/media/route.ts
src/app/api/workspace/media/[id]/route.ts
src/app/api/workspace/settings/route.ts
src/app/api/workspace/publish/route.ts
src/app/api/content/[weddingSlug]/[pageSlug]/route.ts
src/app/api/admin/accounts/route.ts
src/app/api/admin/accounts/[id]/route.ts
src/app/workspace/content/page.tsx          — Content editor
src/app/workspace/media/page.tsx           — Media library
src/app/workspace/preview/page.tsx         — Live preview
src/app/workspace/page.tsx                — Couple dashboard
src/components/cms/ContentEditor.tsx       — Reusable content editor
src/components/cms/ImageField.tsx          — Image upload field
src/components/cms/ArrayField.tsx          — Array field editor
src/components/cms/RichTextField.tsx       — MDX editor field
src/store/useContentStore.ts              — Zustand content store
src/hooks/useContentBlock.ts              — Content block hook
src/hooks/useWeddingContent.ts            — Wedding content fetcher
```

**Files to Modify:**
```
src/components/wedding/pages/HomePage.tsx       — Replace hardcoded → useContentBlock
src/components/wedding/pages/SchedulePage.tsx    — Replace hardcoded → useContentBlock
src/components/wedding/pages/GettingTherePage.tsx — Replace hardcoded → useContentBlock
src/components/wedding/pages/StoryPage.tsx       — Replace hardcoded → useContentBlock
src/components/wedding/pages/MomentsPage.tsx     — Replace hardcoded → useContentBlock
src/components/wedding/pages/WishesPage.tsx      — Replace hardcoded → useContentBlock
src/components/wedding/pages/QAPage.tsx          — Replace hardcoded → useContentBlock
src/components/wedding/pages/RSVPPage.tsx        — Replace hardcoded → useContentBlock
src/components/wedding/Header.tsx                — Dynamic nav from CMS
src/components/wedding/Footer.tsx                — Dynamic content from CMS
src/components/wedding/SectionBanner.tsx         — Dynamic image from CMS
src/app/page.tsx                                — Add content provider
```

**Complexity:** Very High (most code changes, core value delivery)
**Dependencies:** Phase 0 complete

---

### Phase 2: Guest System (Weeks 4-5)

**Week 4: Guest Management**
- Guest CRUD APIs (list, add, edit, delete)
- CSV import API (column mapping, validation)
- Guest management UI (table, search, filter, groups)
- Invitation model + token generation
- Invitation sending (email via Resend/SMTP)

**Week 5: Guest-Facing Site + RSVP**
- Invitation token resolution API
- Guest-facing content delivery (public, cached)
- URL routing: `/invite/[token]` → loads site with guest context
- RSVP flow with invitation context (auto-fill, party size limit)
- RSVP modification (edit token)
- RSVP summary + dietary report

**Files to Create:**
```
src/app/api/workspace/guests/route.ts
src/app/api/workspace/guests/[id]/route.ts
src/app/api/workspace/guests/import/route.ts
src/app/api/workspace/guests/export/route.ts
src/app/api/workspace/rsvp/summary/route.ts
src/app/api/workspace/rsvp/dietary/route.ts
src/app/api/guest/invite/[token]/route.ts
src/app/api/guest/rsvp/route.ts
src/app/api/guest/wishes/route.ts
src/app/api/guest/contact/route.ts
src/app/invite/[token]/page.tsx              — Guest-facing site entry
src/app/workspace/guests/page.tsx            — Guest management
src/app/workspace/guests/analytics/page.tsx  — RSVP analytics
src/components/guest/GuestContextProvider.tsx — Guest context for auto-fill
src/lib/invitation.ts                        — Token generation/validation
src/lib/csv-parser.ts                        — CSV import utilities
```

**Files to Modify:**
```
src/components/wedding/pages/RSVPPage.tsx  — Add guest context, token support
src/components/wedding/pages/WishesPage.tsx — Add weddingId scoping
src/app/api/wishes/route.ts                — Move to /api/guest/wishes, add weddingId
src/app/api/contact/route.ts               — Move to /api/guest/contact, add weddingId
src/app/api/rsvp/route.ts                  — Move to /api/guest/rsvp, add token
```

**Complexity:** High (guest system is complex, CSV import needs care)
**Dependencies:** Phase 1 complete

---

### Phase 3: Analytics & Notifications (Weeks 6-7)

**Week 6: Analytics**
- Analytics event collection API
- Analytics event processing (aggregation)
- Platform admin dashboard with real charts
- Couple dashboard with wedding-specific analytics
- Chart components (recharts, matching design system)

**Week 7: Notifications + Wishes Moderation**
- Email notification service (template rendering, sending)
- Notification templates (system + per-account)
- Notification preferences UI
- Wishes moderation UI (approve/hide/delete)
- Contact messages UI
- Daily digest job

**Files to Create:**
```
src/app/api/admin/analytics/route.ts
src/app/api/workspace/analytics/route.ts
src/app/api/workspace/wishes/route.ts
src/app/api/workspace/wishes/[id]/route.ts
src/app/api/workspace/contacts/route.ts
src/app/api/workspace/notifications/route.ts
src/app/workspace/wishes/page.tsx
src/components/analytics/RSVPChart.tsx
src/components/analytics/PageViewsChart.tsx
src/components/analytics/DietaryChart.tsx
src/components/analytics/TimelineChart.tsx
src/lib/notifications.ts           — Email service
src/lib/templates.ts              — Template rendering
src/lib/analytics.ts              — Event collection utilities
```

**Complexity:** Medium (mostly UI and integration work)
**Dependencies:** Phase 2 complete

---

### Phase 4: Polish & Security (Week 8)

**Deliverables:**
- Rate limiting middleware (in-memory, per-IP)
- Audit logging on all write operations
- Guest data export (CSV, PDF)
- Performance optimization (query optimization, caching headers)
- Mobile responsiveness for all CMS pages
- Accessibility audit (ARIA labels, keyboard nav, screen reader)
- Security hardening (CSP headers, input sanitization)
- Documentation (API reference, user guide)

**Files to Create:**
```
src/lib/rate-limit.ts              — Rate limiting utility
src/lib/audit.ts                   — Audit logging utility
src/lib/export.ts                  — CSV/PDF export utilities
src/middleware.ts                  — Updated with rate limiting
```

**Files to Modify:**
```
src/app/admin/**                   — Accessibility pass
src/app/workspace/**               — Accessibility pass
next.config.ts                     — Add security headers
```

**Complexity:** Medium (many small improvements across the codebase)
**Dependencies:** Phase 3 complete

---

### Enterprise Expansion (Post-MVP)

| Feature | Description | Dependencies |
|---------|-------------|-------------|
| Custom Domains | Per-wedding custom domain with CNAME setup | DNS management, SSL (Let's Encrypt) |
| White-Label Theming | Per-account color/font customization | Theme engine, CSS variable overrides |
| Multi-Language (i18n) | Guest-facing site in multiple languages | next-intl (already installed), translation workflow |
| Video Messages | Guests can record video wishes | Media processing pipeline, video hosting |
| Live Streaming | Event day live video embed | Streaming provider integration (YouTube, Vimeo) |
| Payment Processing | Gift registry + payment collection | Stripe/LemonSqueezy integration |
| Advanced Analytics | Heatmaps, conversion funnels, A/B testing | Analytics pipeline upgrade |
| Mobile Companion App | React Native app for couple management | Separate mobile project |
| Honeymoon Registry | Gift fund contributions | Payment integration |
| Seating Chart | Visual drag-and-drop table planner | @dnd-kit (already installed) |
| Digital Guest Book | Event-day tablet-based signing | Separate kiosk mode |

---

**Total MVP Timeline: 8 weeks**
**Total New Files: ~60+**
**Total Modified Files: ~20+**
**New Dependencies: 0** (all needed packages already installed)

---

*End of Dreamweavers CMS Implementation Blueprint (Sections 1–20).*
*Blueprint prepared for Phase 0 implementation: Database Schema Extension + Multi-Tenant Foundation + Authentication.*