/**
 * Feature Flag Utilities
 *
 * Two-tier toggle system (Section 8):
 *   Account-specific flag  →  (fallback)  →  Platform default flag  →  (fallback)  →  Hardcoded default
 *
 * Platform defaults use `accountId: ''` (empty string).
 * Account overrides use `accountId: {weddingId}`.
 * Merge strategy: account override always wins.
 */

import { db } from '@/lib/db';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FeatureFlagSeed {
  featureKey: string;
  enabled: boolean;
  category: 'page' | 'interactive' | 'display' | 'advanced';
}

// ─── Default Features for New Accounts (Section 8.4) ─────────────────────────

/**
 * Complete list of feature flags seeded when a new Account is provisioned.
 * Each entry's `enabled` value matches the blueprint's "Default" column.
 */
export const DEFAULT_FEATURES: readonly FeatureFlagSeed[] = [
  // ── Page Visibility (all enabled by default) ──
  { featureKey: 'page.home', enabled: true, category: 'page' },
  { featureKey: 'page.schedule', enabled: true, category: 'page' },
  { featureKey: 'page.rsvp', enabled: true, category: 'page' },
  { featureKey: 'page.getting-there', enabled: true, category: 'page' },
  { featureKey: 'page.story', enabled: true, category: 'page' },
  { featureKey: 'page.moments', enabled: true, category: 'page' },
  { featureKey: 'page.wishes', enabled: true, category: 'page' },
  { featureKey: 'page.qa', enabled: true, category: 'page' },

  // ── Interactive Features ──
  { featureKey: 'feature.rsvp', enabled: true, category: 'interactive' },
  { featureKey: 'feature.wishes-form', enabled: true, category: 'interactive' },
  { featureKey: 'feature.wishes-images', enabled: true, category: 'interactive' },
  { featureKey: 'feature.contact-form', enabled: true, category: 'interactive' },
  { featureKey: 'feature.honeymoon-voting', enabled: true, category: 'interactive' },
  { featureKey: 'feature.calendar-export', enabled: true, category: 'interactive' },
  { featureKey: 'feature.rsvp-auto-fill', enabled: true, category: 'interactive' },

  // ── Display Options ──
  { featureKey: 'display.golden-dust', enabled: true, category: 'display' },
  { featureKey: 'display.bokeh', enabled: true, category: 'display' },
  { featureKey: 'display.cursor-effects', enabled: true, category: 'display' },
  { featureKey: 'display.dark-mode', enabled: false, category: 'display' },
  { featureKey: 'display.animations', enabled: true, category: 'display' },
  { featureKey: 'display.bottom-nav', enabled: true, category: 'display' },
  { featureKey: 'display.section-banners', enabled: true, category: 'display' },

  // ── Advanced ──
  { featureKey: 'advanced.custom-domain', enabled: false, category: 'advanced' },
  { featureKey: 'advanced.password-protection', enabled: false, category: 'advanced' },
  { featureKey: 'advanced.analytics', enabled: true, category: 'advanced' },
  { featureKey: 'advanced.guest-csv-import', enabled: true, category: 'advanced' },
  { featureKey: 'advanced.rsvp-reminder', enabled: false, category: 'advanced' },
  { featureKey: 'advanced.wish-moderation', enabled: false, category: 'advanced' },
] as const;

// ─── Platform Default Account ID ─────────────────────────────────────────────

/**
 * The FeatureFlag model uses `accountId: ''` (empty string) to represent
 * platform-level defaults that apply to every account unless overridden.
 */
const PLATFORM_ACCOUNT_ID = '';

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Load the merged feature flag map for a given account.
 *
 * Resolution order per key:
 *   1. Account-specific override (`accountId: {weddingId}`)
 *   2. Platform default        (`accountId: ''`)
 *   3. Not present in map      (caller uses `isFeatureEnabled` with a default)
 *
 * @param accountId  The wedding account ID to load flags for.
 * @returns A Map of `featureKey → enabled` containing both platform defaults
 *          and any account-level overrides.
 */
export async function getFeatureFlags(
  accountId: string
): Promise<Map<string, boolean>> {
  const flags = new Map<string, boolean>();

  try {
    // 1. Load platform defaults (empty-string accountId)
    const platformDefaults = await db.featureFlag.findMany({
      where: { accountId: PLATFORM_ACCOUNT_ID },
    });

    for (const flag of platformDefaults) {
      flags.set(flag.featureKey, flag.enabled);
    }

    // 2. Load account-specific overrides — these win on conflict
    const accountOverrides = await db.featureFlag.findMany({
      where: { accountId },
    });

    for (const flag of accountOverrides) {
      flags.set(flag.featureKey, flag.enabled);
    }
  } catch {
    // If the FeatureFlag model doesn't exist yet (early dev),
    // fall through — the map stays empty and callers use their defaults.
  }

  return flags;
}

/**
 * Check whether a single feature is enabled.
 *
 * @param flags      The merged flag map from `getFeatureFlags`.
 * @param key        The feature key, e.g. `"page.rsvp"`.
 * @param defaultVal Fallback when the key is absent from the map. Defaults to `true`.
 *                   Use `false` for opt-in features (e.g. `"advanced.custom-domain"`).
 */
export function isFeatureEnabled(
  flags: Map<string, boolean>,
  key: string,
  defaultVal: boolean = true
): boolean {
  return flags.get(key) ?? defaultVal;
}

/**
 * Get all feature flags grouped by category for the CMS settings UI.
 *
 * @param flags  The merged flag map from `getFeatureFlags`.
 * @returns A record keyed by category, each containing an array of
 *          `{ featureKey, enabled }` objects.
 */
export function getFlagsByCategory(flags: Map<string, boolean>): Record<
  string,
  Array<{ featureKey: string; enabled: boolean }>
> {
  const grouped: Record<string, Array<{ featureKey: string; enabled: boolean }>> = {
    page: [],
    interactive: [],
    display: [],
    advanced: [],
  };

  for (const [key, enabled] of flags) {
    // Derive category from the key prefix (e.g. "page.rsvp" → "page")
    const category = key.split('.')[0];

    if (category in grouped) {
      grouped[category].push({ featureKey: key, enabled });
    }
  }

  return grouped;
}