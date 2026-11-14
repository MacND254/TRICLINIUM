import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QuoteProvider } from '@/lib/quote-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'TRICLINIUM | CCTV Surveillance & Advanced Alarm Systems',
    template: '%s | TRICLINIUM Surveillance',
  },
  description:
    'Leading provider of commercial and residential CCTV surveillance systems, AI-powered IP cameras, Network Video Recorders (NVR), biometric access control, and smart home alarm systems.',
  keywords: [
    'CCTV surveillance',
    'security cameras',
    'IP cameras',
    'NVR storage',
    'smart home alarm',
    'intruder detection',
    'video security',
    'biometric access control',
    'TRICLINIUM',
  ],
  authors: [{ name: 'TRICLINIUM Security Systems' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'TRICLINIUM | CCTV Surveillance & Advanced Alarm Systems',
    description: 'Enterprise-grade CCTV surveillance solutions, smart intruder alarms, and high-resolution video security hardware.',
    url: 'https://triclinium.com',
    siteName: 'TRICLINIUM Surveillance',
    images: [
      {
        url: '/images/og-cctv.jpg',
        width: 1200,
        height: 630,
        alt: 'TRICLINIUM CCTV & Security Systems',
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
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <QuoteProvider>
          {children}
        </QuoteProvider>
      </body>
    </html>
  );
}
