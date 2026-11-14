'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, ArrowRight, Loader2, CheckCircle, AlertCircle, Check, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchApi } from '@/lib/api-client';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OWASP Password Criteria Checks
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Password reset token is missing from URL.');
      return;
    }

    if (!isFormValid) {
      setErrorMsg('Please ensure all password security requirements are fulfilled.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await fetchApi('/admin/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password. Link may be expired or already used.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6">
      {isSuccess ? (
        <div className="text-center space-y-4 py-4">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Password Updated</h3>
          <p className="text-xs text-slate-300">
            Your new administrator password has been committed. All previous active sessions have been invalidated.
          </p>
          <Link href="/admin/login">
            <Button className="mt-4 bg-sky-600 hover:bg-sky-500 text-white text-xs">
              Sign In with New Password
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

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">New Password</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs h-10"
            />
          </div>

          {/* Real-time OWASP Password Security Checklist */}
          {password.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
              <p className="font-semibold text-slate-400 mb-1">Security Standards:</p>
              <div className="grid grid-cols-2 gap-1.5">
                <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>8+ Characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasUpper ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasLower ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Digit (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 col-span-2 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasSpecial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Special Character (!@#$%^&*)</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Confirm New Password</label>
            <Input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs h-10"
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-[11px] text-rose-400 mt-1">Passwords do not match.</p>
            )}
            {passwordsMatch && (
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <Check className="h-3 w-3" /> Passwords match
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs h-10 mt-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Commit Secure Password'}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Reset Account Password</h1>
          <p className="text-xs text-slate-400">TRICLINIUM Security Credentials</p>
        </div>

        <Suspense fallback={
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
