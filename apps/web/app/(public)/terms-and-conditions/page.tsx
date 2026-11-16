import React from 'react';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 60;

export const metadata = {
  title: 'Commercial Terms & Conditions | TRICLINIUM',
};

export default async function TermsPage() {
  let pageTitle = 'Commercial Terms & Conditions of Engagement';
  let content = '';

  try {
    const data = await fetchApi('/pages/terms-and-conditions');
    if (data?.title) pageTitle = data.title;
    if (data?.content) content = data.content;
  } catch {}

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        {pageTitle}
      </h1>
      <p className="text-xs text-muted-foreground">Effective Date: January 1, 2026</p>

      {content ? (
        <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed space-y-4 whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Quotations and Proposals</h3>
          <p>
            Submission of an RFQ through this website constitutes a non-binding request for pricing. An official purchase contract is executed only upon mutual execution of a formal Purchase Order (PO) and specification sign-off.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Installation Standards &amp; Workmanship</h3>
          <p>
            All cabling, camera mounting, and network equipment are installed in conformance with Kenyan Telecommunications and Electrical Safety regulations.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Warranties &amp; Certifications</h3>
          <p>
            TRICLINIUM certifies that all hardware adheres to supplied manufacturer warranties and 1-Year on-site labor coverage.
          </p>
        </div>
      )}
    </div>
  );
}
