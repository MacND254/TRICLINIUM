'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { usePublicSettings } from '@/lib/settings-context';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = usePublicSettings();

  return (
    <footer className="border-t bg-slate-950 text-slate-300">
      <div className="container mx-auto px-4 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Company Profile */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName || 'TRICLINIUM SYSTEMS'}
                  className="max-h-12 h-auto w-auto max-w-[220px] object-contain object-left shrink-0"
                />
              ) : (
                <>
                  <div className="h-8 w-8 rounded bg-sky-600 flex items-center justify-center text-white font-extrabold text-base shrink-0">
                    TS
                  </div>
                  <span className="text-xl font-extrabold tracking-tight text-white">{settings.siteName || 'TRICLINIUM SYSTEMS'}</span>
                </>
              )}
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {settings.metaDescription || "Kenya's trusted supplier and certified installer of 4K AI CCTV surveillance systems, smart video doorbells, door cams, wireless intruder alarms, video intercoms, whole-home mesh Wi-Fi, and electric fencing."}
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{settings.address}, {settings.city}, {settings.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-sky-400 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">{settings.phone}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-400 shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white transition-colors">{settings.contactEmail}</a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-400 shrink-0" />
                <span>{settings.businessHours}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Security Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-white transition-colors">
                  Client Reviews
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Security Insights
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Security FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Product Capabilities */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Security Catalog
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/products?category=cctv-cameras" className="hover:text-white transition-colors">
                  4K IP Dome &amp; Turret Cameras
                </Link>
              </li>
              <li>
                <Link href="/products?category=video-doorbells" className="hover:text-white transition-colors">
                  Smart Video Doorbells &amp; Door Cams
                </Link>
              </li>
              <li>
                <Link href="/products?category=alarm-systems" className="hover:text-white transition-colors">
                  Wireless Home Alarm Kits
                </Link>
              </li>
              <li>
                <Link href="/products?category=intercoms" className="hover:text-white transition-colors">
                  HD Video Intercom Systems
                </Link>
              </li>
              <li>
                <Link href="/services/professional-cctv-installation" className="hover:text-white transition-colors">
                  CCTV Installation Services
                </Link>
              </li>
              <li>
                <Link href="/services/security-system-maintenance" className="hover:text-white transition-colors">
                  Maintenance &amp; Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Request Quotation CTA */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Free Site Survey
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Planning to secure your residential property or business premises? Book a free on-site survey and tailored security quotation today.
            </p>
            <Link href="/contact">
              <button className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors gap-2">
                <span>Book Site Survey &amp; Quote</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Certified Installers · 1-Year Warranty</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} TRICLINIUM SYSTEMS. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

