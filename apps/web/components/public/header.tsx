'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  FileSpreadsheet,
  Lock,
  ChevronRight,
  Phone,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/lib/quote-context';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCount, setIsOpen } = useQuote();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top micro-bar */}
      <div className="hidden border-b bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:flex justify-between items-center">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-sky-400" />
              <span>+1 (800) 555-0199</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-sky-400" />
              <span>inquiries@triclinium.com</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Enterprise Engineering & Architectural Systems</span>
            <Link
              href="/admin/login"
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <Lock className="h-3 w-3 text-sky-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-9 w-9 rounded-md bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm border border-slate-700 group-hover:bg-sky-700 transition-colors">
            T
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              TRICLINIUM
            </span>
            <span className="text-[10px] tracking-widest text-slate-500 uppercase -mt-1 font-medium">
              Commercial & Industrial
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-sky-600 ${
                  isActive ? 'text-sky-600 font-semibold' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right action group */}
        <div className="flex items-center space-x-3">
          <Link href="/search" className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 transition-colors">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Link>

          {/* Quotation Request Drawer Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2 border-slate-300 dark:border-slate-700"
          >
            <FileSpreadsheet className="h-4 w-4 text-sky-600" />
            <span className="hidden sm:inline">RFQ Quote</span>
            {totalCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-sky-600 rounded-full">
                {totalCount}
              </span>
            )}
          </Button>

          <Link href="/contact" className="hidden lg:inline-flex">
            <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
              Get in Touch
            </Button>
          </Link>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-base font-medium text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-medium text-sky-600 pt-3"
            >
              <Lock className="h-4 w-4" />
              <span>Administrator Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
