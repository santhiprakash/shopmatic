import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { toast } from 'sonner';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock SecurityUtils
vi.mock('@/utils/security', () => ({
  SecurityUtils: {
    generateSecureRandom: vi.fn().mockReturnValue('mock-random-id'),
    createHash: vi.fn().mockResolvedValue('mock-hash'),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Test component to access auth context
const TestComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    isDemo, 
    login, 
    register, 
    logout, 
    loginDemo 
  } = useAuth();

  return (
    <div>
      <div data-testid="auth-state">
        {isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated'}
      </div>
      <div data-testid="user-name">{user?.name || 'No user'}</div>
      <div data-testid="is-demo">{isDemo ? 'demo' : 'not-demo'}</div>
      <button onClick={() => login('user@example.com', 'password123')}>
        Login
      </button>
      <button onClick={() => register('new@example.com', 'password123', 'New User')}>
        Register
      </button>
      <button onClick={loginDemo}>Demo Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);

    vi.mocked(global.fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/api/auth/login')) {
        return {
          ok: true,
          json: async () => ({
            user: {
              id: '1',
              email: 'user@example.com',
              firstName: 'John',
              lastName: 'Doe',
              username: 'johndoe',
              subscriptionPlan: 'free',
              role: 'affiliate_marketer',
              createdAt: '2024-01-01T00:00:00.000Z',
            },
            token: 'test-token',
          }),
        } as Response;
      }
      if (url.includes('/api/auth/register')) {
        return {
          ok: true,
          json: async () => ({
            user: {
              id: '2',
              email: 'new@example.com',
              firstName: 'New',
              lastName: 'User',
              username: null,
              subscriptionPlan: 'free',
              role: 'affiliate_marketer',
              createdAt: '2024-01-01T00:00:00.000Z',
            },
            token: 'test-token',
          }),
        } as Response;
      }
      if (url.includes('/api/auth/logout')) {
        return { ok: true, json: async () => ({ message: 'Logged out successfully' }) } as Response;
      }
      return { ok: false, json: async () => ({ error: 'Not found' }) } as Response;
    });
  });

  it('should provide initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-state')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('No user');
    expect(screen.getByTestId('is-demo')).toHaveTextContent('not-demo');
  });

  it('should handle demo login', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Demo Login'));

    expect(screen.getByTestId('auth-state')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Demo User');
    expect(screen.getByTestId('is-demo')).toHaveTextContent('demo');
    expect(toast.success).toHaveBeenCalledWith('Welcome to the Shopmatic demo!', {
      description: 'You can explore all features. Data will not be saved.',
    });
  });

  it('should handle successful login', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('is-demo')).toHaveTextContent('not-demo');
    expect(toast.success).toHaveBeenCalledWith('Welcome back, John Doe!');
  });

  it('should handle successful registration', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('New User');
    expect(toast.success).toHaveBeenCalledWith('Welcome to Shopmatic, New User!');
  });

  it('should handle logout', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // First login
    fireEvent.click(screen.getByText('Demo Login'));
    expect(screen.getByTestId('auth-state')).toHaveTextContent('authenticated');

    // Then logout
    fireEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('auth-state')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('No user');
    expect(toast.success).toHaveBeenCalledWith('Logged out successfully');
  });

  it('should restore session from localStorage', async () => {
    const mockSessionData = {
      user: {
        id: '1',
        email: 'user@example.com',
        name: 'John Doe',
        plan: 'free',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLoginAt: '2024-01-01T00:00:00.000Z',
        isDemo: false,
      },
      timestamp: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      hash: 'mock-hash',
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSessionData));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
  });

  it('should handle expired session', async () => {
    const mockSessionData = {
      user: {
        id: '1',
        email: 'user@example.com',
        name: 'John Doe',
      },
      timestamp: Date.now(),
      expiresAt: Date.now() - 1000, // Expired
      hash: 'mock-hash',
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSessionData));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('unauthenticated');
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('shopmatic_auth');
  });

  it('should handle corrupted session data', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('unauthenticated');
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('shopmatic_auth');
  });

  it('should throw error when useAuth is used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      try {
        useAuth();
        return <div>Should not render</div>;
      } catch (error) {
        return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;
      }
    };

    render(<TestComponentWithoutProvider />);
    
    expect(screen.getByText(/useAuth must be used within an AuthProvider/)).toBeInTheDocument();
  });
});