/**
 * Contrast utilities for automatic text/border colour adaptation
 * when the page background is dark (e.g. black, dark charcoal).
 *
 * Uses WCAG 2.0 relative luminance for accurate light/dark detection.
 */

/** WCAG 2.0 relative luminance (0–1) */
export function getLuminance(hex: string): number {
  const c = hex.replace('#', '');
  if (c.length < 6) return 0.5; // safety fallback

  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const toLinear = (v: number) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** True when the background luminance is below the "dark" threshold (~#3C3C3C) */
export function isDarkBackground(hex: string): boolean {
  return getLuminance(hex) < 0.12;
}

/** Auto-detect primary text colour for a given background */
export function getAutoTextColor(bgHex: string): string {
  return isDarkBackground(bgHex) ? '#E8E0D0' : '#1A1A1A';
}

/** Auto-detect a muted border/accent colour for a given background */
export function getAutoBorderColor(bgHex: string): string {
  return isDarkBackground(bgHex) ? '#3A3428' : '#E8D5B5';
}

/** Quick perceived luminance (0–1) — used for UI pickers only */
export function getPerceivedLuminance(hex: string): number {
  const c = hex.replace('#', '');
  if (c.length < 6) return 0.5;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Parse "#RRGGBB" into [r, g, b] (0–255 integers).
 */
function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
}

/**
 * Generate a <style> tag content that overrides all Tailwind-generated
 * charcoal-ink and champagne-silk utility classes scoped under
 * `[data-wedding-root]`.
 *
 * This is needed because Tailwind 4 resolves `@theme inline` colours
 * to hardcoded rgb/oklch at build time, so CSS variable overrides alone
 * don't affect utility classes.
 */
export function generateThemeOverrideStyle(
  textColor: string,
  borderColor: string,
  headerTextColor?: string,
  headerBg?: string,
): string {
  const [tr, tg, tb] = hexToRgb(textColor);
  const [br, bg_, bb] = hexToRgb(borderColor);
  const SCOPE = '[data-wedding-root]';

  const lines: string[] = [];

  // Helper to generate a single rule.
  // When `self` is true, also emits a self-referencing rule for elements
  // that have BOTH the scope attribute AND the target class (e.g. the
  // root div itself or the <header> which carries both the data-attr
  // and the Tailwind class).
  const rule = (selector: string, prop: string, r: number, g: number, b: number, alpha?: number, scope?: string, self = false) => {
    const color = alpha !== undefined
      ? `rgb(${r} ${g} ${b} / ${alpha})`
      : `rgb(${r} ${g} ${b})`;
    const sc = scope || SCOPE;
    lines.push(`${sc} ${selector} { ${prop}: ${color}; }`);
    if (self) {
      // Self-referencing: scope AND selector on the same element
      const sel = selector.startsWith('.') ? selector.substring(1) : selector;
      lines.push(`${sc}.${sel} { ${prop}: ${color}; }`);
    }
  };

  // ── text-charcoal-ink ──
  rule('.text-charcoal-ink', 'color', tr, tg, tb);
  for (const a of [20, 25, 30, 35, 40, 50, 60, 70, 75, 80]) {
    rule(`.text-charcoal-ink\\/${a}`, 'color', tr, tg, tb, a / 100);
  }

  // ── border-charcoal-ink ──
  rule('.border-charcoal-ink', 'border-color', tr, tg, tb);
  for (const a of [5, 8, 10, 15, 20, 30, 40]) {
    rule(`.border-charcoal-ink\\/${a}`, 'border-color', tr, tg, tb, a / 100);
  }

  // ── bg-charcoal-ink ──
  rule('.bg-charcoal-ink', 'background-color', tr, tg, tb);
  for (const a of [3, 5, 10, 20, 30, 60, 90]) {
    rule(`.bg-charcoal-ink\\/${a}`, 'background-color', tr, tg, tb, a / 100);
  }

  // ── border-champagne-silk ──
  rule('.border-champagne-silk', 'border-color', br, bg_, bb);
  for (const a of [10, 20, 30, 40, 50, 60]) {
    rule(`.border-champagne-silk\\/${a}`, 'border-color', br, bg_, bb, a / 100);
  }

  // ── bg-champagne-silk ──
  rule('.bg-champagne-silk', 'background-color', br, bg_, bb);
  for (const a of [20, 30, 40, 50, 60]) {
    rule(`.bg-champagne-silk\\/${a}`, 'background-color', br, bg_, bb, a / 100);
  }

  // ── text-champagne-silk ──
  rule('.text-champagne-silk', 'color', br, bg_, bb);

  // ── divide-champagne-silk (uses :where) ──
  lines.push(`${SCOPE} :where(.divide-champagne-silk > :not(:last-child)) { border-color: rgb(${br} ${bg_} ${bb}); }`);
  for (const a of [50]) {
    lines.push(`${SCOPE} :where(.divide-champagne-silk\\/${a} > :not(:last-child)) { border-color: rgb(${br} ${bg_} ${bb} / ${a / 100}); }`);
  }

  // ── Header-specific overrides ──
  // When the header bg differs from page bg, its text AND border colours
  // must contrast with the header bg, not the page bg.
  // Use `self = true` because the <header> element carries both
  // data-wedding-header AND the Tailwind classes directly.
  if (headerTextColor && headerTextColor !== textColor) {
    const [hr, hg, hb] = hexToRgb(headerTextColor);
    const HSCOPE = '[data-wedding-header]';

    // Re-derive the correct border colour for the header bg
    const headerBorder = getAutoBorderColor(headerBg!);
    const [hbr, hbg, hbb] = hexToRgb(headerBorder);

    // Text overrides
    rule('.text-charcoal-ink', 'color', hr, hg, hb, undefined, HSCOPE, true);
    for (const a of [20, 25, 30, 35, 40, 50, 60, 70, 75, 80]) {
      rule(`.text-charcoal-ink\\/${a}`, 'color', hr, hg, hb, a / 100, HSCOPE, true);
    }

    // Border overrides (champagne-silk)
    rule('.border-champagne-silk', 'border-color', hbr, hbg, hbb, undefined, HSCOPE, true);
    for (const a of [10, 20, 30, 40, 50, 60]) {
      rule(`.border-champagne-silk\\/${a}`, 'border-color', hbr, hbg, hbb, a / 100, HSCOPE, true);
    }

    // Background overrides (charcoal-ink used in buttons etc.)
    rule('.bg-charcoal-ink', 'background-color', hr, hg, hb, undefined, HSCOPE, true);
    for (const a of [3, 5, 10, 20, 30, 60, 90]) {
      rule(`.bg-charcoal-ink\\/${a}`, 'background-color', hr, hg, hb, a / 100, HSCOPE, true);
    }
  }

  return lines.join('\n');
}