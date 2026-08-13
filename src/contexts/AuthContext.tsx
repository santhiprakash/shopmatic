import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { SecurityUtils } from '@/utils/security';
import { toast } from 'sonner';
import { UserRole } from '@/types';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  role: UserRole;
  createdAt: Date;
  lastLoginAt: Date;
  isDemo?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loginDemo: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user data
const DEMO_USER: User = {
  id: 'demo-user-id',
  email: 'demo@shopmatic.cc',
  name: 'Demo User',
  avatar: undefined,
  plan: 'pro',
  role: 'affiliate_marketer',
  createdAt: new Date('2024-01-01'),
  lastLoginAt: new Date(),
  isDemo: true,
};

const AUTH_STORAGE_KEY = 'shopmatic_auth';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isDemo: false,
  });

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const sessionData = JSON.parse(stored);
      const now = Date.now();

      if (now > sessionData.expiresAt) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        toast.error('Session expired. Please log in again.');
        return;
      }

      const expectedHash = await SecurityUtils.createHash(
        sessionData.user.id + sessionData.user.email + sessionData.timestamp
      );

      if (expectedHash !== sessionData.hash) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        toast.error('Session validation failed. Please log in again.');
        return;
      }

      // Verify token is still valid with backend
      if (sessionData.token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${sessionData.token}`,
            },
          });

          if (!response.ok) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return;
          }

          const apiUser = await response.json();
          const user = mapApiUserToUser(apiUser);

          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            isDemo: false,
          });

          // Update stored session
          await saveSession(user, sessionData.token);
          return;
        } catch (error) {
          console.error('Token validation failed:', error);
          // Continue with stored session if API call fails
        }
      }

      setAuthState({
        user: {
          ...sessionData.user,
          createdAt: new Date(sessionData.user.createdAt),
          lastLoginAt: new Date(sessionData.user.lastLoginAt),
        },
        isAuthenticated: true,
        isLoading: false,
        isDemo: sessionData.user.isDemo || false,
      });

    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const mapApiUserToUser = (apiUser: any): User => {
    return {
      id: apiUser.id,
      email: apiUser.email,
      name: apiUser.firstName && apiUser.lastName 
        ? `${apiUser.firstName} ${apiUser.lastName}` 
        : apiUser.firstName || apiUser.email.split('@')[0],
      firstName: apiUser.firstName,
      lastName: apiUser.lastName,
      bio: apiUser.bio,
      avatar: apiUser.avatarUrl,
      plan: apiUser.subscriptionPlan || 'free',
      role: apiUser.role || 'affiliate_marketer',
      createdAt: new Date(apiUser.createdAt),
      lastLoginAt: new Date(),
      isDemo: false,
    };
  };

  const saveSession = async (user: User, token?: string) => {
    const timestamp = Date.now();
    const expiresAt = timestamp + SESSION_DURATION;
    
    const hash = await SecurityUtils.createHash(
      user.id + user.email + timestamp
    );

    const sessionData = {
      user,
      token,
      timestamp,
      expiresAt,
      hash,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
  };

  const login = async (email: string, password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const user = mapApiUserToUser(data.user);
      await saveSession(user, data.token);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        isDemo: false,
      });

      toast.success(`Welcome back, ${user.name}!`);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Split name into first and last
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          firstName,
          lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const user = mapApiUserToUser(data.user);
      await saveSession(user, data.token);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        isDemo: false,
      });

      toast.success(`Welcome to Shopmatic, ${name}!`);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const loginDemo = () => {
    setAuthState({
      user: DEMO_USER,
      isAuthenticated: true,
      isLoading: false,
      isDemo: true,
    });

    toast.success('Welcome to the Shopmatic demo!', {
      description: 'You can explore all features. Data will not be saved.',
    });
  };

  const logout = async () => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const sessionData = JSON.parse(stored);
        if (sessionData.token) {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sessionData.token}`,
            },
          });
        }
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isDemo: false,
    });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!authState.user || !authState.isAuthenticated) {
      throw new Error('No user logged in');
    }

    if (authState.isDemo) {
      // Update locally for demo mode
      const updatedUser = { ...authState.user, ...updates };
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      toast.success('Profile updated successfully');
      return;
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      const sessionData = stored ? JSON.parse(stored) : null;
      const token = sessionData?.token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      // Convert to API format
      const apiUpdates: any = {};
      if (updates.firstName) apiUpdates.firstName = updates.firstName;
      if (updates.lastName) apiUpdates.lastName = updates.lastName;
      if (updates.name) {
        const nameParts = updates.name.split(' ');
        apiUpdates.firstName = nameParts[0];
        apiUpdates.lastName = nameParts.slice(1).join(' ');
      }
      if (updates.bio) apiUpdates.bio = updates.bio;
      if (updates.avatar) apiUpdates.avatarUrl = updates.avatar;

      const response = await fetch(`${API_BASE_URL}/api/users/${authState.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(apiUpdates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Profile update failed');
      }

      const updatedUser = mapApiUserToUser(data);
      await saveSession(updatedUser, token);

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));

      toast.success('Profile updated successfully');
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      toast.success('Password reset link sent to your email!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      toast.error(message);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    loginDemo,
    updateProfile,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
