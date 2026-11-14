'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  Loader2,
  FileSpreadsheet,
  MessageSquare,
  FilePlus,
  Plus,
  Trash2,
  Download,
  FileCheck,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { fetchApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import type { QuotationData, LineItem } from '@/components/admin/quotation-pdf';
import { QuotationPDF } from '@/components/admin/quotation-pdf';

// Dynamically import PDFDownloadLink to avoid SSR issues
// @ts-ignore
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
  { ssr: false }
);

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function thirtyDaysStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

export default function AdminInquiryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [inquiry, setInquiry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [status, setStatus] = useState('');
  const [urgency, setUrgency] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [noteContent, setNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Quotation section
  const [showQuotation, setShowQuotation] = useState(false);
  const quotationRef = useRef<HTMLDivElement>(null);

  const [quoteData, setQuoteData] = useState<QuotationData>({
    quoteRef: '',
    date: todayStr(),
    validUntil: thirtyDaysStr(),
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    items: [{ description: '', qty: 1, unitPrice: 0 }],
    taxRate: 16,
    notes: '',
    paymentTerms: 'Payment is due within 30 days of invoice date. Bank transfer preferred.',
    preparedBy: '',
  });

  const [isSavingQuoted, setIsSavingQuoted] = useState(false);

  const loadInquiry = async () => {
    try {
      const data = await fetchApi(`/admin/inquiries/${id}`);
      setInquiry(data);
      setStatus(data.status);
      setUrgency(data.urgency);

      // Pre-populate quotation fields from inquiry
      setQuoteData((prev) => ({
        ...prev,
        quoteRef: `QT-${data.referenceNumber}`,
        clientName: data.customerName || '',
        clientCompany: data.company || '',
        clientEmail: data.email || '',
        clientPhone: data.phone || '',
        items:
          data.items && data.items.length > 0
            ? data.items.map((item: any) => ({
                description: item.productName || item.product?.name || 'Item',
                qty: item.quantity || 1,
                unitPrice: 0,
              }))
            : [{ description: '', qty: 1, unitPrice: 0 }],
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadInquiry();
  }, [id]);

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      await fetchApi(`/admin/inquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, urgency }),
      });
      await loadInquiry();
    } catch (err: any) {
      alert(err.message || 'Failed to update inquiry');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsAddingNote(true);
    try {
      await fetchApi(`/admin/inquiries/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content: noteContent }),
      });
      setNoteContent('');
      await loadInquiry();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleToggleQuotation = () => {
    setShowQuotation((v) => !v);
    setTimeout(() => {
      quotationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSaveQuoted = async () => {
    setIsSavingQuoted(true);
    try {
      await fetchApi(`/admin/inquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'QUOTED' }),
      });
      setStatus('QUOTED');
      await loadInquiry();
      alert('Inquiry marked as QUOTED successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setIsSavingQuoted(false);
    }
  };

  // Line item helpers
  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    setQuoteData((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setQuoteData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', qty: 1, unitPrice: 0 }],
    }));
  };

  const removeItem = (idx: number) => {
    setQuoteData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  // Totals
  const subtotal = quoteData.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const taxAmount = (subtotal * quoteData.taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const fmtKES = (n: number) =>
    `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!inquiry) {
    return <div className="text-white text-center py-20">Inquiry not found.</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/inquiries')}
            className="border-slate-800 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Inquiries</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">{inquiry.referenceNumber}</h1>
              <Badge variant="outline" className="text-xs uppercase font-bold border-slate-700 text-sky-400">
                {inquiry.type}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Received on {formatDate(inquiry.createdAt)} via website form
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Create Quotation button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleQuotation}
            className="border-sky-700 text-sky-400 hover:bg-sky-900/30 hover:text-sky-300 text-xs flex items-center gap-1.5"
          >
            <FilePlus className="h-3.5 w-3.5" />
            <span>Create Quotation</span>
          </Button>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white"
          >
            <option value="NEW">NEW</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="AWAITING_CUSTOMER">AWAITING CUSTOMER</option>
            <option value="QUOTED">QUOTED</option>
            <option value="CONVERTED">CONVERTED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="SPAM">SPAM</option>
          </select>

          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>

          <Button
            size="sm"
            onClick={handleUpdateStatus}
            disabled={isUpdating}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs"
          >
            {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Status'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Inquiry Subject, Items, Message & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Multi-Item Quotation Line Items (if RFQ) */}
          {inquiry.type === 'QUOTATION' && inquiry.items && inquiry.items.length > 0 && (
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Requested Quotation Line Items ({inquiry.items.length})</span>
              </h3>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                {inquiry.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 flex items-center justify-between text-xs text-slate-300">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.productName || item.product?.name || 'Line Item'}</h4>
                      {item.product?.sku && <p className="text-slate-500 font-mono">SKU: {item.product.sku}</p>}
                      {item.notes && <p className="text-slate-400 mt-1 italic">Notes: {item.notes}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 uppercase font-medium">Quantity</span>
                      <div className="text-base font-bold text-sky-400 font-mono">{item.quantity} units</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Product or Service */}
          {(inquiry.product || inquiry.service) && (
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Associated Catalog Record
              </h3>
              <div className="text-sm font-bold text-white">
                {inquiry.product ? `Product: ${inquiry.product.name} (${inquiry.product.sku})` : `Service: ${inquiry.service?.name}`}
              </div>
            </div>
          )}

          {/* Customer Message */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">
              Customer Inquiry Message
            </h3>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {inquiry.message || 'No additional message was provided.'}
            </div>
          </div>

          {/* Internal Notes Stream */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Internal Administrative Notes</span>
            </h3>

            {/* Note form */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Log internal conversation, phone callback notes, pricing commitments..."
                rows={3}
                className="bg-slate-950 border-slate-800 text-white text-xs"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isAddingNote || !noteContent.trim()}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs flex items-center gap-1.5"
                >
                  {isAddingNote ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  <span>Post Note</span>
                </Button>
              </div>
            </form>

            {/* Stream */}
            <div className="space-y-3 pt-2">
              {inquiry.notes && inquiry.notes.length > 0 ? (
                inquiry.notes.map((note: any) => (
                  <div key={note.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-slate-200">{note.authorName}</span>
                      <span className="font-mono">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 text-center py-4">No internal notes posted yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Customer Card & Historical Activity */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Customer Information</h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Contact Name</span>
                <p className="font-bold text-white text-sm">{inquiry.customerName}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Email</span>
                <p className="flex items-center gap-1.5 mt-0.5 text-sky-400">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <a href={`mailto:${inquiry.email}`} className="hover:underline">{inquiry.email}</a>
                </p>
              </div>

              {inquiry.phone && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Phone</span>
                  <p className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <a href={`tel:${inquiry.phone}`} className="hover:underline">{inquiry.phone}</a>
                  </p>
                </div>
              )}

              {inquiry.company && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Company / Firm</span>
                  <p className="flex items-center gap-1.5 mt-0.5">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>{inquiry.company}</span>
                  </p>
                </div>
              )}

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Preferred Channel</span>
                <p className="font-bold text-white mt-0.5">{inquiry.preferredContact}</p>
              </div>
            </div>
          </div>

          {/* Historical Activity Stream */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky-400" />
              <span>Activity Timeline</span>
            </h3>

            <div className="space-y-3">
              {inquiry.activity && inquiry.activity.map((act: any) => (
                <div key={act.id} className="text-xs border-l-2 border-slate-700 pl-3 py-1 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{formatDate(act.createdAt)}</span>
                    <span className="font-semibold text-slate-300">{act.actorName}</span>
                  </div>
                  <div className="font-semibold text-white">{act.action.replace(/_/g, ' ')}</div>
                  {act.details && <p className="text-[11px] text-slate-400">{act.details}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* Generate Quotation Section */}
      {/* ───────────────────────────────────────────────────────── */}
      <div ref={quotationRef} className="scroll-mt-8">
        {/* Toggle header */}
        <button
          type="button"
          onClick={() => setShowQuotation((v) => !v)}
          className="w-full flex items-center justify-between p-5 rounded-xl border border-slate-700 bg-slate-900 hover:border-sky-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-900/40 group-hover:bg-sky-900/70 transition-colors">
              <FilePlus className="h-5 w-5 text-sky-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Generate Quotation</p>
              <p className="text-xs text-slate-400">Build, preview and download a professional PDF quotation</p>
            </div>
          </div>
          <span className="text-xs font-mono text-sky-400 border border-sky-800 rounded px-2 py-0.5">
            {showQuotation ? 'COLLAPSE ▲' : 'EXPAND ▼'}
          </span>
        </button>

        {showQuotation && (
          <div className="mt-4 p-6 rounded-xl border border-slate-700 bg-slate-900 space-y-6">
            {/* ── Quote Meta ── */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-4">
                Quote Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Quote Reference', key: 'quoteRef', type: 'text' },
                  { label: 'Date', key: 'date', type: 'date' },
                  { label: 'Valid Until', key: 'validUntil', type: 'date' },
                  { label: 'Prepared By', key: 'preparedBy', type: 'text' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={(quoteData as any)[key]}
                      onChange={(e) => setQuoteData((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-sky-600 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Client Info ── */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-4">
                Client Information
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Client Name', key: 'clientName' },
                  { label: 'Company', key: 'clientCompany' },
                  { label: 'Email', key: 'clientEmail' },
                  { label: 'Phone', key: 'clientPhone' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={(quoteData as any)[key] || ''}
                      onChange={(e) => setQuoteData((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-sky-600 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Line Items ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Line Items
                </h4>
                <Button
                  type="button"
                  size="sm"
                  onClick={addItem}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-1.5 h-7"
                >
                  <Plus className="h-3 w-3" />
                  Add Row
                </Button>
              </div>

              <div className="rounded-lg border border-slate-800 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-3 text-right">Unit Price (KES)</div>
                  <div className="col-span-1"></div>
                </div>

                {quoteData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 px-4 py-2 items-center border-b border-slate-800 last:border-0 hover:bg-slate-800/30"
                  >
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        placeholder="Item description..."
                        className="w-full h-7 rounded border border-slate-700 bg-slate-950 px-2 text-xs text-white focus:border-sky-600 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))}
                        className="w-full h-7 rounded border border-slate-700 bg-slate-950 px-2 text-xs text-white text-center focus:border-sky-600 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                        className="w-full h-7 rounded border border-slate-700 bg-slate-950 px-2 text-xs text-white text-right focus:border-sky-600 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={quoteData.items.length === 1}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-900/20 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tax & Totals ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={quoteData.taxRate}
                    onChange={(e) => setQuoteData((p) => ({ ...p, taxRate: Number(e.target.value) }))}
                    className="w-32 h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-sky-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Payment Terms
                  </label>
                  <Textarea
                    value={quoteData.paymentTerms}
                    onChange={(e) => setQuoteData((p) => ({ ...p, paymentTerms: e.target.value }))}
                    rows={3}
                    className="bg-slate-950 border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Notes &amp; Remarks
                  </label>
                  <Textarea
                    value={quoteData.notes}
                    onChange={(e) => setQuoteData((p) => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    placeholder="Optional notes for the client..."
                    className="bg-slate-950 border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              {/* Live Totals */}
              <div className="flex flex-col justify-start">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3">
                  Live Totals
                </h4>
                <div className="rounded-xl border border-slate-700 bg-slate-950 overflow-hidden">
                  <div className="flex justify-between px-5 py-3 border-b border-slate-800">
                    <span className="text-xs text-slate-400">Subtotal</span>
                    <span className="text-xs font-mono font-bold text-white">{fmtKES(subtotal)}</span>
                  </div>
                  <div className="flex justify-between px-5 py-3 border-b border-slate-800">
                    <span className="text-xs text-slate-400">Tax ({quoteData.taxRate}%)</span>
                    <span className="text-xs font-mono font-bold text-white">{fmtKES(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between px-5 py-4 bg-sky-900/20">
                    <span className="text-sm font-bold text-sky-300 uppercase tracking-wider">Grand Total</span>
                    <span className="text-sm font-mono font-bold text-sky-400">{fmtKES(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <Button
                type="button"
                size="sm"
                onClick={handleSaveQuoted}
                disabled={isSavingQuoted}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs flex items-center gap-1.5"
              >
                {isSavingQuoted ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileCheck className="h-3.5 w-3.5" />
                )}
                Save &amp; Mark as QUOTED
              </Button>

              {/* @ts-ignore */}
              <PDFDownloadLink
                document={<QuotationPDF quoteData={quoteData} />}
                fileName={`${quoteData.quoteRef || 'quotation'}.pdf`}
              >
                {/* @ts-ignore */}
                {({ loading }: { loading: boolean }) => (
                  <Button
                    type="button"
                    size="sm"
                    disabled={loading}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs flex items-center gap-1.5"
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    {loading ? 'Generating PDF...' : 'Download PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
