'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Application Runtime Error]:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-lg space-y-6">
      <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">500</div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        System Processing Error
      </h1>
      <p className="text-xs text-muted-foreground leading-relaxed">
        An unexpected application anomaly occurred while rendering this view. Our systems engineering monitor has logged the event.
      </p>
      <div className="flex justify-center gap-3 pt-4">
        <Button onClick={() => reset()} className="bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Attempt Reload</span>
        </Button>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Homepage</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
