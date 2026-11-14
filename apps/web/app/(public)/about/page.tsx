import React from 'react';
import { ShieldCheck, Award, Layers, Users, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'About Us | TRICLINIUM Commercial & Industrial Enterprise',
  description: 'Learn about our engineering heritage, advanced metallurgical capabilities, and commitment to precision architectural hardware.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 space-y-16">
      {/* Hero */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
          Corporate Background & Engineering Heritage
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Uncompromising Precision in Mechanical Physics & Architectural Design
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Founded in 2012 by licensed mechanical engineers and metallurgical specialists, TRICLINIUM is dedicated to solving the structural and kinematics challenges of monumental building portals and high-load industrial machinery.
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
            To engineer and deliver the world’s most dependable, high-capacity pivot hardware and precision components with transparent metallurgical verification and zero-failure operation.
          </p>
        </div>

        <div className="p-8 rounded-xl border bg-card space-y-3">
          <div className="h-10 w-10 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Our Vision</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            To bridge physical manufacturing and digital asset telemetry, allowing engineers worldwide to design monumental architectural structures with real-time operational health insights.
          </p>
        </div>

        <div className="p-8 rounded-xl border bg-card space-y-3">
          <div className="h-10 w-10 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center font-bold">
            03
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Core Tenets</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Traceability at every step. We never substitute alloys, compromise tolerance thresholds, or deliver assemblies that fail rigorous optical metrology testing.
          </p>
        </div>
      </div>

      {/* Facilities & Quality Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8 border-t">
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Advanced Manufacturing & Testing Facility
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Our state-of-the-art facility features temperature-regulated machining suites, multi-axis 5-axis Mazak milling centers, and calibrated coordinate measuring machines (CMM) achieving optical accuracy within 5 microns.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Full Raw Material Optical Emission Spectrometry</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Hydraulic Tensile Testing up to 100,000 N</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Salt-Spray Corrosion Chamber (ASTM B117 Tested)</span>
            </div>
          </div>
        </div>

        <div className="aspect-[4/3] rounded-xl overflow-hidden border shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1200&q=80"
            alt="TRICLINIUM Facilities"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
