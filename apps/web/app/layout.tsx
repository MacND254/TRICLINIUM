import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/public/header';
import { Footer } from '@/components/public/footer';
import { QuoteProvider } from '@/lib/quote-context';
import { QuoteDrawer } from '@/components/public/quote-drawer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'TRICLINIUM | Precision Industrial Engineering & Architectural Hardware',
    template: '%s | TRICLINIUM',
  },
  description:
    'Premier manufacturer and supplier of heavy-capacity architectural pivot hardware, precision mechanical couplings, and enterprise industrial telemetry software.',
  keywords: [
    'architectural hardware',
    'pivot hinge 750kg',
    'precision couplings',
    'industrial telemetry',
    '5-axis CNC machining',
    'structural FEA analysis',
    'TRICLINIUM',
  ],
  authors: [{ name: 'TRICLINIUM Engineering Enterprise' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'TRICLINIUM | Precision Industrial Engineering & Architectural Hardware',
    description: 'Premier manufacturer of precision-engineered physical & digital products, and bespoke commercial services.',
    url: 'https://triclinium.com',
    siteName: 'TRICLINIUM',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'TRICLINIUM Enterprise Industrial Portals',
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
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <QuoteDrawer />
          </div>
        </QuoteProvider>
      </body>
    </html>
  );
}
