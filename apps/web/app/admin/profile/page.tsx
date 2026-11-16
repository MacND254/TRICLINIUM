'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Shield,
  Key,
  Clock,
  Cookie,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Calendar,
  Lock,
  ArrowLeft,
  Mail,
  Fingerprint,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { formatDate } from '@/lib/utils';

export default function AdminProfilePage() {
  const { user, sessionInfo, logout, isLoading } = useAdminAuth();
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!sessionInfo?.expiresAt) return;

    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((sessionInfo.expiresAt!.getTime() - Date.now()) / 1000));
      setSecondsRemaining(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [sessionInfo?.expiresAt]);

  const formatDetailedCountdown = (totalSecs: number | null) => {
    if (totalSecs === null) return 'Checking session status...';
    if (totalSecs <= 0) return 'Session expired. Please log in again.';

    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0 || days > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    parts.push(`${mins} min${mins > 1 ? 's' : ''}`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  };

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      window.location.reload();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-sky-400" />
              <span>Admin Profile &amp; Security Session</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your administrator credentials, active authentication cookies, and session lifetime.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefreshSession}
            disabled={isRefreshing}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-sky-500 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-sky-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Verify Session</span>
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => logout()}
            className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 text-xs flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Administrator Profile Card */}
        <div className="md:col-span-1 rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-sky-600/30">
              {user?.firstName?.[0] || 'A'}
              {user?.lastName?.[0] || 'D'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                <Mail className="h-3 w-3 text-slate-500" />
                <span>{user?.email}</span>
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {user?.roles?.map((r) => (
                <Badge
                  key={r}
                  className="bg-sky-950 text-sky-300 border border-sky-800 text-[10px] uppercase font-bold tracking-wider"
                >
                  {r.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Fingerprint className="h-3.5 w-3.5 text-slate-500" />
                <span>User Identifier:</span>
              </span>
              <span className="font-mono text-[11px] text-slate-300 truncate max-w-[140px]" title={user?.id}>
                {user?.id ? `${user.id.slice(0, 10)}...` : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-slate-500" />
                <span>Permissions:</span>
              </span>
              <span className="font-semibold text-white">
                {user?.permissions?.length || 0} Grants
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span>Account Status:</span>
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Cookie & Session Expiration Overview */}
        <div className="md:col-span-2 space-y-6">
          {/* Active Session Expiry Card */}
          <div className="rounded-2xl border border-sky-900/50 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30 p-6 space-y-6 shadow-md shadow-sky-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Active Session Lifetime &amp; Expiry</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculated from authenticated JWT bearer token and server session state.
                  </p>
                </div>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Session Time Remaining
              </div>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-sky-400">
                {formatDetailedCountdown(secondsRemaining)}
              </div>
            </div>

            {/* Session Expiry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
                <div className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-sky-400" />
                  <span>Session Issued At</span>
                </div>
                <div className="text-white font-semibold font-mono text-[11px]">
                  {sessionInfo?.issuedAt
                    ? sessionInfo.issuedAt.toLocaleString('en-KE', {
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                      })
                    : 'Current Authentication Session'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
                <div className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Session Expires At</span>
                </div>
                <div className="text-amber-300 font-semibold font-mono text-[11px]">
                  {sessionInfo?.expiresAt
                    ? sessionInfo.expiresAt.toLocaleString('en-KE', {
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                      })
                    : 'Valid for 5 Minutes'}
                </div>
              </div>
            </div>
          </div>

          {/* Authentication Cookie Details */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Cookie className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Browser Cookie &amp; Storage Configuration</h3>
                <p className="text-xs text-slate-400">
                  Security flags enforced for administrative sessions under TRICLINIUM protocols.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-800 text-xs text-slate-300">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Authentication Cookie Name:</span>
                <span className="font-mono text-sky-400 font-semibold">
                  {sessionInfo?.cookieName || 'triclinium_session'}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Cookie Lifetime (Max-Age):</span>
                <span className="font-semibold text-white">
                  5 Minutes ({sessionInfo?.cookieMaxAgeSeconds?.toLocaleString() || '300'} seconds)
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Cookie Path &amp; Scope:</span>
                <span className="font-mono text-slate-300">path=/ (Full Domain)</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">SameSite Policy:</span>
                <span className="text-emerald-400 font-semibold">SameSite=Lax (CSRF Protected)</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">HttpOnly Flag:</span>
                <span className="text-emerald-400 font-semibold">
                  Enabled (Restricts JavaScript Access)
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Client Fallback Cookie:</span>
                <span className="font-mono text-slate-300">triclinium_session</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
