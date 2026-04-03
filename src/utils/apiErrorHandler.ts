import { toast } from 'sonner';

export class ApiError extends Error {
  statusCode: number;
  isNetworkError: boolean;
  
  constructor(message: string, statusCode: number = 0, isNetworkError: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isNetworkError = isNetworkError;
  }
}

export interface ApiRequestOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_RETRY_DELAY = 1000;

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function apiRequest<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    retries = 0,
    retryDelay = DEFAULT_RETRY_DELAY,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        credentials: 'include',
      });

      if (response.status === 401) {
        localStorage.removeItem('shopmatic_auth');
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        throw new ApiError('Session expired. Please log in again.', 401);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An error occurred' }));
        const message = errorData.error || `Request failed with status ${response.status}`;
        throw new ApiError(message, response.status);
      }

      const data = await response.json();
      return data as T;

    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        lastError = new ApiError('Connection error. Please check your internet connection.', 0, true);
        
        if (attempt < retries) {
          await delay(retryDelay * Math.pow(2, attempt));
          continue;
        }
      }

      if (error instanceof ApiError) {
        throw error;
      }

      lastError = new ApiError('An unexpected error occurred', 0, error instanceof Error);
    }
  }

  throw lastError || new ApiError('Request failed after retries');
}

export function handleApiError(error: unknown, fallbackMessage?: string): string {
  if (error instanceof ApiError) {
    if (error.isNetworkError) {
      return 'Connection error, please try again';
    }
    return error.message || fallbackMessage || 'Something went wrong';
  }
  
  if (error instanceof Error) {
    return error.message || fallbackMessage || 'Something went wrong';
  }
  
  return fallbackMessage || 'Something went wrong';
}

export function showApiErrorToast(error: unknown, fallbackMessage?: string): void {
  const message = handleApiError(error, fallbackMessage);
  toast.error(message);
}
