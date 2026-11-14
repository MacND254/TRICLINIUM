import React from 'react';
import { FaqClient } from './faq-client';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 300;

export const metadata = {
  title: 'Frequently Asked Questions (FAQ) | TRICLINIUM',
  description: 'Common questions on precision machining tolerances, RFQ quotations, and heavy pivot hardware lead times.',
};

export default async function FaqPage() {
  let faqs: any[] = [];

  try {
    faqs = await fetchApi('/faqs');
  } catch (e) {
    faqs = [
      {
        id: 'faq-1',
        category: 'Manufacturing',
        question: 'What is the standard lead time for custom manufactured components?',
        answer: 'Standard fabrication lead times range between 10 to 18 business days following engineering review and CAD sign-off. Expedited priority production is available for critical project timelines.',
      },
      {
        id: 'faq-2',
        category: 'Quality Assurance',
        question: 'Do you provide material test certificates and CMM inspection reports?',
        answer: 'Yes. Every component produced in our facilities is accompanied by full mill test reports (MTR) demonstrating chemical and physical composition, along with calibrated coordinate measuring machine (CMM) inspection data.',
      },
      {
        id: 'faq-3',
        category: 'Procurement',
        question: 'How do I submit an official Request for Quotation (RFQ)?',
        answer: 'You can build an RFQ directly through our website by adding items to the Quotation Builder, or submit your project drawings and specifications through our online inquiry desk.',
      },
    ];
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-muted-foreground">
          Clarifications on technical specifications, testing protocols, custom fabrication, and procurement workflows.
        </p>
      </div>

      <FaqClient faqs={faqs} />
    </div>
  );
}
