# DWdigitalInvite — Setup Guide

## Project Overview

A **multi-tenant SaaS CMS** for digital wedding/event invitations, built with **Next.js 16**, **React 19**, **TypeScript 5**, **Prisma** (SQLite), **Tailwind CSS 4**, and **shadcn/ui**.

### Features Delivered (Phase 1 + Phase 2)

**Guest-Facing (8 pages):**
- Home — Hero with bokeh orbs, countdown timer, couple invitation
- Schedule — Event timeline
- RSVP — 4-step wizard (Name → Party Size → Guest List → Attendance → Result)
- Story — Couple story with vote dedup
- Wishes — Wish form + list with image upload
- Q&A — Expandable FAQ accordion
- Moments / Honeymoon — Vote on honeymoon destinations + suggestions
- Getting There — Tabs for car (with map) and public transit

**CMS Admin Panel (9 pages):**
- Dashboard — Stats cards + recent activity
- Tenants — CRUD management, pagination, search
- Users — Invite/manage users, role assignment
- Features — Global + per-tenant feature toggles
- Audit Log — Filterable activity log with expandable JSON
- Content Settings — Tenant branding, event details, couple names
- Schedule Editor — Drag-and-drop timeline management
- FAQ Editor — Create/edit/reorder FAQ items
- Media Library — Upload, categorize, and manage media
- Content Blocks — Manage all page content blocks (hero, sections, etc.)

---

## Prerequisites

- **Bun** (v1.0+) — [Install Bun](https://bun.sh)
- **Node.js** (v18+) — Optional, Bun can run everything

---

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Set up environment
cp .env.example .env
# Then edit .env and set your JWT_SECRET

# 3. Database setup (already has data from seed)
# Option A: Use the included database (fastest)
# The db/custom.db file is included — just run:
bun run db:generate

# Option B: Fresh database (wipes data, re-seeds)
bun run db:push
bun run prisma db seed

# 4. Start development server
bun run dev
```

The app runs at **http://localhost:3000**.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite path: `file:./db/custom.db` |
| `JWT_SECRET` | Yes | Strong random string (min 32 chars) for JWT tokens |

The included `.env.example` has safe defaults. **Never commit your actual `.env` file.**

---

## Seed Accounts

### Master Admin
- **Email:** `admin@dreamweavers.sg`
- **Password:** `Admin@2024`
- **Role:** Master Admin (full system access)

### Couple Admin (sample tenant)
- **Email:** `eleanor@wedding.com`
- **Password:** `Couple@2024`
- **Role:** Tenant Admin (limited to "Eleanor & James Wedding")

---

## How to Access CMS

1. Open the guest site at `http://localhost:3000`
2. Click the **lock icon** in the footer (subtle, 20% opacity)
3. Or append `?admin=true` to the URL
4. Log in with one of the seed accounts above

---

## Database Schema

The Prisma schema includes **12 models**:

| Model | Purpose |
|-------|---------|
| `Tenant` | Event/tenant records (name, slug, event date, venue) |
| `User` | System users (email, password hash, name) |
| `TenantUser` | User ↔ Tenant membership with roles |
| `TenantFeatureToggle` | Per-tenant feature flags |
| `GlobalFeatureToggle` | System-wide feature flags |
| `AuditLog` | Action logging for all mutations |
| `ScheduleItem` | Event schedule/timeline items |
| `FAQItem` | FAQ questions and answers |
| `MediaItem` | Uploaded media files with categories |
| `ContentBlock` | Dynamic page content blocks |
| `RSVPSubmission` | Guest RSVP submissions |
| `Wish` | Guest wishes and messages |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts, providers
│   ├── page.tsx                # SPA entry (guest + CMS mode switching)
│   ├── globals.css             # Tailwind + custom design tokens
│   └── api/                    # 24 API route files
│       ├── auth/               # login, me
│       ├── cms/                # stats, audit, users, tenants/*, features/global
│       ├── content/            # public content API (slug-based)
│       ├── rsvp/               # RSVP submission
│       ├── wishes/             # Wishes CRUD
│       ├── story/              # Story votes + suggestions
│       ├── contact/            # Contact form
│       └── upload/             # Image upload
├── components/
│   ├── ui/                     # 46 shadcn/ui components (unmodified)
│   ├── wedding/                # Guest-facing components
│   │   ├── Header.tsx, Footer.tsx, BottomNav.tsx
│   │   ├── MobileDrawer.tsx, SectionBanner.tsx
│   │   ├── GoldDustParticles.tsx, BokehOrbs.tsx
│   │   └── pages/              # 8 guest page components
│   └── cms/                    # CMS admin components
│       ├── CMSLogin.tsx, CMSLayout.tsx
│       └── pages/              # 9 CMS editor/dashboard pages
├── lib/                        # Utilities, auth, DB client
├── store/                      # Zustand stores (navigation, CMS)
└── hooks/                      # Custom React hooks
prisma/
├── schema.prisma               # Full database schema
└── seed.ts                     # Seed data script
db/
└── custom.db                   # SQLite database (included)
public/
├── dreamweavers-logo.png
├── logo.svg
└── uploads/wishes/             # User-uploaded wish images
```

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/me` | Get current user from JWT |

### CMS — Tenants
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cms/tenants` | List tenants (paginated, searchable) |
| POST | `/api/cms/tenants` | Create tenant |
| GET | `/api/cms/tenants/[id]` | Get tenant details |
| PATCH | `/api/cms/tenants/[id]` | Update tenant |
| DELETE | `/api/cms/tenants/[id]` | Delete tenant |

### CMS — Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cms/users` | List users (searchable) |
| POST | `/api/cms/users` | Invite user |
| PATCH | `/api/cms/users/[id]` | Update user |
| DELETE | `/api/cms/users/[id]` | Delete user |

### CMS — Features
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cms/features/global` | List global feature toggles |
| PATCH | `/api/cms/features/global` | Update global toggle |
| GET | `/api/cms/tenants/[id]/features` | List tenant features |
| PATCH | `/api/cms/tenants/[id]/features` | Update single feature |
| PUT | `/api/cms/tenants/[id]/features` | Bulk update features |

### CMS — Content (Phase 2)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/content/[slug]` | Get public content for a page |
| GET/PATCH/POST/DELETE | `/api/cms/tenants/[id]/schedule` | Schedule items CRUD |
| GET/PATCH/POST/DELETE | `/api/cms/tenants/[id]/faq` | FAQ items CRUD |
| GET/PATCH/POST/DELETE | `/api/cms/tenants/[id]/media` | Media library CRUD |
| GET/PATCH/POST/DELETE | `/api/cms/tenants/[id]/content-blocks` | Content blocks CRUD |
| PUT | `/api/cms/tenants/[id]/schedule/reorder` | Reorder schedule items |
| PUT | `/api/cms/tenants/[id]/faq/reorder` | Reorder FAQ items |

### CMS — Other
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cms/audit` | Audit log (filtered, paginated) |
| GET | `/api/cms/stats` | Dashboard statistics |

### Guest Forms
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/rsvp` | Submit RSVP |
| GET/POST | `/api/wishes` | Get/create wishes |
| POST | `/api/story/votes` | Vote on story chapter |
| POST | `/api/story/suggestion` | Suggest honeymoon destination |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/upload/image` | Upload image (multipart) |

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Paper Cream | `#FCF9F2` | Guest page backgrounds |
| Charcoal Ink | `#2C2C2C` | Primary text |
| Cinematic Gold | `#C5A059` | Accents, borders, highlights |
| Champagne Silk | `#F7F3EB` | Card/section backgrounds |

**Fonts:** Playfair Display (headings) + Inter (body)
**Icons:** Lucide React
**Animations:** Framer Motion (staggered reveals, hover effects)

---

## Common Commands

```bash
bun run dev          # Start dev server (port 3000)
bun run lint         # Run ESLint
bun run db:push      # Push schema changes to DB
bun run db:generate  # Regenerate Prisma client
bun run db:reset     # Reset DB (destructive, re-seeds)
```

---

## Architecture Notes

- **SPA Mode:** The entire app is a single-page application using Zustand for navigation. Only one route (`/`) exists; all page switching is client-side via `useNavigationStore`.
- **Dual Mode:** `appMode: 'guest' | 'cms'` in `useCMSStore` controls which interface is shown. Toggle via footer lock icon or `?admin=true` URL param.
- **Auth:** JWT (HS256, 8h expiry) via `jose`. Passwords hashed with Node.js `crypto.scrypt`. Token stored in `localStorage`.
- **API Pattern:** All APIs return `{ success: boolean, data?: any, error?: string }` except login which returns `{ success, user, token }`.
- **Role-Based Access:** Master Admin (full access) vs Tenant Admin/Editor/Viewer (scoped to tenant). All CMS APIs enforce auth via `authenticateRequest()` middleware.
- **Content Fallback:** Guest pages fetch content from the CMS API but fall back to hardcoded defaults if the API is unavailable, ensuring the site always renders.

---

## Caddy Configuration (Production)

A `Caddyfile` is included for reverse proxy with port transformation. This is only needed for the sandbox environment and can be ignored for local development.

---

## Changing Seed Passwords

After downloading, you should change the seed passwords. Either:
1. Edit `prisma/seed.ts` and run `bun run db:reset`
2. Or update passwords via the CMS Users page after logging in