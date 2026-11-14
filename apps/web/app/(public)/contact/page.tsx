import React from 'react';
import { ContactClient } from './contact-client';

export const metadata = {
  title: 'Contact Engineering & Corporate Desk | TRICLINIUM',
  description: 'Reach TRICLINIUM for commercial inquiries, technical product specifications, and custom fabrication RFQs.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 space-y-12">
      <div className="border-b pb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Contact TRICLINIUM Enterprise
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Connect directly with registered engineers, technical sales representatives, and procurement specialists.
        </p>
      </div>

      <ContactClient />
    </div>
  );
}
