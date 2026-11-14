import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-lg space-y-6">
      <div className="h-16 w-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">403</div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Access Restricted / Forbidden
      </h1>
      <p className="text-xs text-muted-foreground leading-relaxed">
        You do not possess the required role permissions (Super Admin, Administrator, or Sales Manager) to view or perform operations on this resource.
      </p>
      <div className="flex justify-center gap-3 pt-4">
        <Link href="/admin/login">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            <span>Administrator Sign In</span>
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Public Website</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
