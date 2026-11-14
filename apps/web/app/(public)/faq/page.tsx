import React from 'react';
import { FaqClient } from './faq-client';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 300;

export const metadata = {
  title: 'Frequently Asked Questions (FAQ) | TRICLINIUM SYSTEMS',
  description: 'Common questions on CCTV camera installation, smart video doorbells, wireless home alarms, nanny cams, intercoms, and pricing in Kenya.',
};

export default async function FaqPage() {
  let faqs: any[] = [];

  try {
    faqs = await fetchApi('/faqs');
  } catch (e) {
    faqs = [];
  }

  // If backend faqs is empty or failed, use complete security FAQ dataset
  if (!faqs || faqs.length === 0) {
    faqs = [
      {
        id: 'faq-1',
        category: 'CCTV & Video Surveillance',
        question: 'Can I view my CCTV security cameras remotely on my smartphone?',
        answer: 'Yes, absolutely. All our 4K IP camera systems and NVR recorders connect securely to your iOS or Android smartphone via encrypted mobile apps. You can view live video feeds, playback recorded footage from anywhere in the world, and receive instant push notifications with video clips whenever motion is detected.',
      },
      {
        id: 'faq-2',
        category: 'CCTV & Video Surveillance',
        question: 'Do your security cameras continue recording during power outages or Kenya Power blackouts?',
        answer: 'Yes. We recommend and configure dedicated Uninterruptible Power Supply (UPS) backup battery units and inverter connections for all CCTV NVRs and cameras. Depending on your chosen battery capacity, our systems maintain uninterrupted 24/7 video recording for 4 to 18 hours during power blackouts.',
      },
      {
        id: 'faq-3',
        category: 'CCTV & Video Surveillance',
        question: 'Are there monthly subscription fees to store or view my CCTV recordings?',
        answer: 'No! Unlike third-party cloud cameras that charge mandatory monthly subscription fees per camera, our systems store all high-definition footage locally on internal surveillance-grade hard drives (2TB to 64TB) inside your NVR. You own 100% of your data with zero recurring monthly cloud fees.',
      },
      {
        id: 'faq-4',
        category: 'Smart Doorbells & Door Cams',
        question: 'How do Smart Video Doorbells and Door Cams work at the front entrance?',
        answer: 'When a visitor presses the doorbell or approaches your porch, our 2K smart video doorbells ring both an indoor wireless chime box and trigger a video call directly on your smartphone. You can speak to visitors with two-way audio talk, see packages on the doorstep with wide-angle head-to-toe viewing, and inspect live video even if you are away at the office.',
      },
      {
        id: 'faq-5',
        category: 'Home Alarm Systems',
        question: 'Will pets (dogs and cats) trigger false alarms with your wireless motion detectors?',
        answer: 'No. Our intruder alarm PIR sensors are engineered with dual-optic passive infrared and pet-immunity algorithms that ignore domestic animals weighing up to 25kg (55 lbs). They detect human body heat signatures and walking velocity while ignoring pets moving along floors.',
      },
      {
        id: 'faq-6',
        category: 'Home Alarm Systems',
        question: 'How does the wireless home alarm notify me if my home Wi-Fi is down or wires are cut?',
        answer: 'Our smart alarm hubs feature dual-path communication. In addition to home Wi-Fi and Ethernet, they house a 4G LTE cellular SIM card with battery backup. If an intruder cuts telephone lines or your home internet goes offline, the alarm instantly dispatches emergency SMS text messages and automated phone calls via the cellular network.',
      },
      {
        id: 'faq-7',
        category: 'Nanny Cams & Indoor Cameras',
        question: 'What features do your 360° Smart Nanny Cams offer for baby and elder monitoring?',
        answer: 'Our indoor nanny cameras provide motorized 360° pan-and-tilt control from your phone, 2K Quad-HD crisp video, infrared night vision, baby crying sound detection, and two-way audio. When you need privacy, the physical privacy shutter rotates the lens inside the housing so no video can be viewed.',
      },
      {
        id: 'faq-8',
        category: 'Intercoms & Access Control',
        question: 'Can your video intercom system open our electric gate and front door remotely?',
        answer: 'Yes. Our IP video intercom systems include relay outputs that wire directly to automated gate motors (Centurion, Roger, Nice) and electromagnetic door strikes. You can buzz in visitors directly from the wall-mounted 7-inch color touch monitor or through your smartphone app.',
      },
      {
        id: 'faq-9',
        category: 'Home Networking & Mesh WiFi',
        question: 'Why do I need structured network cabling and mesh Wi-Fi for my cameras?',
        answer: 'High-definition 4K cameras stream continuous data. Standard basic internet routers struggle with range and wall interference, causing video buffering and delayed notifications. Our structured CAT6 cabling and whole-home Mesh Wi-Fi 6 installations eliminate dead zones and ensure smooth, bufferless streaming throughout your home and compound.',
      },
      {
        id: 'faq-10',
        category: 'Perimeter Electric Fencing',
        question: 'Are your perimeter electric fence energizers legal, safe, and tamper-resistant?',
        answer: 'Yes. All our high-voltage fence energizers comply with international IEC and Kenyan safety standards. They deliver brief, safe, high-voltage non-lethal deterrent pulses that deter intruders. If someone cuts, shorts, or attempts to climb over the wire, a high-decibel siren sounds immediately and sends alerts to your phone.',
      },
      {
        id: 'faq-11',
        category: 'Installation & Warranty',
        question: 'What areas do you cover for installation, and what is your equipment warranty?',
        answer: 'We provide professional on-site security installation services across Nairobi (Kilimani, Westlands, Karen, Lavington, Runda, Muthaiga, South C, etc.) and countrywide across Kenya. All equipment installed by TRICLINIUM SYSTEMS carries a 1-year comprehensive hardware warranty and dedicated technical support.',
      },
      {
        id: 'faq-12',
        category: 'Pricing & Quotations',
        question: 'What currency are your products and services priced in, and how do I request a quote?',
        answer: 'All our products, equipment, and installation services are priced in Kenyan Shillings (KES / Ksh). You can click "Inquire / Request Order" on any product, use our "Get a Free Security Quote" button, or call our technical team at +254 700 555 199. We offer free on-site property assessments and itemized quotations.',
      },
    ];
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-bold text-sky-600 uppercase tracking-widest">
          Knowledge Base &amp; Technical Support
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-muted-foreground">
          Everything you need to know about 4K CCTV surveillance, smart doorbells, wireless intruder alarms, nanny cams, intercoms, and installation services across Kenya.
        </p>
      </div>

      <FaqClient faqs={faqs} />
    </div>
  );
}
