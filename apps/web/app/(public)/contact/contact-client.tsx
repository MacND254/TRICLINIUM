'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, CheckCircle, Loader2, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fetchApi } from '@/lib/api-client';
import { usePublicSettings } from '@/lib/settings-context';
import { handleKenyanPhoneChange, formatKenyanPhone } from '@/lib/phone';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactClient() {
  const { settings } = usePublicSettings();
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [preferredContact, setPreferredContact] = useState<'EMAIL' | 'PHONE' | 'WHATSAPP'>('EMAIL');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Rate limit cooldown countdown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;

    const cleanName = customerName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (cleanName.length < 2) {
      setErrorMsg('Full name must be at least 2 characters.');
      return;
    }

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (cleanSubject.length < 3) {
      setErrorMsg('Subject must be at least 3 characters.');
      return;
    }

    if (cleanMessage.length < 15) {
      setErrorMsg('Message must be at least 15 characters to provide adequate detail.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetchApi('/contact', {
        method: 'POST',
        body: JSON.stringify({
          customerName: cleanName,
          email: cleanEmail,
          phone: phone ? formatKenyanPhone(phone) : undefined,
          company: company.trim() || undefined,
          subject: cleanSubject,
          message: cleanMessage,
          preferredContact,
        }),
      });

      setSubmittedRef(res.referenceNumber);
    } catch (err: any) {
      const msg = err.message || 'Failed to submit message. Please try again.';
      setErrorMsg(msg);
      if (err.status === 429 || msg.toLowerCase().includes('limit') || msg.toLowerCase().includes('slow down')) {
        setCooldownSeconds(err.retryAfter || 60);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
      {/* Contact Details Column - adheres properly to both Light and Dark mode */}
      <div className="lg:col-span-2 space-y-8 bg-slate-50 dark:bg-slate-900/90 text-slate-900 dark:text-white p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Security Consultations &amp; Site Surveys</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            Directly connect with our certified security technicians for free site surveys, custom CCTV proposals, smart alarm installations, and technical support across Kenya.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Operations Center &amp; Showroom</p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                {settings.address}<br />
                {settings.city}, {settings.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Telephone / WhatsApp</p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                <a href={`tel:${settings.phone}`} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{settings.phone}</a>
                {settings.phoneAlt && (
                  <>
                    {' · '}
                    <a href={`tel:${settings.phoneAlt}`} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{settings.phoneAlt}</a>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Electronic Mail</p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{settings.contactEmail}</a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Operating Hours</p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">{settings.businessHours}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <p>
            Need an urgent quotation or booking a site survey? Send us an inquiry below or reach out via WhatsApp for immediate response from our Nairobi dispatch team.
          </p>
        </div>
      </div>

      {/* Interactive Form Column */}
      <div className="lg:col-span-3 bg-card p-8 rounded-xl border shadow-sm">
        {submittedRef ? (
          <div className="text-center py-12 space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Message Successfully Sent</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Your inquiry has been logged in our corporate management system with tracking reference:
            </p>
            <div className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold text-sky-700 dark:text-sky-400 text-base">
              {submittedRef}
            </div>
            <p className="text-xs text-muted-foreground">
              A notification has been dispatched to our desk and a confirmation receipt sent to {email}.
            </p>
            <Button
              onClick={() => {
                setSubmittedRef(null);
                setSubject('');
                setMessage('');
                setPhone('');
              }}
              className="mt-4"
            >
              Send Another Inquiry
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Direct Correspondence</h3>

            {errorMsg && (
              <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                <Input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Kelvin Mwangi"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address *</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. kelvin@company.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone (Kenyan format)</label>
                <Input
                  value={phone}
                  onChange={(e) => handleKenyanPhoneChange(e, setPhone)}
                  onBlur={() => setPhone(formatKenyanPhone(phone))}
                  placeholder="e.g. 0712 345 678 -> +254..."
                  className="mt-1"
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Auto-formats: typing 07... converts to +2547...
                </span>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Company / Estate Name</label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Karen Villa or Apex Towers"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subject *</label>
                <Input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. 4K CCTV Home Installation Quote"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Preferred Contact</label>
                <select
                  value={preferredContact}
                  onChange={(e: any) => setPreferredContact(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="EMAIL">Email</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Inquiry Message *</label>
              <Textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your security requirements (number of cameras, premises type, alarm needs, site survey date)..."
                className="mt-1"
              />
            </div>

            {cooldownSeconds > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-amber-500 animate-pulse" />
                <span>Rate limit active. Next submission available in <strong>{cooldownSeconds}s</strong>.</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || cooldownSeconds > 0}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Transmitting Inquiry...</span>
                </>
              ) : cooldownSeconds > 0 ? (
                <>
                  <Clock className="h-4 w-4" />
                  <span>Cooldown ({cooldownSeconds}s)</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Security Inquiry</span>
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
