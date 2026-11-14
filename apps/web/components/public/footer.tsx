import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-slate-950 text-slate-300">
      <div className="container mx-auto px-4 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Company Profile */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded bg-sky-600 flex items-center justify-center text-white font-bold text-base">
                T
              </div>
              <span className="text-xl font-bold tracking-tight text-white">TRICLINIUM</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Premier provider and certified installer of enterprise 4K AI CCTV surveillance systems, Network Video Recorders (NVR), smart intruder alarms, and biometric access control solutions.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <span>742 Security Parkway, Suite 500, Tech & Security District, NY 10001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-sky-400 shrink-0" />
                <span>+1 (800) 555-0199</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-400 shrink-0" />
                <span>inquiries@triclinium.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Mon - Fri: 8:00 AM - 6:00 PM EST (24/7 Monitoring)</span>
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
                  Engineering Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Company Overview
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-white transition-colors">
                  Client Case Studies
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Engineering Insights
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Procurement FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Product Capabilities */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Catalog
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/products?category=ip-cameras" className="hover:text-white transition-colors">
                  4K IP Dome & Bullet Cameras
                </Link>
              </li>
              <li>
                <Link href="/products?category=nvr-systems" className="hover:text-white transition-colors">
                  NVR & DVR Video Storage
                </Link>
              </li>
              <li>
                <Link href="/products?category=alarm-systems" className="hover:text-white transition-colors">
                  Wireless Home Alarm Kits
                </Link>
              </li>
              <li>
                <Link href="/services/professional-cctv-installation" className="hover:text-white transition-colors">
                  CCTV Installation Services
                </Link>
              </li>
              <li>
                <Link href="/services/security-system-maintenance" className="hover:text-white transition-colors">
                  Maintenance & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & RFQ CTA */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Request Quotation
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Need a custom CCTV or home alarm setup? Contact our certified security specialists today for a free site assessment and quote.
            </p>
            <Link href="/contact">
              <button className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors gap-2">
                <span>Request Free Security Quote</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Certified Security Installers | Warranty Backed</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} TRICLINIUM Commercial & Industrial Enterprise. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms & Conditions
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
