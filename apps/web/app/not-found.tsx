import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-lg space-y-6">
      <div className="text-7xl font-extrabold text-sky-600 font-mono tracking-tighter">404</div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Specification or Page Not Found
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        The hardware component, engineering service, or publication you requested may have been re-indexed, archived, or moved.
      </p>
      <div className="flex flex-wrap justify-center items-center gap-3 pt-4">
        <Link href="/">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Return to Homepage</span>
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Search Products Catalog</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
