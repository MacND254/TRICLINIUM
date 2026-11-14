'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Wrench,
  Inbox,
  FileText,
  Home,
  BookOpen,
  HelpCircle,
  Image as ImageIcon,
  Users,
  Activity,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldAlert,
  Palette,
} from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from '@/lib/admin-auth-context';
import { usePublicSettings } from '@/lib/settings-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function AdminFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950/80 px-6 py-4 text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <p className="text-center sm:text-left">
          © 2026 TRICLINIUM SYSTEMS. All rights reserved.
        </p>
        <div className="flex items-center gap-4 flex-wrap justify-center text-slate-400">
          <Link href="/privacy-policy" target="_blank" className="hover:text-sky-400 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-slate-700">·</span>
          <Link href="/terms-and-conditions" target="_blank" className="hover:text-sky-400 transition-colors">
            Terms &amp; Conditions
          </Link>
          <span className="text-slate-700">·</span>
          <Link href="/cookie-policy" target="_blank" className="hover:text-sky-400 transition-colors">
            Cookie Policy
          </Link>
          <span className="text-slate-700">·</span>
          <Link href="/admin/login" className="hover:text-sky-400 text-sky-500 font-medium transition-colors">
            Admin Access
          </Link>
        </div>
      </div>
    </footer>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAdminAuth();
  const { settings } = usePublicSettings();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If on login/recovery pages, render clean standalone view with minimal admin footer
  if (['/admin/login', '/admin/forgot-password', '/admin/reset-password'].includes(pathname)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
        <div className="flex-1 flex items-center justify-center p-4">
          {children}
        </div>
        <AdminFooter />
      </div>
    );
  }

  const navSections = [
    {
      title: 'Overview',
      items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
    },
    {
      title: 'Catalog Management',
      items: [
        { label: 'Surveillance Products', href: '/admin/products', icon: Package },
        { label: 'Security Services', href: '/admin/services', icon: Wrench },
      ],
    },
    {
      title: 'Customer Relations',
      items: [
        { label: 'Inquiries, Quotes & Invoices', href: '/admin/inquiries', icon: Inbox },
        { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
      ],
    },
    {
      title: 'Content & CMS',
      items: [
        { label: 'Homepage Editor', href: '/admin/cms/homepage', icon: Home },
        { label: 'Theme & Color Grading', href: '/admin/cms/theme', icon: Palette },
        { label: 'Custom Pages', href: '/admin/cms/pages', icon: FileText },
        { label: 'Security Insights / Blog', href: '/admin/cms/blog', icon: BookOpen },
        { label: 'FAQs', href: '/admin/cms/faqs', icon: HelpCircle },
      ],
    },
    ...(hasRole('SUPER_ADMIN')
      ? [
        {
          title: 'Administration & Security',
          items: [
            { label: 'Administrators', href: '/admin/users', icon: Users },
            { label: 'Audit Logs', href: '/admin/audit-logs', icon: Activity },
            { label: 'Mail Gateway & Settings', href: '/admin/settings', icon: Settings },
          ],
        },
      ]
      : []),
  ];

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.siteName || 'TRICLINIUM SYSTEMS'}
              className="max-h-8 h-auto w-auto max-w-[150px] object-contain object-left shrink-0"
            />
          ) : (
            <>
              <div className="h-8 w-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white text-base shrink-0">
                TS
              </div>
              <div>
                <span className="font-bold text-white tracking-tight block text-sm leading-tight">{settings.siteName || 'TRICLINIUM SYSTEMS'}</span>
                <span className="text-[10px] text-sky-400 font-semibold block leading-tight">Security &amp; Tech Console</span>
              </div>
            </>
          )}
        </Link>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 text-slate-400 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${mobileSidebarOpen ? 'block' : 'hidden'
          } md:flex w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between shrink-0 h-auto md:h-screen md:sticky md:top-0 z-30`}
      >
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Logo Header */}
          <Link href="/admin" className="hidden md:flex items-center gap-3 pb-4 border-b border-slate-800">
            {settings.logoUrl ? (
              <div className="flex items-center h-10 w-full overflow-hidden">
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName || 'TRICLINIUM SYSTEMS'}
                  className="max-h-9 h-auto w-auto max-w-[180px] object-contain object-left shrink-0"
                />
              </div>
            ) : (
              <>
                <div className="h-9 w-9 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-sky-600/30 shrink-0">
                  TS
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white tracking-tight">{settings.siteName || 'TRICLINIUM SYSTEMS'}</div>
                  <div className="text-[10px] uppercase font-semibold text-sky-400 tracking-wider">
                    Security &amp; Tech Admin
                  </div>
                </div>
              </>
            )}
          </Link>

          {/* Navigation Groups */}
          <nav className="space-y-6">
            {navSections.map((sec, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 px-2.5">
                  {sec.title}
                </div>
                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isActive
                          ? 'bg-sky-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                          }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Card & Logout at bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</span>
              <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
            </div>
            <Badge variant="outline" className="border-sky-500/40 text-sky-400 text-[9px] uppercase font-bold shrink-0">
              {user?.roles?.[0]?.replace('_', ' ') || 'Admin'}
            </Badge>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link href="/" target="_blank" className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-[11px] border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="h-3 w-3" />
                <span>View Site</span>
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => logout()}
              className="h-8 px-2.5 text-xs bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <div className="flex-1 min-w-0 flex flex-col bg-slate-900 min-h-screen">
        <main className="flex-1 p-6 sm:p-10">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}
