import React from 'react';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 60;

export const metadata = {
  title: 'Privacy Policy | TRICLINIUM',
};

export default async function PrivacyPolicyPage() {
  let pageTitle = 'TRICLINIUM Privacy Policy';
  let content = '';

  try {
    const data = await fetchApi('/pages/privacy-policy');
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
          <p>
            TRICLINIUM Commercial &amp; Industrial Enterprise (&quot;TRICLINIUM&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy and confidential engineering specifications. This policy outlines how we collect, store, and process business contact information and inquiry data.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Information We Collect</h3>
          <p>
            When you submit inquiries or request commercial quotations, we collect your name, corporate email address, telephone number, organization name, and relevant technical project details.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Engineering &amp; CAD Confidentiality</h3>
          <p>
            All CAD drawings, dimensional tolerances, finite element models, and proprietary mechanical designs transmitted to our engineering desk are governed by strict non-disclosure obligations. We never sell, lease, or share technical assets with third-party vendors.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Data Retention &amp; Security</h3>
          <p>
            Inquiry and quotation records are stored in encrypted PostgreSQL database storage complying with modern enterprise cybersecurity standards.
          </p>
        </div>
      )}
    </div>
  );
}
