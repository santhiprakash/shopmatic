/**
 * Public handle validation. Keep in sync with src/utils/username.ts
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
  return String(raw || '').trim().toLowerCase();
}

export function validateUsername(raw: string): { valid: boolean; error?: string } {
  const username = normalizeUsername(raw);

  if (!username) {
    return { valid: false, error: 'Username is required' };
  }

  if (username.length < 3 || username.length > 30) {
    return { valid: false, error: 'Username must be between 3 and 30 characters' };
  }

  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: USERNAME_HINT };
  }

  if (RESERVED_USERNAMES.includes(username)) {
    return { valid: false, error: 'This username is reserved' };
  }

  return { valid: true };
}
