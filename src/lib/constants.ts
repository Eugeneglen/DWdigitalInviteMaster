// ── Feature keys & labels (client-safe — no Node.js / NextAuth deps) ────
export const FEATURE_KEYS = {
  RSVP: 'rsvp',
  WISHES: 'wishes',
  STORY: 'story',
  GALLERY: 'gallery',
  SCHEDULE: 'schedule',
  FAQ: 'faq',
  MOMENTS: 'moments',
  GETTING_THERE: 'getting-there',
  COUNTDOWN: 'countdown',
  MUSIC: 'music',
  VIDEO: 'video',
  QA: 'qa',
} as const;

export const FEATURE_LABELS: Record<string, string> = {
  rsvp: 'RSVP',
  wishes: 'Wishes',
  story: 'Our Story',
  gallery: 'Photo Gallery',
  schedule: 'Event Schedule',
  faq: 'FAQ',
  moments: 'Moments',
  'getting-there': 'Getting There',
  countdown: 'Countdown',
  music: 'Background Music',
  video: 'Video',
  qa: 'Q&A',
};

export const GLOBAL_FEATURE_LABELS: Record<string, string> = {
  ...FEATURE_LABELS,
};

// ── Role labels ─────────────────────────────────────────────────────
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ACCOUNT_MANAGER: 'Account Manager',
  COUPLE: 'Couple',
  ADMIN_1: 'Admin 1',
  ADMIN_2: 'Admin 2',
  ADMIN_3: 'Admin 3',
};

export const TENANT_ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};