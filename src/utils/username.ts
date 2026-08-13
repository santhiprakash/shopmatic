const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Public handle: 3–30 chars, lowercase alphanumeric + hyphens,
 * must start and end with a letter or number.
 * Keep in sync with server/src/utils/username.ts
 */
export const USERNAME_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export const RESERVED_USERNAMES = [
  'dashboard',
  'login',
  'signup',
  'admin',
  'api',
  'settings',
  'profile',
  'my-products',
  'analytics',
  'help',
  'help-center',
  'about',
  'about-us',
  'pricing',
  'features',
  'privacy',
  'privacy-policy',
  'privacy-settings',
  'terms',
  'terms-of-service',
  'cookies',
  'documentation',
  'docs',
  'support',
  'contact',
  'account',
  'billing',
  'pages',
  'create-page',
  'manage-pages',
  'onboarding',
  'shopmatic',
  'www',
  'app',
  'static',
  'assets',
];

export const USERNAME_HINT =
  '3–30 characters: lowercase letters, numbers, and hyphens. Must start and end with a letter or number.';

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsername(raw: string): { valid: boolean; error?: string } {
  const username = normalizeUsername(raw);

  if (!username) {
    return { valid: false, error: 'Choose a public handle' };
  }

  if (username.length < 3 || username.length > 30) {
    return { valid: false, error: 'Handle must be between 3 and 30 characters' };
  }

  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: USERNAME_HINT };
  }

  if ((RESERVED_USERNAMES as readonly string[]).includes(username)) {
    return { valid: false, error: 'This handle is reserved' };
  }

  return { valid: true };
}

export function getPublicPageUrl(username: string): string {
  const envUrl = import.meta.env.VITE_APP_URL || import.meta.env.VITE_PRODUCTION_URL;
  const base = (envUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://shopmatic.cc'))
    .replace(/\/$/, '');
  return `${base}/@${normalizeUsername(username)}`;
}

export async function checkUsernameAvailability(
  raw: string
): Promise<{ available: boolean; reason?: string }> {
  const local = validateUsername(raw);
  if (!local.valid) {
    return { available: false, reason: local.error };
  }

  const username = normalizeUsername(raw);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/users/check-username/${encodeURIComponent(username)}`
    );
    if (!response.ok) {
      return { available: false, reason: 'Could not check handle availability' };
    }
    return response.json();
  } catch {
    return { available: false, reason: 'Could not check handle availability' };
  }
}
