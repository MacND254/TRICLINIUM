'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Script from 'next/script';

export interface PublicSettings {
  siteName: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  contactEmail: string;
  supportEmail: string;
  phone: string;
  phoneAlt: string;
  address: string;
  city: string;
  country: string;
  businessHours: string;
  currency: string;
  currencySymbol: string;
  primaryColor: string;
  accentColor: string;
  themeMode?: string;
  colorGrading?: string;
  metaTitle: string;
  metaDescription: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
}

const DEFAULT_SETTINGS: PublicSettings = {
  siteName: 'TRICLINIUM SYSTEMS',
  tagline: 'Next-Generation CCTV Surveillance, Smart Alarms & Home Network Infrastructure',
  logoUrl: '/uploads/1794689746754-Futuristic_Purple_TRI.CLINIUM_Emblem.png',
  faviconUrl: '/favicon.ico',
  contactEmail: 'inquiries@triclinium.com',
  supportEmail: 'support@triclinium.com',
  phone: '+254 700 555 199',
  phoneAlt: '+254 711 555 198',
  address: 'Westlands Commercial Center, Ring Road, Nairobi, Kenya',
  city: 'Nairobi',
  country: 'Kenya',
  businessHours: 'Monday - Saturday: 8:00 AM - 6:00 PM EAT (24/7 Monitoring Station)',
  currency: 'KES',
  currencySymbol: 'Ksh',
  primaryColor: '#0f172a',
  accentColor: '#0284c7',
  colorGrading: 'cyber-security',
  metaTitle: 'TRICLINIUM SYSTEMS | CCTV Surveillance & Smart Security',
  metaDescription: 'Commercial and residential video surveillance, 4K AI IP cameras, smart video doorbells, wireless home alarms, and certified installation across Kenya.',
  googleAnalyticsId: '',
  googleTagManagerId: '',
};

const SETTINGS_STORAGE_KEY = 'triclinium_public_settings_cache_v2';

const SettingsContext = createContext<{
  settings: PublicSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}>({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  refreshSettings: async () => {},
});

function hexToHsl(hex: string): string | null {
  try {
    const cleanHex = hex.replace('#', '').trim();
    if (cleanHex.length !== 6 && cleanHex.length !== 3) return null;
    const fullHex = cleanHex.length === 3 ? cleanHex.split('').map((c) => c + c).join('') : cleanHex;
    const num = parseInt(fullHex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
        case gNorm: h = (bNorm - rNorm) / d + 2; break;
        case bNorm: h = (rNorm - gNorm) / d + 4; break;
      }
      h = Math.round(h * 60);
    }
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `${h} ${s}% ${l}%`;
  } catch {
    return null;
  }
}

export function SettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: Partial<PublicSettings>;
}) {
  const [settings, setSettings] = useState<PublicSettings>(() => {
    // 1. If server passed initialSettings, use them immediately
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      return { ...DEFAULT_SETTINGS, ...initialSettings };
    }
    // Return DEFAULT_SETTINGS on initial render so client matches SSR exactly (no hydration mismatch)
    return DEFAULT_SETTINGS;
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshSettings = async () => {
    try {
      setIsLoading(true);
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API}/api/v1/settings/public`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setSettings((prev) => ({ ...prev, ...json.data }));
          try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(json.data));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('[SettingsProvider] Failed to fetch settings, using defaults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // On client mount, load cached settings if server didn't provide initialSettings
    if (!initialSettings || Object.keys(initialSettings).length === 0) {
      try {
        const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch {}
    } else {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(initialSettings));
      } catch {}
    }
    refreshSettings();
  }, [initialSettings]);

  // Dynamic Theme & Color Grading CSS injection
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (settings.primaryColor) {
      root.style.setProperty('--user-primary', settings.primaryColor);
      const hslPrimary = hexToHsl(settings.primaryColor);
      if (hslPrimary) {
        root.style.setProperty('--primary', hslPrimary);
      }
    }
    if (settings.accentColor) {
      root.style.setProperty('--user-accent', settings.accentColor);
      const hslAccent = hexToHsl(settings.accentColor);
      if (hslAccent) {
        root.style.setProperty('--accent', hslAccent);
        root.style.setProperty('--ring', hslAccent);
      }
    }

    // Color grading classes on body
    document.body.dataset.colorGrading = settings.colorGrading || 'cyber-security';
  }, [settings.primaryColor, settings.accentColor, settings.colorGrading]);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refreshSettings }}>
      {/* Google Tag Manager Injection if ID provided */}
      {settings.googleTagManagerId && (
        <>
          <Script id="gtm-script" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${settings.googleTagManagerId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${settings.googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics (gtag.js) Injection if GA ID provided */}
      {settings.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-script" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.googleAnalyticsId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {children}
    </SettingsContext.Provider>
  );
}

export function usePublicSettings() {
  return useContext(SettingsContext);
}
