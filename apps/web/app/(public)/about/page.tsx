import React from 'react';
import { ShieldCheck, Award, Layers, Users, CheckCircle2, Video, Bell, Lock } from 'lucide-react';

export const metadata = {
  title: 'About Us | TRICLINIUM CCTV Surveillance & Home Alarm Systems',
  description: 'Learn about TRICLINIUM, our certified security technicians, 4K AI surveillance cameras, and smart wireless home alarm systems.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 space-y-16">
      {/* Hero */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" />
          <span>About TRICLINIUM Security Enterprise</span>
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Dedicated to Total Situational Awareness & Proactive Security
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Founded in 2014 by security engineers and network infrastructure specialists, TRICLINIUM delivers end-to-end CCTV surveillance, smart wireless intruder alarms, and integrated biometric access control solutions for residences, retail establishments, and corporate enterprises.
        </p>
      </div>

      {/* Grid: Mission, Vision, Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-xl border bg-card space-y-3">
          <div className="h-10 w-10 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center font-bold">
            01
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Our Mission</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            To provide homes and enterprises with intelligent, dependable 4K surveillance and intrusion detection systems that proactively prevent crime and safeguard loved ones and assets.
          </p>
        </div>

        <div className="p-8 rounded-xl border bg-card space-y-3">
          <div className="h-10 w-10 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Our Vision</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            To make modern AI-powered security accessible, effortless to operate from mobile devices, and resilient against downtime, weather hazards, and power interruptions.
          </p>
        </div>

        <div className="p-8 rounded-xl border bg-card space-y-3">
          <div className="h-10 w-10 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center font-bold">
            03
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Core Tenets</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Professional excellence in every cable run, zero blind spots, transparent equipment warranties, and rigorous encryption standards to protect your private video streams.
          </p>
        </div>
      </div>

      {/* Facilities & Quality Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8 border-t">
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Certified Equipment & Comprehensive Service Guarantee
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Every camera, recorder, and alarm sensor in our catalog undergoes rigorous bench testing before dispatch. Our licensed installation technicians ensure optimal field-of-view positioning, clean conduit installation, and flawless network configuration.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>4K Ultra HD Sensors with AI Human & Vehicle Classification</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Full Color Night Vision & IR Range up to 50 Meters</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Encrypted Cloud & Local Video Storage with Redundant Backup</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>1-Year Complete Warranty on All Hardware & Installation Labor</span>
            </div>
          </div>
        </div>

        <div className="aspect-[4/3] rounded-xl overflow-hidden border shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80"
            alt="TRICLINIUM Security Operations"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
