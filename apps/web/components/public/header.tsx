'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  ChevronRight,
  Phone,
  Mail,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/public/theme-toggle';
import { usePublicSettings } from '@/lib/settings-context';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = usePublicSettings();

  const email = settings.contactEmail || settings.supportEmail || settings.notifyEmail || settings.smtpFromEmail || '';
  const phone = settings.phone || settings.phoneAlt || '';
  const hours = settings.businessHours || '';
  const tagline = settings.tagline || '';

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
            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
                title="Call Customer Service"
              >
                <Phone className="h-3 w-3 text-sky-400" />
                <span>{phone}</span>
              </a>
            )}
            {settings.phoneAlt && settings.phoneAlt !== phone && (
              <a
                href={`tel:${settings.phoneAlt.replace(/\s+/g, '')}`}
                className="hidden lg:flex items-center gap-1.5 hover:text-white transition-colors text-slate-400 hover:text-slate-200"
                title="Secondary Hotline"
              >
                <span>/ {settings.phoneAlt}</span>
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
                title="Email Support"
              >
                <Mail className="h-3 w-3 text-sky-400" />
                <span>{email}</span>
              </a>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {hours && (
              <span className="hidden xl:flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Clock className="h-3 w-3 text-sky-400" />
                <span>{hours}</span>
              </span>
            )}
            {tagline && (
              <span className="text-slate-400">{tagline}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.siteName || 'TRICLINIUM SYSTEMS'}
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-md shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-sky-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm group-hover:bg-sky-500 transition-colors shrink-0">
              TS
            </div>
          )}
          <div className="flex flex-col leading-tight">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              {settings.siteName || 'TRICLINIUM SYSTEMS'}
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-widest text-sky-600 dark:text-sky-400 uppercase font-bold whitespace-nowrap">
              Security &amp; Smart Tech
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
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          <Link href="/search" className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Link>

          <Link href="/contact" className="hidden sm:inline-flex">
            <Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-sm">
              Get in Touch
            </Button>
          </Link>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white focus:outline-none"
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
            <div className="pt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">Appearance Theme:</span>
              <ThemeToggle />
            </div>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="pt-2"
            >
              <Button size="sm" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs">
                Get in Touch / Request Service
              </Button>
            </Link>

            {/* Dynamic Contact Details from Settings & Mail Gateway */}
            {(phone || email) && (
              <div className="pt-3 pb-1 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 hover:text-sky-600 dark:hover:text-sky-400 font-medium"
                  >
                    <Phone className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                    <span>{phone}</span>
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 hover:text-sky-600 dark:hover:text-sky-400 font-medium"
                  >
                    <Mail className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                    <span>{email}</span>
                  </a>
                )}
                {hours && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{hours}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
