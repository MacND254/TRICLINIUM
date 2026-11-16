import type { Metadata } from 'next';
import './globals.css';
import { QuoteProvider } from '@/lib/quote-context';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/lib/settings-context';

const inter = { className: 'font-sans' };

export const metadata: Metadata = {
  title: {
    default: 'TRICLINIUM SYSTEMS | CCTV Cameras, Home Alarms, Intercoms & Smart Tech',
    template: '%s | TRICLINIUM SYSTEMS',
  },
  description:
    'Kenya’s premier provider of CCTV surveillance, smart video door bells, door cams, home alarm systems, video intercoms, home network setup, nanny cams, electric fencing, and expert installation services.',
  keywords: [
    'TRICLINIUM SYSTEMS',
    'CCTV surveillance Kenya',
    'security cameras Nairobi',
    'smart video doorbell',
    'door cams',
    'wireless home alarm',
    'video intercom',
    'home network setup',
    'mesh wifi installation',
    'nanny cams',
    'electric fencing',
    'automatic gate motors',
    'smart door locks',
  ],
  authors: [{ name: 'TRICLINIUM SYSTEMS' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'TRICLINIUM SYSTEMS | CCTV, Home Alarms & Smart Security',
    description: 'Protect what matters most. Professional CCTV, smart doorbells, home alarms, intercoms, and structured networking with certified installation.',
    url: 'https://triclinium.com',
    siteName: 'TRICLINIUM SYSTEMS',
    images: [
      {
        url: '/images/og-cctv.jpg',
        width: 1200,
        height: 630,
        alt: 'TRICLINIUM SYSTEMS Security & Tech Solutions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SettingsProvider>
            <QuoteProvider>
              {children}
            </QuoteProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
