/**
 * Permission System
 *
 * Role-based access control matching the CMS blueprint Section 5.
 *
 * Five roles with a hierarchical permission matrix:
 *   - platform_super_admin  — full platform control (wildcard)
 *   - platform_support      — read-mostly across all accounts
 *   - account_owner         — full control within their wedding
 *   - account_editor        — content/media editing within their wedding
 *   - guest                 — public read + form submissions
 *
 * Permission format:  `resource:action[:scope]`
 *   - `*`                   — wildcard (super admin only)
 *   - `content:read:own`    — read own account's content
 *   - `content:read`        — read across all accounts (platform roles)
 *   - `rsvp:submit`         — guest-only action (no scope needed)
 */

// ─── Role Type ───────────────────────────────────────────────────────────────

export type Role =
  | 'platform_super_admin'
  | 'platform_support'
  | 'account_owner'
  | 'account_editor'
  | 'guest';

/** All valid role strings for runtime validation. */
export const VALID_ROLES: readonly Role[] = [
  'platform_super_admin',
  'platform_support',
  'account_owner',
  'account_editor',
  'guest',
] as const;

// ─── Permission Matrix (Section 5.2) ─────────────────────────────────────────

/**
 * Maps each role to the set of permission strings it holds.
 *
 * Conventions:
 *   - No `:own` / `:published` suffix → cross-account access (platform roles).
 *   - `:own` suffix                    → scoped to the user's own wedding account.
 *   - `:published` suffix              → scoped to published content only (guests).
 */
export const PERMISSION_MATRIX: Record<Role, ReadonlySet<string>> = {
  platform_super_admin: new Set([
    // Wildcard — grants every permission
    '*',
  ]),

  platform_support: new Set([
    // Account Management
    'account:read',
    // Content
    'content:read',
    // Media
    'media:read',
    // Guest Management
    'guest:read',
    'rsvp:read',
    // Wishes
    'wish:read',
    'contact:read',
    // Analytics
    'analytics:read:account',
    'analytics:read:platform',
    // Audit
    'audit:read',
  ]),

  account_owner: new Set([
    // Account Management
    'account:read:own',
    'account:update:own',
    // Content Editing
    'content:read:own',
    'content:write:own',
    // Media Management
    'media:read:own',
    'media:write:own',
    'media:delete:own',
    // Guest Management
    'guest:read:own',
    'guest:write:own',
    'guest:delete:own',
    'guest:import:own',
    'guest:export:own',
    // Invitations
    'invitation:read:own',
    'invitation:write:own',
    // Wishes
    'wish:read:own',
    'wish:moderate:own',
    'wish:delete:own',
    // Contact
    'contact:read:own',
    // Settings
    'settings:read:own',
    'settings:write:own',
    // Analytics
    'analytics:read:own',
    // Publish
    'publish:preview:own',
    'publish:write:own',
    // Members
    'member:invite:own',
    'member:remove:own',
  ]),

  account_editor: new Set([
    // Content Editing
    'content:read:own',
    'content:write:own',
    // Media Management
    'media:read:own',
    'media:write:own',
    // Guest Management
    'guest:read:own',
    'guest:write:own',
    'guest:import:own',
    'guest:export:own',
    // Invitations
    'invitation:read:own',
    'invitation:write:own',
    // Wishes
    'wish:read:own',
    'wish:moderate:own',
    // Contact
    'contact:read:own',
    // Analytics
    'analytics:read:own',
    // Publish
    'publish:preview:own',
  ]),

  guest: new Set([
    // Content (published only)
    'content:read:published',
    // Guest submissions
    'rsvp:submit',
    'wish:submit',
    'contact:submit',
    // Own RSVP response
    'rsvp:read:own',
  ]),
};

// ─── Permission Checking ─────────────────────────────────────────────────────

/**
 * Check whether a role holds a specific permission.
 *
 * For account-scoped permissions (ending in `:own`), the caller should
 * additionally verify that `contextOwnerId === resourceOwnerId` at the
 * API route level — this function only checks the static matrix.
 *
 * @param userRole   The role string to check.
 * @param action     The permission string, e.g. `"content:write:own"`.
 * @returns `true` if the role is granted the permission.
 */
export function hasPermission(userRole: string, action: string): boolean {
  const role = userRole as Role;
  const permissions = PERMISSION_MATRIX[role];
  if (!permissions) return false;

  // Super-admin wildcard
  if (permissions.has('*')) return true;

  // Direct match
  if (permissions.has(action)) return true;

  // For account-scoped actions, also check the unscoped variant
  // e.g. `content:read:own` → also matches `content:read`
  if (action.endsWith(':own')) {
    const unscoped = action.slice(0, -4); // strip `:own`
    if (permissions.has(unscoped)) return true;
  }

  return false;
}

/**
 * Enforce a permission check. Returns `true` on success, **throws** on failure.
 *
 * @param userRole        The authenticated user's role.
 * @param action          The permission string to require.
 * @param resourceOwnerId  (Optional) Owner ID of the resource being accessed.
 * @param contextOwnerId   (Optional) Owner ID of the current request context.
 * @throws {PermissionError} If the permission is not granted, or ownership check fails.
 */
export function requirePermission(
  userRole: string,
  action: string,
  resourceOwnerId?: string,
  contextOwnerId?: string
): boolean {
  const granted = hasPermission(userRole, action);

  if (!granted) {
    throw new PermissionError(userRole, action);
  }

  // Ownership check for `:own` scoped permissions:
  // If both IDs are provided and the action is scoped, they must match.
  if (
    action.endsWith(':own') &&
    resourceOwnerId !== undefined &&
    contextOwnerId !== undefined &&
    resourceOwnerId !== contextOwnerId
  ) {
    // Platform roles (super_admin, support) with unscoped `:read` permission
    // bypass the ownership check — they already matched via `hasPermission`.
    // If we reach here it means the role only has `:own` scoped access
    // (e.g. account_owner), so ownership must match.
    const role = userRole as Role;
    const permissions = PERMISSION_MATRIX[role];

    // Check if the role has the unscoped version — if so, skip ownership check
    const unscoped = action.slice(0, -4);
    if (!permissions.has('*') && !permissions.has(unscoped)) {
      throw new PermissionError(
        userRole,
        action,
        'Resource does not belong to the requesting account.'
      );
    }
  }

  return true;
}

// ─── Error Class ─────────────────────────────────────────────────────────────

export class PermissionError extends Error {
  public readonly role: string;
  public readonly action: string;
  public readonly statusCode = 403;

  constructor(role: string, action: string, message?: string) {
    super(
      message ??
        `Permission denied: role "${role}" does not have permission "${action}".`
    );
    this.name = 'PermissionError';
    this.role = role;
    this.action = action;
  }
}