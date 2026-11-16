'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchApi } from './api-client';
import { RoleName } from '@triclinium/types';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  roles: RoleName[];
  permissions: string[];
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (token: string, userData: AdminUser) => void;
  logout: () => Promise<void>;
  hasRole: (role: RoleName) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('triclinium_admin_user');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('triclinium_admin_token');
      if (!token) return false;
      const cached = sessionStorage.getItem('triclinium_admin_user');
      if (cached) return false;
    }
    return true;
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('triclinium_admin_token') : null;
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
          try { sessionStorage.removeItem('triclinium_admin_user'); } catch {}
        }
        return;
      }

      // If we don't have user in state, show loading spinner on initial load
      if (!user) {
        setIsLoading(true);
      }

      try {
        const data = await fetchApi('/admin/auth/me');
        if (isMounted) {
          setUser(data);
          try { sessionStorage.setItem('triclinium_admin_user', JSON.stringify(data)); } catch {}
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          try { sessionStorage.removeItem('triclinium_admin_user'); } catch {}
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    // Only run auth verification if on admin path
    if (pathname.startsWith('/admin') && !['/admin/login', '/admin/forgot-password', '/admin/reset-password'].includes(pathname)) {
      // If user is already loaded in memory, don't re-trigger heavy auth verification on internal tab switches
      if (!user) {
        checkAuth();
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [pathname, user]);

  const login = (token: string, userData: AdminUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('triclinium_admin_token', token);
      sessionStorage.setItem('triclinium_admin_user', JSON.stringify(userData));
      document.cookie = `triclinium_session=${token}; path=/; max-age=604800; SameSite=Lax`;
    }
    setUser(userData);
    setIsLoading(false);
    router.push('/admin');
  };

  const logout = async () => {
    try {
      await fetchApi('/admin/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('triclinium_admin_token');
        sessionStorage.removeItem('triclinium_admin_user');
        document.cookie = `triclinium_session=; path=/; max-age=0; SameSite=Lax`;
      }
      setUser(null);
      setIsLoading(false);
      router.push('/admin/login');
    }
  };

  const hasRole = (role: RoleName) => {
    if (!user) return false;
    if (user.roles.includes('SUPER_ADMIN')) return true;
    return user.roles.includes(role);
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.roles.includes('SUPER_ADMIN')) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
