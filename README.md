# Wedding Digital Keepsake

A multi-page wedding website for guests, built as static HTML pages served by a modern Vite + TanStack Start app.

---

## 1. Project Overview

This project contains:

- **Guest-facing pages** in `public/` — static HTML files styled with Tailwind CSS.
- **Admin pages** in `public/` — simple HTML dashboards for managing guest details (no backend wired in this branch).
- **TanStack Start scaffold** at the repo root — the Vite dev server serves the site and the `public/` folder is exposed as static assets.

The site is designed around a warm, elegant editorial palette (paper cream, charcoal ink, cinematic gold).

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start v1 (React 19 + Vite 7) |
| Styling | Tailwind CSS v4 (via CDN in public pages) |
| Fonts | Google Fonts — Playfair Display, Material Symbols Outlined |
| Icons | Material Symbols Outlined |
| Package manager | Bun |
| Build tool | Vite |

---

## 3. Guest Pages (`public/`)

All guest pages share the same navigation, banner pattern, and animation system.

| File | Page | Notes |
|------|------|-------|
| `home.html` | Home / Landing | Hero, quick links, overview |
| `schedule.html` | Schedule | Event timeline |
| `rsvp.html` | RSVP | 4-step RSVP form |
| `getting-there.html` | Getting There | Address, car parking, MRT, bus directions |
| `story.html` | Our Story | Couple narrative |
| `moments.html` | Moments / Gallery | Photo gallery / journey highlights |
| `wishes.html` | Wishes | Guestbook / wishes form |
| `qa.html` | Q&A | Accordion FAQ |

### Shared conventions

- **Top app bar:** fixed header with logo and nav links.
- **Hero banner:** `h-[360px] md:h-[420px]` background image, centered title.
- **Main content:** `<main class="pb-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto pt-[20px] md:pt-[40px]">`.
- **Intro copy:** centered, max-width `900px`, `mb-[80px]`, `text-center animate-orchestral`.
- **Animations:** `animate-orchestral` with `delay-100` through `delay-400` for staggered fade-in.

---

## 4. Admin Pages (`public/`)

| File | Purpose |
|------|---------|
| `admin.html` | Admin login |
| `admin-dashboard.html` | Dashboard overview |
| `admin-guests.html` | Guest list management |
| `admin-media.html` | Media / photos management |

These are currently static HTML mockups. To make them functional, connect to a backend or database.

---

## 5. Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed

### Install dependencies

```bash
bun install
```

### Run the dev server

```bash
bun dev
```

The site will be available at `http://localhost:8080`.

To visit a specific page, for example:

```
http://localhost:8080/home.html
http://localhost:8080/rsvp.html
http://localhost:8080/qa.html
```

### Build for production

```bash
bun build
```

### Preview production build

```bash
bun preview
```

---

## 6. Customizing Content

Most text changes can be made directly in the HTML files under `public/`.

### 6.1 Change the couple names

Search for `Eleanor & James` across all `public/*.html` files and replace with the desired names.

### 6.2 Change the venue address

The address is in `public/getting-there.html` and also in any other page that mentions it (e.g. `home.html`, `schedule.html`).

Example address block:

```html
<p class="font-body-lg text-body-lg text-charcoal-ink/80">
    The Singapore EDITION<br>
    38 Cuscaden Road<br>
    Singapore 249731
</p>
```

### 6.3 Update hero images

Hero images are inline `background-image` URLs on the banner `div`.

```html
<div class="..." style="background-image: url('https://lh3.googleusercontent.com/...');">
```

Replace the URL with your own image.

### 6.4 Update Q&A items

In `public/qa.html`, each FAQ is an `<article>` block:

```html
<article class="border-b border-cinematic-gold/30 group animate-orchestral delay-100">
    <button class="w-full py-10 flex justify-between items-center text-left ..." onclick="toggleAccordion(this)">
        <h3 class="font-headline-md ...">Question text</h3>
        <span class="material-symbols-outlined ...">expand_more</span>
    </button>
    <div class="accordion-content overflow-hidden px-2">
        <p class="font-body-lg ...">Answer text</p>
    </div>
</article>
```

To add a new FAQ, copy an entire `<article>` block and adjust the `delay-*` class and text.

### 6.5 Update the schedule

In `public/schedule.html`, each timeline item follows the same structure. Update the time, title, and description.

### 6.6 Update the RSVP

In `public/rsvp.html`, the RSVP is a 4-step form. Update step labels, questions, and choices directly in the HTML.

### 6.7 Update the story

In `public/story.html`, the story sections are in a vertical layout. Replace paragraphs and images.

### 6.8 Update moments gallery

In `public/moments.html`, the gallery items are image cards. Replace image URLs and captions.

### 6.9 Update wishes

In `public/wishes.html`, the wishes form and existing wishes cards can be updated directly.

---

## 7. Design System

### 7.1 Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `paper-cream` | `#FDF9F3` | Page background |
| `charcoal-ink` | `#1A1A1A` | Primary text |
| `cinematic-gold` | `#D4AF37` | Accent, links, borders |
| `champagne-silk` | `#E8D5B5` | Soft borders, dividers |
| `surface` | `#fdf8f8` | Cards, surfaces |
| `primary` | `#000000` | Buttons, strong accents |

### 7.2 Typography

- **Display / Headlines:** Playfair Display
- **Body:** Playfair Display
- **Icons:** Material Symbols Outlined

### 7.3 Spacing tokens

```js
spacing: {
    unit: "4px",
    "section-gap": "8rem",
    "canvas-margin": "4rem",
    gutter: "2rem",
}
```

### 7.4 Border radius

```js
borderRadius: {
    DEFAULT: "0.125rem",
    lg: "0.25rem",
    xl: "0.5rem",
    full: "0.75rem",
}
```

---

## 8. Navigation

The nav links appear in every public page:

1. `home.html`
2. `schedule.html`
3. `rsvp.html`
4. `getting-there.html`
5. `story.html`
6. `wishes.html`
7. `qa.html`
8. `moments.html`

The active page is marked with gold text and a bottom border:

```html
<a class="... text-cinematic-gold border-b-2 border-cinematic-gold ..." href="/qa.html">Q&A</a>
```

Other links are faded (`text-charcoal-ink/40`) with a transparent bottom border.

---

## 9. Mobile Menu

Every public page includes a mobile drawer menu:

- Triggered by the hamburger icon on small screens.
- Slides in from the left.
- The active page is highlighted in gold.

The drawer logic is in a small inline `<script>` block in each HTML file.

---

## 10. Accordion Logic (Q&A)

Q&A uses a custom `toggleAccordion(button)` function:

```javascript
function toggleAccordion(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('.accordion-icon');
    const isOpen = content.classList.contains('open');

    // Optional: close all others
    document.querySelectorAll('.accordion-content.open').forEach(c => {
        if (c !== content) {
            c.classList.remove('open');
            c.previousElementSibling.querySelector('.accordion-icon').classList.remove('open');
        }
    });

    content.classList.toggle('open');
    icon.classList.toggle('open');
}
```

---

## 11. Tab Switching (Getting There)

`getting-there.html` uses a tab switcher for transport modes.

Current tabs:

- **By Car** — parking and airport directions
- **Public Transit** — MRT and bus directions

The address block sits above the tabs and is always visible.

```javascript
function switchTab(tabName) {
    // shows/hides content and toggles active pill classes
}
```

---

## 12. File Structure

```
.
├── public/                    # Static wedding website pages
│   ├── home.html
│   ├── schedule.html
│   ├── rsvp.html
│   ├── getting-there.html
│   ├── story.html
│   ├── moments.html
│   ├── wishes.html
│   ├── qa.html
│   ├── admin.html
│   ├── admin-dashboard.html
│   ├── admin-guests.html
│   ├── admin-media.html
│   └── nav.js                 # Shared nav script (if used)
├── src/
│   ├── routes/                # TanStack Start routes
│   ├── components/ui/         # shadcn/ui components
│   ├── styles.css             # Tailwind v4 config
│   └── ...
├── package.json
├── vite.config.ts
└── README.md
```

---

## 13. Common Commands

| Command | Action |
|---------|--------|
| `bun dev` | Start development server |
| `bun build` | Build for production |
| `bun preview` | Preview production build |
| `bun lint` | Run ESLint |
| `bun format` | Run Prettier |

---

## 14. Adding a New Page

1. Create a new file in `public/`, e.g. `public/new-page.html`.
2. Copy the structure from an existing page (e.g. `public/qa.html`).
3. Update the `<title>`, hero text, and main content.
4. Add the link in the navigation of every other page (both desktop and mobile drawer).
5. Update the active-page styling for that link.

---

## 15. Notes for Future Maintenance

- All public pages use the Tailwind CSS CDN; there is no build step for the static pages.
- The TanStack Start React app at `/` and the static pages in `public/` are separate. The wedding pages are not React components.
- For persistent data (RSVP, guest list, wishes, admin), integrate a backend or database service. The current pages are static.
- If replacing hero image URLs, ensure the images are publicly accessible (no hot-link restrictions).

---

## 16. Support / Questions

For layout issues, use `public/qa.html` as the reference standard for spacing:

```html
<main class="pb-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto pt-[20px] md:pt-[40px]">
    <section class="max-w-[900px] mx-auto mb-[80px] text-center animate-orchestral">
        <!-- intro copy -->
    </section>
    <!-- main content -->
</main>
```
