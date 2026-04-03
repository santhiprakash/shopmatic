const CSRF_TOKEN_KEY = 'shopmatic_csrf_token';
const AUTH_KEY = 'shopmatic_auth';

export interface CSRFTokenData {
  token: string;
  expiresAt: number;
}

export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function getCSRFToken(): string | null {
  try {
    const stored = localStorage.getItem(CSRF_TOKEN_KEY);
    if (!stored) return null;
    
    const data: CSRFTokenData = JSON.parse(stored);
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(CSRF_TOKEN_KEY);
      return null;
    }
    
    return data.token;
  } catch {
    return null;
  }
}

export function setCSRFToken(token: string): void {
  const data: CSRFTokenData = {
    token,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  localStorage.setItem(CSRF_TOKEN_KEY, JSON.stringify(data));
}

export function clearCSRFToken(): void {
  localStorage.removeItem(CSRF_TOKEN_KEY);
}

export function initializeCSRFToken(): string {
  let token = getCSRFToken();
  if (!token) {
    token = generateCSRFToken();
    setCSRFToken(token);
  }
  return token;
}

export function getCSRFHeaders(): Record<string, string> {
  const token = getCSRFToken();
  return token ? { 'x-csrf-token': token } : {};
}

function getUserIdFromSession(): string | null {
  try {
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) return null;
    
    const session = JSON.parse(authData);
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const userId = getUserIdFromSession();
  if (!userId) {
    return fetch(url, options);
  }

  const token = initializeCSRFToken();
  
  const headers = new Headers(options.headers);
  headers.set('x-csrf-token', token);
  headers.set('x-user-id', userId);

  return fetch(url, {
    ...options,
    headers,
  });
}
