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
  tagline: 'CCTV Surveillance, Smart Alarms & Home Network Infrastructure',
  logoUrl: '',
  faviconUrl: '',
  contactEmail: 'inquiries@triclinium.com',
  supportEmail: 'support@triclinium.com',
  phone: '+254 700 555 199',
  phoneAlt: '+254 711 555 198',
  address: 'Westlands Commercial Center, Ring Road',
  city: 'Nairobi',
  country: 'Kenya',
  businessHours: 'Mon–Sat: 08:00–18:00 EAT (24/7 Monitoring Station)',
  currency: 'KES',
  currencySymbol: 'Ksh',
  primaryColor: '#0ea5e9',
  accentColor: '#0284c7',
  colorGrading: 'cyber-security',
  metaTitle: 'TRICLINIUM SYSTEMS — CCTV Surveillance & Smart Security',
  metaDescription: 'Kenya premier supplier & installer of 4K CCTV surveillance cameras, smart video doorbells, wireless home alarms, and video intercoms.',
  googleAnalyticsId: '',
  googleTagManagerId: '',
};

const SettingsContext = createContext<{
  settings: PublicSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}>({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  refreshSettings: async () => {},
});

export function SettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: Partial<PublicSettings>;
}) {
  const [settings, setSettings] = useState<PublicSettings>({
    ...DEFAULT_SETTINGS,
    ...(initialSettings || {}),
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
        }
      }
    } catch (err) {
      console.warn('[SettingsProvider] Failed to fetch settings, using defaults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  // Dynamic Theme & Color Grading CSS injection
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (settings.primaryColor) {
      root.style.setProperty('--user-primary', settings.primaryColor);
    }
    if (settings.accentColor) {
      root.style.setProperty('--user-accent', settings.accentColor);
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
