import React from 'react';

export const metadata = {
  title: 'Cookie Policy | TRICLINIUM',
};

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        TRICLINIUM Cookie & Session Policy
      </h1>
      <p className="text-xs text-muted-foreground">Effective Date: January 1, 2026</p>

      <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed space-y-4">
        <p>
          We employ strictly necessary cookies and local storage items to preserve your active Request for Quotation (RFQ) line items and maintain authenticated sessions for administrators.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Strictly Necessary Authentication Cookies</h3>
        <p>
          Administrators logging into the administrative console receive an encrypted, HttpOnly, SameSite session token used to verify authorization headers.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Quotation List Storage</h3>
        <p>
          Visitor selections within the Quote Builder are temporarily maintained in browser localStorage to prevent loss of selected line items during catalog exploration.
        </p>
      </div>
    </div>
  );
}
