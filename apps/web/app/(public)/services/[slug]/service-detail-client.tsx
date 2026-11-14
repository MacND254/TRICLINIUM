'use client';

import React, { useState } from 'react';
import { MessageSquare, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InquiryModal } from '@/components/public/inquiry-modal';

export function ServiceDetailClient({ service }: { service: any }) {
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          size="lg"
          onClick={() => setInquiryModalOpen(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Inquire About This Service</span>
        </Button>
        <a href="tel:+18005550199">
          <Button size="lg" variant="outline" className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4" />
            <span>Speak with an Engineer</span>
          </Button>
        </a>
      </div>

      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        targetId={service.id}
        targetName={service.name}
        type="service"
      />
    </>
  );
}
