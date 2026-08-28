import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi, getStoredToken, userApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; password: string; username: string; displayName?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string; user?: User }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const activeToken = getStoredToken();
    if (!activeToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setToken(activeToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(identifier, pass);
      if (res.success && res.data) {
        setUser(res.data.user);
        setToken(res.data.token);
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to log in' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: { email: string; password: string; username: string; displayName?: string }) => {
    setIsLoading(true);
    try {
      const res = await authApi.signup(data);
      if (res.success && res.data) {
        setUser(res.data.user);
        setToken(res.data.token);
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to create account' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    const res = await userApi.updateProfile(updates);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    }
    return { success: false, error: res.error || 'Failed to update profile' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
