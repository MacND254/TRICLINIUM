'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Inbox,
  Search,
  Download,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Plus,
  X,
  Trash2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { handleKenyanPhoneChange, formatKenyanPhone } from '@/lib/phone';

interface CustomQuoteItem {
  description: string;
  qty: number;
  unitPrice: number;
}

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Custom Quote Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [quoteCustomerName, setQuoteCustomerName] = useState('');
  const [quoteEmail, setQuoteEmail] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteCompany, setQuoteCompany] = useState('');
  const [quoteSubject, setQuoteSubject] = useState('4K CCTV & Security System Quotation');
  const [quoteNotes, setQuoteNotes] = useState('Includes 1-year on-site equipment warranty, conduit cabling, and mobile app setup.');
  const [quotePaymentTerms, setQuotePaymentTerms] = useState('50% commitment upon project confirmation, 50% upon completed commissioning.');
  const [quoteValidUntil, setQuoteValidUntil] = useState('30 Days');
  const [quoteItems, setQuoteItems] = useState<CustomQuoteItem[]>([
    { description: 'TRICLINIUM ApexGuard 4K AI Turret Camera (PoE)', qty: 4, unitPrice: 14500 },
    { description: '8-Channel 4K NVR with 2TB Surveillance Hard Drive', qty: 1, unitPrice: 28500 },
    { description: 'Pure Copper Cat6 Cabling & Conduit Routing (per run)', qty: 4, unitPrice: 2500 },
    { description: 'Certified Installation, Commissioning & Mobile App Handover', qty: 1, unitPrice: 10000 },
  ]);

  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (typeFilter) query.set('type', typeFilter);
      if (statusFilter) query.set('status', statusFilter);
      if (search) query.set('search', search);

      const res = await fetchApi(`/admin/inquiries?${query.toString()}`);
      setInquiries(res.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [typeFilter, statusFilter]);

  const handleExportCsv = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/admin/inquiries/export`, '_blank');
  };

  const addQuoteItem = () => {
    setQuoteItems((prev) => [...prev, { description: '', qty: 1, unitPrice: 0 }]);
  };

  const removeQuoteItem = (idx: number) => {
    if (quoteItems.length <= 1) return;
    setQuoteItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuoteItem = (idx: number, field: keyof CustomQuoteItem, val: string | number) => {
    setQuoteItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const quoteSubtotal = quoteItems.reduce((acc, i) => acc + (i.qty * i.unitPrice), 0);
  const quoteVat = Math.round(quoteSubtotal * 0.16);
  const quoteGrandTotal = quoteSubtotal + quoteVat;

  const handleCreateCustomQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const cleanName = quoteCustomerName.trim();
    const cleanEmail = quoteEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (cleanName.length < 2) {
      setModalError('Customer Name must be at least 2 characters.');
      return;
    }

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setModalError('Please enter a valid client email address.');
      return;
    }

    if (quoteItems.length === 0) {
      setModalError('Please include at least one quote line item.');
      return;
    }

    for (let i = 0; i < quoteItems.length; i++) {
      const itm = quoteItems[i];
      if (!itm.description.trim()) {
        setModalError(`Line item #${i + 1} requires a valid description.`);
        return;
      }
      const qtyNum = Number(itm.qty);
      if (isNaN(qtyNum) || qtyNum < 1) {
        setModalError(`Line item #${i + 1} quantity must be a positive integer.`);
        return;
      }
      const priceNum = Number(itm.unitPrice);
      if (isNaN(priceNum) || priceNum < 0) {
        setModalError(`Line item #${i + 1} unit price cannot be negative.`);
        return;
      }
    }

    setIsSubmittingQuote(true);
    try {
      const res = await fetchApi('/admin/inquiries/custom-quote', {
        method: 'POST',
        body: JSON.stringify({
          customerName: cleanName,
          email: cleanEmail,
          phone: quotePhone ? formatKenyanPhone(quotePhone) : undefined,
          company: quoteCompany.trim() || undefined,
          subject: quoteSubject.trim(),
          notes: quoteNotes.trim(),
          paymentTerms: quotePaymentTerms.trim(),
          validUntil: quoteValidUntil.trim(),
          items: quoteItems.map((itm) => ({
            description: itm.description.trim(),
            qty: Math.max(1, Math.round(Number(itm.qty))),
            unitPrice: Math.max(0, Number(itm.unitPrice)),
          })),
        }),
      });

      setShowQuoteModal(false);
      if (res?.data?.id) {
        router.push(`/admin/inquiries/${res.data.id}`);
      } else {
        await loadInquiries();
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to create quotation');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Inquiries, Quotes &amp; Invoices</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage customer inquiries, create custom quotations, generate invoices, and convert quotes upon payment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setShowQuoteModal(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/30"
          >
            <Plus className="h-4 w-4" />
            <span>Create Custom Quote</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadInquiries();
          }}
          className="relative w-full sm:w-80"
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, customer, or email..."
            className="bg-slate-950 border-slate-800 text-white text-xs pr-8 h-9"
          />
          <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-300"
          >
            <option value="">All Inquiry Types</option>
            <option value="PRODUCT">Product Inquiries</option>
            <option value="QUOTATION">Quotation Requests (RFQ)</option>
            <option value="SERVICE">Service Inquiries</option>
            <option value="GENERAL">General Messages</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="QUOTED">Quoted</option>
            <option value="CONVERTED">Converted to Invoice</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Inbox className="h-10 w-10 text-slate-600 mx-auto" />
            <p className="text-sm">No inquiries or quotations match your active filter.</p>
            <Button
              size="sm"
              onClick={() => setShowQuoteModal(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs"
            >
              + Create First Custom Quote
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Customer &amp; Phone</th>
                  <th className="px-6 py-3.5">Subject / Scope</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {inquiries.map((inq) => {
                  const statusColors: Record<string, string> = {
                    NEW: 'bg-emerald-950 text-emerald-300 border-emerald-800',
                    IN_PROGRESS: 'bg-sky-950 text-sky-300 border-sky-800',
                    QUOTED: 'bg-amber-950 text-amber-300 border-amber-800',
                    CONVERTED: 'bg-purple-950 text-purple-300 border-purple-800',
                    CLOSED: 'bg-slate-800 text-slate-400 border-slate-700',
                  };

                  return (
                    <tr key={inq.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-sky-400">
                        {inq.referenceNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-300">{inq.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{inq.customerName}</div>
                        <div className="text-[11px] text-slate-400">{inq.phone || inq.email}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-300">
                        {inq.subject || inq.product?.name || inq.service?.name || inq.message}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold border px-2 py-0.5 ${
                            statusColors[inq.status] || 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {inq.status === 'CONVERTED' ? 'INVOICED / PAID' : inq.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                        {formatDate(inq.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/inquiries/${inq.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-slate-700 bg-slate-950 text-slate-200 hover:border-sky-500 hover:text-white text-xs gap-1.5"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Manage &amp; PDF</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* Create Custom Quote Modal */}
      {/* ───────────────────────────────────────────────────────── */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Create Custom Security Quotation</h3>
                  <p className="text-xs text-slate-400">Generate an official proposal in Kenyan Shillings (KES) with PDF &amp; Email options.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomQuote} className="space-y-5">
              {modalError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Customer / Client Full Name *</label>
                  <Input
                    required
                    value={quoteCustomerName}
                    onChange={(e) => setQuoteCustomerName(e.target.value)}
                    placeholder="e.g. David Mwangi"
                    className="mt-1 bg-slate-950 border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Client Email Address *</label>
                  <Input
                    type="email"
                    required
                    value={quoteEmail}
                    onChange={(e) => setQuoteEmail(e.target.value)}
                    placeholder="e.g. david@example.com"
                    className="mt-1 bg-slate-950 border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Phone (Auto-formats to +254)</label>
                  <Input
                    value={quotePhone}
                    onChange={(e) => handleKenyanPhoneChange(e, setQuotePhone)}
                    onBlur={() => setQuotePhone(formatKenyanPhone(quotePhone))}
                    placeholder="e.g. 0722 000 000 -> +254..."
                    className="mt-1 bg-slate-950 border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Company / Estate / Residence</label>
                  <Input
                    value={quoteCompany}
                    onChange={(e) => setQuoteCompany(e.target.value)}
                    placeholder="e.g. Karen Residence / Apex Towers"
                    className="mt-1 bg-slate-950 border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Quotation Title / Subject</label>
                <Input
                  required
                  value={quoteSubject}
                  onChange={(e) => setQuoteSubject(e.target.value)}
                  placeholder="e.g. 8-Camera 4K CCTV & Video Doorbell Installation"
                  className="mt-1 bg-slate-950 border-slate-700 text-white text-xs"
                />
              </div>

              {/* Line Items Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Itemized Scope &amp; Pricing</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuoteItem}
                    className="h-7 text-xs border-slate-700 bg-slate-950 text-slate-300 hover:text-white"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Row
                  </Button>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden divide-y divide-slate-800">
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] text-slate-400 uppercase font-semibold">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-3 text-right">Price (KES)</div>
                    <div className="col-span-1"></div>
                  </div>

                  {quoteItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-2 items-center">
                      <div className="col-span-6">
                        <input
                          required
                          value={item.description}
                          onChange={(e) => updateQuoteItem(idx, 'description', e.target.value)}
                          placeholder="Equipment or service name..."
                          className="w-full h-8 rounded border border-slate-800 bg-slate-900 px-2 text-xs text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => updateQuoteItem(idx, 'qty', Number(e.target.value))}
                          className="w-full h-8 rounded border border-slate-800 bg-slate-900 px-2 text-xs text-white text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={item.unitPrice}
                          onChange={(e) => updateQuoteItem(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full h-8 rounded border border-slate-800 bg-slate-900 px-2 text-xs text-white text-right"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeQuoteItem(idx)}
                          disabled={quoteItems.length === 1}
                          className="p-1 text-slate-500 hover:text-red-400 disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Preview */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <div className="text-slate-400">
                    Subtotal: Ksh {quoteSubtotal.toLocaleString()} · VAT (16%): Ksh {quoteVat.toLocaleString()}
                  </div>
                  <div className="font-extrabold text-sm text-sky-400 font-mono">
                    Total: Ksh {quoteGrandTotal.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Warranty &amp; Notes</label>
                  <Textarea
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    rows={2}
                    className="mt-1 bg-slate-950 border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Payment Terms</label>
                  <Textarea
                    value={quotePaymentTerms}
                    onChange={(e) => setQuotePaymentTerms(e.target.value)}
                    rows={2}
                    className="mt-1 bg-slate-950 border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowQuoteModal(false)}
                  className="border-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-sky-600/30"
                >
                  {isSubmittingQuote ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Quotation...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Create Official Quotation</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
