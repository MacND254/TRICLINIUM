'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchApi } from '@/lib/api-client';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Rate limit cooldown countdown
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please enter a valid administrator email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await fetchApi('/admin/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail }),
      });
      setIsSuccess(true);
    } catch (err: any) {
      const msg = err.message || 'Failed to submit reset request';
      setErrorMsg(msg);
      if (err.status === 429 || msg.toLowerCase().includes('too many') || msg.toLowerCase().includes('limit')) {
        setCooldownSeconds(err.retryAfter || 60);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Password Recovery</h1>
          <p className="text-xs text-slate-400">TRICLINIUM Administrator Security Desk</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6">
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If the email <strong>{email}</strong> corresponds to an active administrator account, recovery instructions have been delivered.
              </p>
              <Link href="/admin/login">
                <Button className="mt-4 bg-sky-600 hover:bg-sky-500 text-white text-xs">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {cooldownSeconds > 0 && (
                <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 text-xs flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
                  <span>
                    Rate limit active. Please wait <strong>{cooldownSeconds}s</strong> before requesting another link.
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your registered administrator email address. We will verify your credentials and dispatch a cryptographically signed 1-hour reset token.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Corporate Email</label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    disabled={isLoading || cooldownSeconds > 0}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white pl-10 text-xs h-10 disabled:opacity-50"
                  />
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || cooldownSeconds > 0}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs h-10 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : cooldownSeconds > 0 ? (
                  `Cooldown (${cooldownSeconds}s)`
                ) : (
                  'Send Recovery Link'
                )}
              </Button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
