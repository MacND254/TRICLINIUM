'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchApi } from './api-client';
import { RoleName } from '@triclinium/types';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  roles: RoleName[];
  permissions: string[];
  sessionExpiresAt?: string | null;
  sessionIssuedAt?: string | null;
  cookieName?: string;
  cookieMaxAge?: number;
}

export interface SessionInfo {
  expiresAt: Date | null;
  issuedAt: Date | null;
  cookieName: string;
  cookieMaxAgeSeconds: number;
  timeRemainingText: string;
  isExpired: boolean;
  inactivityRemainingSecs: number;
  lastActiveTime: number;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  sessionInfo: SessionInfo;
  login: (token: string, userData: AdminUser) => void;
  logout: (reason?: string) => Promise<void>;
  hasRole: (role: RoleName) => boolean;
  hasPermission: (permission: string) => boolean;
}

function parseJwtExp(token: string | null): { exp: number | null; iat: number | null } {
  if (!token) return { exp: null, iat: null };
  try {
    const parts = token.split('.');
    if (parts.length < 2) return { exp: null, iat: null };
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(json);
    return { exp: parsed.exp || null, iat: parsed.iat || null };
  } catch {
    return { exp: null, iat: null };
  }
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  // Deterministic initial state to match SSR and avoid hydration errors
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

      // Restore cached user from sessionStorage after client mount for immediate responsiveness
      try {
        const cached = sessionStorage.getItem('triclinium_admin_user');
        if (cached && isMounted && !user) {
          setUser(JSON.parse(cached));
        }
      } catch {}

      try {
        const data = await fetchApi('/admin/auth/me');
        if (isMounted) {
          const current = Date.now();
          setLastActiveTime(current);
          setNow(current);
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
    const current = Date.now();
    if (typeof window !== 'undefined') {
      localStorage.setItem('triclinium_admin_token', token);
      sessionStorage.setItem('triclinium_admin_user', JSON.stringify(userData));
      document.cookie = `triclinium_session=${token}; path=/; max-age=300; SameSite=Lax`;
    }
    setLastActiveTime(current);
    setNow(current);
    setUser(userData);
    setIsLoading(false);
    router.push('/admin');
  };

  const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes of inactivity

  const [lastActiveTime, setLastActiveTime] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());

  const logout = async (reason?: string) => {
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
      const current = Date.now();
      setLastActiveTime(current);
      setNow(current);
      setUser(null);
      setIsLoading(false);
      if (reason === 'inactivity') {
        router.push('/admin/login?timeout=inactivity');
      } else {
        router.push('/admin/login');
      }
    }
  };

  // Activity Watchdog: listen for user interactions to reset the 5-minute inactivity timer
  useEffect(() => {
    if (!user) return;

    let throttleTimer = 0;
    const recordActivity = () => {
      const current = Date.now();
      if (current - throttleTimer > 1000) {
        throttleTimer = current;
        setLastActiveTime(current);
      }
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((ev) => window.addEventListener(ev, recordActivity, { passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, recordActivity));
    };
  }, [user]);

  // Inactivity countdown ticker & auto-logout when 5 minutes of continuous inactivity elapsed
  useEffect(() => {
    if (!user) return;

    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);

      const idleDuration = current - lastActiveTime;
      if (idleDuration >= INACTIVITY_TIMEOUT_MS) {
        logout('inactivity');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user, lastActiveTime]);

  const getSessionInfo = (): SessionInfo => {
    const idleDuration = now - lastActiveTime;
    const remainingIdleMs = Math.max(0, INACTIVITY_TIMEOUT_MS - idleDuration);
    const totalIdleSecs = Math.floor(remainingIdleMs / 1000);
    const idleMins = Math.floor(totalIdleSecs / 60);
    const idleSecs = totalIdleSecs % 60;
    const timeRemainingText = `${idleMins}m ${idleSecs.toString().padStart(2, '0')}s`;

    return {
      expiresAt: new Date(lastActiveTime + INACTIVITY_TIMEOUT_MS),
      issuedAt: new Date(lastActiveTime),
      cookieName: user?.cookieName || 'triclinium_session',
      cookieMaxAgeSeconds: 300,
      timeRemainingText,
      isExpired: remainingIdleMs <= 0,
      inactivityRemainingSecs: totalIdleSecs,
      lastActiveTime,
    };
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
        sessionInfo: getSessionInfo(),
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
