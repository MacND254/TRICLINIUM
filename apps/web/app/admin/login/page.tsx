'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { fetchApi } from '@/lib/api-client';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const { login } = useAdminAuth();
  const router = useRouter();

  // Cooldown countdown timer for rate limiting
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;

    // Client-side input validation
    const cleanEmail = email.trim();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please enter a valid administrator email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Password is required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetchApi('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      login(res.token, res.user);
    } catch (err: any) {
      const msg = err.message || 'Invalid administrator credentials';
      setErrorMsg(msg);

      // Check if server indicated rate limiting or account lockout
      if (err.status === 429 || msg.toLowerCase().includes('too many') || msg.toLowerCase().includes('rate limit')) {
        setCooldownSeconds(err.retryAfter || 60);
      } else if (err.status === 423 || msg.toLowerCase().includes('locked')) {
        setCooldownSeconds(300); // 5 minutes lockout display
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg shadow-sky-600/30">
            TS
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">TRICLINIUM Console</h1>
          <p className="text-xs text-slate-400">Enterprise Administration &amp; Security Console</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {cooldownSeconds > 0 && (
            <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 text-xs flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
              <span>
                Rate limit active. Next attempt enabled in <strong>{cooldownSeconds}s</strong>.
              </span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Input
                  type="email"
                  required
                  disabled={isLoading || cooldownSeconds > 0}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="archer.tritech@gmail.com"
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 pl-10 h-10 text-xs focus-visible:ring-sky-500 disabled:opacity-50"
                />
                <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link
                  href="/admin/forgot-password"
                  className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  required
                  disabled={isLoading || cooldownSeconds > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 pl-10 h-10 text-xs focus-visible:ring-sky-500 disabled:opacity-50"
                />
                <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || cooldownSeconds > 0}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold h-10 text-xs flex items-center justify-center gap-2 mt-2 shadow-lg shadow-sky-600/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : cooldownSeconds > 0 ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Cooldown ({cooldownSeconds}s)</span>
                </>
              ) : (
                <>
                  <span>Authenticate &amp; Enter Console</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Argon2id Encrypted &amp; Rate-Limited Protection</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Return to Public Business Website
          </Link>
        </div>
      </div>
    </div>
  );
}
