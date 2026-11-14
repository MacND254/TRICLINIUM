'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fetchApi } from '@/lib/api-client';
import { handleKenyanPhoneChange, formatKenyanPhone } from '@/lib/phone';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetName: string;
  type: 'product' | 'service';
}

export function InquiryModal({ isOpen, onClose, targetId, targetName, type }: InquiryModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [preferredContact, setPreferredContact] = useState<'EMAIL' | 'PHONE' | 'WHATSAPP'>('EMAIL');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload: any = {
        customerName,
        email,
        phone: phone || undefined,
        company: company || undefined,
        preferredContact,
      };

      if (type === 'product') {
        payload.productId = targetId;
        payload.quantity = quantity;
        payload.message = message || 'Customer requested specifications for this product.';
      } else {
        payload.serviceId = targetId;
        payload.projectDescription = message || 'Customer requested consultation for this service.';
      }

      const res = await fetchApi('/inquiries', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSubmittedRef(res.referenceNumber);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-background shadow-2xl border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-slate-50 dark:bg-slate-900/40">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {type === 'product' ? 'Product Specification Inquiry' : 'Service Consultation Inquiry'}
            </h3>
            <p className="text-xs text-sky-600 font-medium truncate max-w-sm">{targetName}</p>
          </div>
          <button
            onClick={() => {
              onClose();
              setSubmittedRef(null);
            }}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submittedRef ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900">Inquiry Received</h4>
              <p className="text-xs text-slate-600">
                Your inquiry has been assigned tracking reference:
              </p>
              <div className="inline-block px-3 py-1.5 bg-slate-100 rounded font-mono font-bold text-sky-700">
                {submittedRef}
              </div>
              <p className="text-xs text-slate-500">
                A confirmation has been sent to {email}. An engineer will review your inquiry and follow up.
              </p>
              <Button
                onClick={() => {
                  setSubmittedRef(null);
                  onClose();
                }}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700">Full Name *</label>
                  <Input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Marcus Vance"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Corporate Email *</label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marcus@company.com"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone</label>
                  <Input
                    value={phone}
                    onChange={(e) => handleKenyanPhoneChange(e, setPhone)}
                    onBlur={() => setPhone(formatKenyanPhone(phone))}
                    placeholder="e.g. 0712 345 678"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Company</label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Vanguard Inc"
                    className="mt-1"
                  />
                </div>
              </div>

              {type === 'product' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700">Quantity Needed</label>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Preferred Contact</label>
                    <select
                      value={preferredContact}
                      onChange={(e: any) => setPreferredContact(e.target.value)}
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="EMAIL">Email</option>
                      <option value="PHONE">Phone</option>
                      <option value="WHATSAPP">WhatsApp</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-700">
                  {type === 'product' ? 'Inquiry Message / Special Requirements' : 'Project Scope & Timeline'} *
                </label>
                <Textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your requirements, project timeline, delivery location..."
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-sky-600 hover:bg-sky-500 text-white">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Submit Inquiry</span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
