import React from 'react';
import { Header } from '@/components/public/header';
import { Footer } from '@/components/public/footer';
import { QuoteDrawer } from '@/components/public/quote-drawer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <QuoteDrawer />
    </div>
  );
}
