'use client';

import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useQuote } from '@/lib/quote-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fetchApi } from '@/lib/api-client';

export function QuoteDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearQuote } = useQuote();

  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [preferredContact, setPreferredContact] = useState<'EMAIL' | 'PHONE' | 'WHATSAPP'>('EMAIL');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        customerName,
        email,
        phone: phone || undefined,
        company: company || undefined,
        preferredContact,
        message,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          quantity: i.quantity,
          notes: i.notes || undefined,
        })),
      };

      const res = await fetchApi('/quotation-requests', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSubmittedRef(res.referenceNumber);
      clearQuote();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit quotation request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-background h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Request for Quotation (RFQ)</h2>
            <p className="text-xs text-muted-foreground">Select quantities and submit for formal commercial pricing</p>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              setSubmittedRef(null);
            }}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 space-y-6">
          {submittedRef ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Quotation Request Logged!</h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Your request has been routed to our commercial desk under official tracking reference:
              </p>
              <div className="inline-block px-4 py-2 bg-slate-100 rounded font-mono font-bold text-sky-700 text-lg">
                {submittedRef}
              </div>
              <p className="text-xs text-slate-500">
                A confirmation has been sent to <strong>{email}</strong>. Our pricing specialists will prepare your formal quotation shortly.
              </p>
              <Button
                onClick={() => {
                  setSubmittedRef(null);
                  setIsOpen(false);
                }}
                className="mt-4"
              >
                Close & Return to Catalog
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Plus className="h-6 w-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">Your Quote List is Empty</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Browse our product catalog and click &quot;Add to Quote&quot; on items you wish to include in your proposal request.
              </p>
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Explore Products
              </Button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Selected Line Items ({items.length})</span>
                  <button onClick={clearQuote} className="text-rose-500 hover:underline">
                    Clear All
                  </button>
                </div>
                <div className="divide-y border rounded-lg overflow-hidden">
                  {items.map((item) => (
                    <div key={item.productId} className="p-3 flex items-center justify-between gap-3 bg-card">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate text-slate-900 dark:text-white">
                          {item.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                        {item.price && (
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Est: ${item.price.toFixed(2)} / unit
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-md">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inquiry Customer Form */}
              <form id="quote-form" onSubmit={handleSubmit} className="space-y-4 pt-2 border-t">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Customer & Organization Information
                </h4>

                {errorMsg && (
                  <div className="p-3 rounded-md bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Name *</label>
                    <Input
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Corporate Email *</label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. jdoe@company.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 0199"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Company Name</label>
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Preferred Contact Method</label>
                  <select
                    value={preferredContact}
                    onChange={(e: any) => setPreferredContact(e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="PHONE">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Project Notes & Target Delivery Timeline
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Specify surface finishes, tolerance requirements, delivery destination..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer actions */}
        {!submittedRef && items.length > 0 && (
          <div className="border-t p-4 bg-slate-50 dark:bg-slate-900/50">
            <Button
              type="submit"
              form="quote-form"
              disabled={isSubmitting}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Official RFQ...</span>
                </>
              ) : (
                <>
                  <span>Submit Quotation Request</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground mt-2">
              Submission generates a formal RFQ. No purchase obligation or payment is triggered.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
