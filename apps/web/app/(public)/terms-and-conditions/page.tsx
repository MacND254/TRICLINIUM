import React from 'react';

export const metadata = {
  title: 'Commercial Terms & Conditions | TRICLINIUM',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Commercial Terms & Conditions of Engagement
      </h1>
      <p className="text-xs text-muted-foreground">Effective Date: January 1, 2026</p>

      <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Quotations and Proposals</h3>
        <p>
          Submission of an RFQ through this website constitutes a non-binding request for pricing. An official purchase contract is executed only upon mutual execution of a formal Purchase Order (PO) and specification sign-off.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Manufacturing Tolerances</h3>
        <p>
          Custom components are produced in conformance with agreed-upon ISO 2768 or ANSI Grade 1 dimensional tolerance standards as detailed on approved technical drawings.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Warranties & Certifications</h3>
        <p>
          TRICLINIUM certifies that all hardware adheres to supplied Mill Test Reports (MTRs) and EN 1154 mechanical compliance standards.
        </p>
      </div>
    </div>
  );
}
