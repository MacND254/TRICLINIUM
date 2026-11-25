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
  Receipt,
  FileText,
  Eye,
  Pencil,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { fetchApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { handleKenyanPhoneChange, formatKenyanPhone } from '@/lib/phone';
import type { QuotationData, LineItem } from '@/components/admin/quotation-pdf';
import { QuotationPDF } from '@/components/admin/quotation-pdf';
import type { InvoiceData, InvoiceLineItem } from '@/components/admin/invoice-pdf';
import { InvoicePDF } from '@/components/admin/invoice-pdf';
import { PdfPreviewModal } from '@/components/admin/pdf-preview-modal';
import { usePublicSettings } from '@/lib/settings-context';

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

function fourteenDaysStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split('T')[0];
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-900/40 text-blue-400 border-blue-800',
  IN_PROGRESS: 'bg-amber-900/40 text-amber-400 border-amber-800',
  AWAITING_CUSTOMER: 'bg-purple-900/40 text-purple-400 border-purple-800',
  QUOTED: 'bg-sky-900/40 text-sky-400 border-sky-800',
  CONVERTED: 'bg-emerald-900/40 text-emerald-400 border-emerald-800',
  CLOSED: 'bg-slate-800 text-slate-400 border-slate-700',
  SPAM: 'bg-rose-900/40 text-rose-400 border-rose-800',
};

export default function AdminInquiryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { settings } = usePublicSettings();

  const [inquiry, setInquiry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [status, setStatus] = useState('');
  const [urgency, setUrgency] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [noteContent, setNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Email Reply to Client State
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Document Generator Section (Quotation & Invoice)
  const [showDocGenerator, setShowDocGenerator] = useState(false);
  const [docType, setDocType] = useState<'QUOTATION' | 'INVOICE'>('QUOTATION');
  const docGeneratorRef = useRef<HTMLDivElement>(null);

  // Common items state shared or synced
  const [items, setItems] = useState<LineItem[]>([
    { description: 'TRICLINIUM ApexGuard 4K AI Turret Camera', qty: 2, unitPrice: 14500 },
    { description: 'Professional Installation & Cable Routing', qty: 1, unitPrice: 7500 },
  ]);

  const [quoteData, setQuoteData] = useState<QuotationData>({
    quoteRef: '',
    date: todayStr(),
    validUntil: thirtyDaysStr(),
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    items: [],
    taxRate: 16,
    notes: 'Includes 1-year on-site equipment warranty and mobile app configuration.',
    paymentTerms: 'Payment terms: 50% commitment upon project confirmation, 50% upon completed commissioning.',
    preparedBy: 'Chief Technical Engineer',
  });

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: '',
    date: todayStr(),
    dueDate: fourteenDaysStr(),
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientPin: '',
    items: [],
    taxRate: 16,
    notes: 'Goods remain the property of TRICLINIUM SYSTEMS until settled in full.',
    paymentInstructions: 'M-Pesa Paybill: 247247 | Acc: [Invoice Number] or Equity Bank Westlands',
    preparedBy: 'Finance & Accounts',
    status: 'ISSUED',
  });

  const [isSavingDoc, setIsSavingDoc] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // PDF Preview & Direct Download States
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState('');
  const [previewPdfFilename, setPreviewPdfFilename] = useState('');
  const [previewDocType, setPreviewDocType] = useState<'QUOTATION' | 'INVOICE'>('QUOTATION');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadInquiry = async () => {
    try {
      const data = await fetchApi(`/admin/inquiries/${id}`);
      setInquiry(data);
      setStatus(data.status);
      setUrgency(data.urgency);

      const extractUnitPrice = (item: any): number => {
        if (item.unitPrice !== undefined && item.unitPrice !== null && !isNaN(Number(item.unitPrice))) {
          return Number(item.unitPrice);
        }
        if (item.notes) {
          try {
            const parsed = JSON.parse(item.notes);
            if (parsed.unitPrice !== undefined && !isNaN(Number(parsed.unitPrice))) {
              return Number(parsed.unitPrice);
            }
          } catch {}
        }
        return 0;
      };

      let initialItems: LineItem[] = [];
      if (data.items && data.items.length > 0) {
        initialItems = data.items.map((item: any) => ({
          description: item.productName || item.product?.name || item.description || 'Security Equipment / Installation',
          qty: item.quantity || item.qty || 1,
          unitPrice: extractUnitPrice(item),
        }));
      } else if (data.message && data.message.includes('Custom Quote Items:')) {
        const itemPart = data.message.slice(
          data.message.indexOf('Custom Quote Items:') + 'Custom Quote Items:'.length,
          data.message.indexOf('\n\n') > -1 ? data.message.indexOf('\n\n') : undefined
        );
        const regex = /(?:^|\n|,\s*)(.+?)\s*\(x(\d+)\s*@\s*Ksh\s*([\d,]+)\)(?=,\s*|$)/g;
        let m;
        while ((m = regex.exec(itemPart.trim())) !== null) {
          initialItems.push({
            description: m[1].trim(),
            qty: parseInt(m[2], 10),
            unitPrice: parseFloat(m[3].replace(/,/g, '')),
          });
        }
      }

      if (initialItems.length === 0) {
        initialItems = [
          { description: data.subject || 'CCTV Surveillance & Security System', qty: 1, unitPrice: 28500 },
        ];
      }

      setItems(initialItems);

      const cleanRef = (data.referenceNumber || '2026-001').replace(/^(QT-|INV-)/, '');

      let extractedNotes = typeof data.notes === 'string' ? data.notes : '';
      let extractedTerms = '';
      if (data.message && data.message.includes('Notes:')) {
        const matchNotes = data.message.match(/Notes:\s*([\s\S]+?)(?:\nTerms:|$)/);
        if (matchNotes && matchNotes[1] && matchNotes[1].trim() !== 'None') {
          extractedNotes = matchNotes[1].trim();
        }
      }
      if (data.message && data.message.includes('Terms:')) {
        const matchTerms = data.message.match(/Terms:\s*([\s\S]+?)(?:\n\n|$)/);
        if (matchTerms && matchTerms[1] && matchTerms[1].trim() !== 'Standard') {
          extractedTerms = matchTerms[1].trim();
        }
      }

      // Pre-populate quotation fields from inquiry
      setQuoteData((prev) => ({
        ...prev,
        quoteRef: `QT-${cleanRef}`,
        subject: data.subject || 'Custom Security Quotation',
        clientName: data.customerName || '',
        clientCompany: data.company || '',
        clientEmail: data.email || '',
        clientPhone: data.phone || '',
        items: initialItems,
        notes: extractedNotes || prev.notes,
        paymentTerms: extractedTerms || prev.paymentTerms,
      }));

      // Pre-populate invoice fields from inquiry
      setInvoiceData((prev) => ({
        ...prev,
        invoiceNumber: `INV-${cleanRef}`,
        subject: data.subject || 'Custom Security Quotation',
        clientName: data.customerName || '',
        clientCompany: data.company || '',
        clientEmail: data.email || '',
        clientPhone: data.phone || '',
        items: initialItems,
      }));

      // Pre-populate reply subject
      setReplySubject(`Re: ${data.subject || 'Your Inquiry to TRICLINIUM SYSTEMS'} [${data.referenceNumber || cleanRef}]`);
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

  const handleDeleteInquiry = async () => {
    const isQuotation = inquiry?.type === 'QUOTATION' || inquiry?.status === 'QUOTED';
    const label = isQuotation ? `quotation ${inquiry?.referenceNumber}` : `inquiry ${inquiry?.referenceNumber}`;
    if (!window.confirm(`Are you sure you want to permanently delete ${label} for "${inquiry?.customerName}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await fetchApi(`/admin/inquiries/${id}`, { method: 'DELETE' });
      router.push('/admin/inquiries');
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
      setIsDeleting(false);
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

  const handleSendDirectReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsSendingReply(true);
    try {
      await fetchApi(`/admin/inquiries/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({
          subject: replySubject.trim() || `Re: ${inquiry?.subject || 'Inquiry'} [${inquiry?.referenceNumber}]`,
          message: replyMessage.trim(),
        }),
      });
      setReplyMessage('');
      await loadInquiry();
      alert(`Reply successfully dispatched to ${inquiry?.email} via Mail Gateway.`);
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch email reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  const openGenerator = (type: 'QUOTATION' | 'INVOICE') => {
    setDocType(type);
    setShowDocGenerator(true);
    setTimeout(() => {
      docGeneratorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSaveQuoted = async () => {
    setIsSavingDoc(true);
    try {
      // Persist quotation line items and details to backend
      await fetchApi(`/admin/inquiries/custom-quote/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          customerName: quoteData.clientName || inquiry?.customerName,
          email: quoteData.clientEmail || inquiry?.email,
          phone: quoteData.clientPhone || inquiry?.phone,
          company: quoteData.clientCompany || inquiry?.company,
          subject: quoteData.subject || inquiry?.subject || 'Custom Security Quotation',
          notes: quoteData.notes || '',
          paymentTerms: quoteData.paymentTerms || '',
          validUntil: quoteData.validUntil || '30 Days',
          items: items.map((itm) => ({
            description: itm.description,
            qty: itm.qty,
            unitPrice: itm.unitPrice,
          })),
        }),
      });

      await fetchApi(`/admin/inquiries/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          content: `Quotation ${quoteData.quoteRef} saved with ${items.length} line items (Total: ${fmtKES(grandTotal)}). Valid until ${quoteData.validUntil}.`,
        }),
      });
      await fetchApi(`/admin/inquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'QUOTED' }),
      });
      setStatus('QUOTED');
      await loadInquiry();
      alert('Quotation updated and saved successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update quotation');
    } finally {
      setIsSavingDoc(false);
    }
  };

  const handleSaveInvoiced = async () => {
    setIsSavingDoc(true);
    try {
      // Persist invoice line items and details to backend
      await fetchApi(`/admin/inquiries/custom-quote/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          customerName: invoiceData.clientName || inquiry?.customerName,
          email: invoiceData.clientEmail || inquiry?.email,
          phone: invoiceData.clientPhone || inquiry?.phone,
          company: invoiceData.clientCompany || inquiry?.company,
          subject: invoiceData.subject || inquiry?.subject || 'Tax Invoice',
          notes: invoiceData.notes || '',
          paymentTerms: invoiceData.paymentInstructions || '',
          validUntil: invoiceData.dueDate || 'Upon Receipt',
          items: items.map((itm) => ({ description: itm.description, qty: itm.qty, unitPrice: itm.unitPrice })),
        }),
      });
      await fetchApi(`/admin/inquiries/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          content: `Tax Invoice ${invoiceData.invoiceNumber} generated for ${fmtKES(grandTotal)} (${items.length} line items). Payment due: ${invoiceData.dueDate}.`,
        }),
      });
      await fetchApi(`/admin/inquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CONVERTED' }),
      });
      setStatus('CONVERTED');
      await loadInquiry();
      alert('Tax Invoice generated and saved. Status updated to CONVERTED.');
    } catch (err: any) {
      alert(err.message || 'Failed to save invoice record');
    } finally {
      setIsSavingDoc(false);
    }
  };

  const handleSendQuoteEmail = async () => {
    setIsSendingEmail(true);
    try {
      await fetchApi(`/admin/inquiries/${id}/send-quote`, {
        method: 'POST',
        body: JSON.stringify({
          quoteData: {
            ...quoteData,
            items,
          },
        }),
      });
      await loadInquiry();
      alert(`Quotation successfully dispatched to ${quoteData.clientEmail || inquiry.email} via Mail Gateway.`);
    } catch (err: any) {
      alert(err.message || 'Failed to send quotation email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendInvoiceEmail = async () => {
    setIsSendingEmail(true);
    try {
      await fetchApi(`/admin/inquiries/${id}/send-invoice`, {
        method: 'POST',
        body: JSON.stringify({
          invoiceData: {
            ...invoiceData,
            items,
          },
        }),
      });
      await loadInquiry();
      alert(`Tax Invoice successfully dispatched to ${invoiceData.clientEmail || inquiry.email} via Mail Gateway.`);
    } catch (err: any) {
      alert(err.message || 'Failed to send invoice email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleConvertToInvoice = async () => {
    const paymentRef = prompt('Enter M-Pesa Transaction Code or Payment Reference (e.g. QHA7821990):', 'MPESA-CONFIRMED');
    if (paymentRef === null) return; // User cancelled

    setIsSavingDoc(true);
    try {
      const invNo = `INV-${inquiry.referenceNumber || Date.now().toString().slice(-6)}`;
      await fetchApi(`/admin/inquiries/${id}/convert-to-invoice`, {
        method: 'POST',
        body: JSON.stringify({
          invoiceNumber: invNo,
          totalAmount: grandTotal,
          paymentReference: paymentRef,
          notes: 'Quotation verified and approved. Converted to Tax Invoice upon full payment.',
        }),
      });

      // Update invoice state
      setInvoiceData((prev) => ({
        ...prev,
        invoiceNumber: invNo,
        paymentStatus: 'PAID',
        notes: `Paid in full via ${paymentRef}. Includes 1-year on-site equipment warranty.`,
        items,
      }));

      // Switch view to Invoice mode
      setDocType('INVOICE');
      setShowDocGenerator(true);
      setStatus('CONVERTED');
      await loadInquiry();
      alert(`✅ Quotation successfully converted to Tax Invoice ${invNo} (Marked as PAID IN FULL).`);
    } catch (err: any) {
      alert(err.message || 'Conversion failed');
    } finally {
      setIsSavingDoc(false);
    }
  };

  // Line item helpers
  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
    setQuoteData((prev) => ({ ...prev, items: updated }));
    setInvoiceData((prev) => ({ ...prev, items: updated }));
  };

  const addItem = () => {
    const updated = [...items, { description: '', qty: 1, unitPrice: 0 }];
    setItems(updated);
    setQuoteData((prev) => ({ ...prev, items: updated }));
    setInvoiceData((prev) => ({ ...prev, items: updated }));
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    setQuoteData((prev) => ({ ...prev, items: updated }));
    setInvoiceData((prev) => ({ ...prev, items: updated }));
  };

  // Active Tax & Totals calculation
  const activeTaxRate = docType === 'QUOTATION' ? quoteData.taxRate : invoiceData.taxRate;
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const taxAmount = (subtotal * activeTaxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const fmtKES = (n: number) =>
    `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleOpenPdfPreview = async (type: 'QUOTATION' | 'INVOICE') => {
    setIsPreviewLoading(true);
    setPreviewDocType(type);
    const title =
      type === 'QUOTATION'
        ? `Quotation: ${quoteData.quoteRef || `QT-${inquiry?.referenceNumber || 'DOC'}`}`
        : `Tax Invoice: ${invoiceData.invoiceNumber || `INV-${inquiry?.referenceNumber || 'DOC'}`}`;
    const filename =
      type === 'QUOTATION'
        ? `${quoteData.quoteRef || `QT-${inquiry?.referenceNumber || 'quotation'}`}.pdf`
        : `${invoiceData.invoiceNumber || `INV-${inquiry?.referenceNumber || 'tax-invoice'}`}.pdf`;
    setPreviewPdfTitle(title);
    setPreviewPdfFilename(filename);
    setPreviewModalOpen(true);

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const doc =
        type === 'QUOTATION' ? (
          <QuotationPDF quoteData={{ ...quoteData, items }} companyDetails={settings} />
        ) : (
          <InvoicePDF invoiceData={{ ...invoiceData, items }} companyDetails={settings} />
        );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      setPreviewPdfUrl(url);
    } catch (err: any) {
      console.error('PDF preview generation error:', err);
      alert('Failed to generate PDF for preview');
      setPreviewModalOpen(false);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDirectDownloadPdf = async (type: 'QUOTATION' | 'INVOICE') => {
    setIsDownloadingPdf(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const doc =
        type === 'QUOTATION' ? (
          <QuotationPDF quoteData={{ ...quoteData, items }} companyDetails={settings} />
        ) : (
          <InvoicePDF invoiceData={{ ...invoiceData, items }} companyDetails={settings} />
        );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const filename =
        type === 'QUOTATION'
          ? `${quoteData.quoteRef || `QT-${inquiry?.referenceNumber || 'quotation'}`}.pdf`
          : `${invoiceData.invoiceNumber || `INV-${inquiry?.referenceNumber || 'tax-invoice'}`}.pdf`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF download error:', err);
      alert('Failed to download PDF document');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

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
      <div className="space-y-3 pb-5 border-b border-slate-800">
        {/* Row 1: Back Navigation, Reference & Primary Document Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/inquiries')}
              className="h-8 px-2.5 border-slate-700 bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white text-xs shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              <span>Back to Inquiries</span>
            </Button>
            <div className="h-5 w-px bg-slate-800 hidden sm:block shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-white font-mono tracking-tight">
                  {inquiry.referenceNumber}
                </h1>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold border-sky-800/80 bg-sky-950/40 text-sky-400 px-1.5 py-0.5"
                >
                  {inquiry.type}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Received on {formatDate(inquiry.createdAt)} via website form
              </p>
            </div>
          </div>

          {/* Right: Aligned Document Actions (All uniform h-8) */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {/* Create or Edit Quotation Button */}
            <Button
              size="sm"
              onClick={() => openGenerator('QUOTATION')}
              className="h-8 px-3 bg-sky-600 hover:bg-sky-500 text-white text-xs flex items-center gap-1.5 font-semibold shadow-sm"
            >
              {status === 'QUOTED' || inquiry.type === 'QUOTATION' ? (
                <>
                  <Pencil className="h-3.5 w-3.5 text-amber-300" />
                  <span>Edit Quotation</span>
                </>
              ) : (
                <>
                  <FileText className="h-3.5 w-3.5" />
                  <span>Create Quotation</span>
                </>
              )}
            </Button>

            {/* Create Invoice Button */}
            <Button
              size="sm"
              onClick={() => openGenerator('INVOICE')}
              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center gap-1.5 font-semibold shadow-sm"
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Create Invoice</span>
            </Button>

            {/* Delete Record Button */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDeleteInquiry}
              disabled={isDeleting}
              title="Delete Quotation / Inquiry"
              className="h-8 px-2.5 border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/60 hover:text-white text-xs flex items-center gap-1.5 font-semibold shrink-0"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              )}
              <span>Delete</span>
            </Button>

            {/* Quick PDF Preview & Download across QUOTED, CONVERTED, CLOSED */}
            {['QUOTED', 'CONVERTED', 'CLOSED'].includes(status) && (
              <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenPdfPreview(status === 'QUOTED' ? 'QUOTATION' : 'INVOICE')}
                  disabled={isPreviewLoading}
                  title={`Preview ${status === 'QUOTED' ? 'Official Quotation' : 'Tax Invoice'} PDF`}
                  aria-label={`Preview ${status === 'QUOTED' ? 'Official Quotation' : 'Tax Invoice'} PDF`}
                  className="h-8 w-8 p-0 border-slate-700 bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-white flex items-center justify-center shrink-0 shadow-sm"
                >
                  {isPreviewLoading && previewDocType === (status === 'QUOTED' ? 'QUOTATION' : 'INVOICE') ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleDirectDownloadPdf(status === 'QUOTED' ? 'QUOTATION' : 'INVOICE')}
                  disabled={isDownloadingPdf}
                  title={`Download ${status === 'QUOTED' ? 'Official Quotation' : 'Tax Invoice'} PDF`}
                  aria-label={`Download ${status === 'QUOTED' ? 'Official Quotation' : 'Tax Invoice'} PDF`}
                  className="h-8 w-8 p-0 border-slate-700 bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm"
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Status & Priority Workflow Control Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-800/90 bg-slate-900/60">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Current State:</span>
            <Badge
              variant="outline"
              className={`text-[10px] uppercase font-bold border px-2 py-0.5 ${
                statusColors[status] || 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {status === 'CONVERTED' ? 'INVOICED / PAID' : status}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-bold border-amber-900/60 bg-amber-950/40 text-amber-300 px-2 py-0.5"
            >
              {urgency} Priority
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] font-medium hidden md:inline">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="NEW">NEW</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="AWAITING_CUSTOMER">AWAITING CUSTOMER</option>
                <option value="QUOTED">QUOTED</option>
                <option value="CONVERTED">CONVERTED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="SPAM">SPAM</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] font-medium hidden md:inline">Priority:</span>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <Button
              size="sm"
              onClick={handleUpdateStatus}
              disabled={isUpdating}
              className="h-8 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold shrink-0 shadow-sm"
            >
              {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Status'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Inquiry Subject, Items, Message & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Multi-Item Quotation Line Items (if RFQ) */}
          {inquiry.type === 'QUOTATION' && inquiry.items && inquiry.items.length > 0 && (
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Requested Equipment Items ({inquiry.items.length})
                  </h3>
                </div>
                <Badge variant="outline" className="border-sky-800 text-sky-400 text-xs">
                  RFQ Quotation Request
                </Badge>
              </div>

              <div className="rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Item / Product Name</th>
                      <th className="py-2.5 px-4">Target Model / SKU</th>
                      <th className="py-2.5 px-4 text-center">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {inquiry.items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-medium text-white">
                          {item.productName || item.product?.name || 'General Inquired Model'}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-400">
                          {item.product?.sku || 'TRIC-CUSTOM'}
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold text-sky-400">
                          {item.quantity} units
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inquiry Details Box */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {inquiry.subject || 'Client Inquiry Message'}
            </h3>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {inquiry.message || 'No additional message provided.'}
            </div>

            {inquiry.estimatedValue && (
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
                <span className="text-slate-400">Client Estimated Budget:</span>
                <span className="font-bold font-mono text-emerald-400">
                  {fmtKES(inquiry.estimatedValue)}
                </span>
              </div>
            )}
          </div>

          {/* Active Quotation / Invoice Notes & Remarks */}
          {(quoteData.notes || quoteData.paymentTerms || invoiceData.notes || invoiceData.paymentInstructions) && (
            <div className="p-5 rounded-xl border border-amber-800/40 bg-amber-900/10 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                  Active {docType === 'INVOICE' ? 'Invoice' : 'Quotation'} Notes & Remarks
                </h3>
              </div>
              {(quoteData.notes || invoiceData.notes) && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Notes</p>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {docType === 'INVOICE' ? invoiceData.notes : quoteData.notes}
                  </p>
                </div>
              )}
              {(quoteData.paymentTerms || invoiceData.paymentInstructions) && (
                <div className="space-y-1 pt-2 border-t border-amber-800/30">
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Payment Terms</p>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {docType === 'INVOICE' ? invoiceData.paymentInstructions : quoteData.paymentTerms}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Email Reply to Client via Mail Gateway */}
          <div className="p-6 rounded-xl border border-sky-800/50 bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Reply to Client via Mail Gateway
                </h3>
              </div>
              <span className="text-xs text-sky-400 font-mono">
                To: {inquiry.email}
              </span>
            </div>

            <form onSubmit={handleSendDirectReply} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Subject</label>
                <input
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full mt-1 h-8 rounded border border-slate-800 bg-slate-950 px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Reply Message</label>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={`Write your official response to ${inquiry.customerName}. It will be sent via Mail Gateway directly to ${inquiry.email}...`}
                  rows={4}
                  className="mt-1 bg-slate-950 border-slate-800 text-white text-xs"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSendingReply || !replyMessage.trim()}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/30"
                >
                  {isSendingReply ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  <span>Send Reply via Mail Gateway</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Internal Notes & Communications */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Internal Case Notes ({inquiry.notes?.length || 0})
              </h3>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Log internal follow-up, call summary, or customer preference..."
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
                  <span>Add Note</span>
                </Button>
              </div>
            </form>

            <div className="space-y-3 pt-2">
              {inquiry.notes && inquiry.notes.length > 0 ? (
                inquiry.notes.map((note: any) => (
                  <div key={note.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-200">
                        {note.author?.firstName} {note.author?.lastName}
                      </span>
                      <span className="font-mono">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  No internal notes recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Timeline */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Client Contact Information
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact Person</span>
                <span className="font-bold text-white text-sm">{inquiry.customerName}</span>
              </div>

              {inquiry.company && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{inquiry.company}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <a href={`mailto:${inquiry.email}`} className="text-sky-400 hover:underline truncate">
                  {inquiry.email}
                </a>
              </div>

              {inquiry.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${inquiry.phone}`} className="text-slate-200 hover:underline">
                    {inquiry.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Audit Activity Trail */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Inquiry Audit Trail
            </h3>

            <div className="space-y-3">
              {inquiry.activities?.map((act: any) => (
                <div key={act.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-1">
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
      {/* Quotation & Invoice Document Generator */}
      {/* ───────────────────────────────────────────────────────── */}
      <div ref={docGeneratorRef} className="scroll-mt-8">
        {/* Toggle header */}
        <div className="p-5 rounded-xl border border-slate-700 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-900/40 text-sky-400">
              {docType === 'QUOTATION' ? <FileText className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white">Quotation &amp; Tax Invoice Generator</p>
              <p className="text-xs text-slate-400">
                Generate, calculate, and download official PDF Quotations or Tax Invoices in Kenyan Shillings (KES).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Selector Tabs */}
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDocType('QUOTATION');
                  setShowDocGenerator(true);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  docType === 'QUOTATION' && showDocGenerator
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Quotation Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocType('INVOICE');
                  setShowDocGenerator(true);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  docType === 'INVOICE' && showDocGenerator
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Invoice Mode
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDocGenerator((v) => !v)}
              className="text-xs font-mono text-sky-400 border border-slate-700 hover:border-sky-600 rounded px-2.5 py-1.5 bg-slate-950"
            >
              {showDocGenerator ? 'COLLAPSE ▲' : 'EXPAND ▼'}
            </button>
          </div>
        </div>

        {showDocGenerator && (
          <div className="mt-4 p-6 rounded-xl border border-slate-700 bg-slate-900 space-y-6">
            {/* Active Document Banner */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    docType === 'QUOTATION' ? 'bg-sky-400' : 'bg-emerald-400'
                  }`}
                />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Configuring {docType === 'QUOTATION' ? 'Official Quotation' : 'Commercial Tax Invoice'}
                </span>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] uppercase font-bold ${
                  docType === 'QUOTATION'
                    ? 'border-sky-700 text-sky-400'
                    : 'border-emerald-700 text-emerald-400'
                }`}
              >
                {docType === 'QUOTATION' ? 'Pro-Forma Quote' : 'Tax Invoice (KRA Compliant)'}
              </Badge>
            </div>

            {/* Document Metadata Fields */}
            {docType === 'QUOTATION' ? (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3">
                  Quotation Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Quotation Subject / Title
                    </label>
                    <input
                      type="text"
                      value={quoteData.subject || ''}
                      onChange={(e) => setQuoteData((p) => ({ ...p, subject: e.target.value }))}
                      placeholder="e.g. 4K CCTV Security Quotation"
                      className="w-full h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-sky-600 focus:outline-none"
                    />
                  </div>
                  {[
                    { label: 'Quote Reference', key: 'quoteRef', type: 'text' },
                    { label: 'Issued Date', key: 'date', type: 'date' },
                    { label: 'Valid Until', key: 'validUntil', type: 'text' },
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
            ) : (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                  Tax Invoice Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Invoice Subject / Title
                    </label>
                    <input
                      type="text"
                      value={invoiceData.subject || ''}
                      onChange={(e) => setInvoiceData((p) => ({ ...p, subject: e.target.value }))}
                      placeholder="e.g. 4K CCTV Security Tax Invoice"
                      className="w-full h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  {[
                    { label: 'Invoice Number', key: 'invoiceNumber', type: 'text' },
                    { label: 'Invoice Date', key: 'date', type: 'date' },
                    { label: 'Payment Due Date', key: 'dueDate', type: 'text' },
                    { label: 'Prepared By', key: 'preparedBy', type: 'text' },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        {label}
                      </label>
                      <input
                        type={type}
                        value={(invoiceData as any)[key]}
                        onChange={(e) => setInvoiceData((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Client Info */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Client / Billing Information
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={docType === 'QUOTATION' ? quoteData.clientName : invoiceData.clientName}
                    onChange={(e) => {
                      setQuoteData((p) => ({ ...p, clientName: e.target.value }));
                      setInvoiceData((p) => ({ ...p, clientName: e.target.value }));
                    }}
                    className="w-full h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Company / Estate
                  </label>
                  <input
                    type="text"
                    value={docType === 'QUOTATION' ? (quoteData.clientCompany || '') : (invoiceData.clientCompany || '')}
                    onChange={(e) => {
                      setQuoteData((p) => ({ ...p, clientCompany: e.target.value }));
                      setInvoiceData((p) => ({ ...p, clientCompany: e.target.value }));
                    }}
                    className="w-full h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Email Address
                  </label>
                  <input
                    type="text"
                    value={docType === 'QUOTATION' ? quoteData.clientEmail : invoiceData.clientEmail}
                    onChange={(e) => {
                      setQuoteData((p) => ({ ...p, clientEmail: e.target.value }));
                      setInvoiceData((p) => ({ ...p, clientEmail: e.target.value }));
                    }}
                    className="w-full h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={docType === 'QUOTATION' ? (quoteData.clientPhone || '') : (invoiceData.clientPhone || '')}
                    onChange={(e) => {
                      handleKenyanPhoneChange(e, (val) => {
                        setQuoteData((p) => ({ ...p, clientPhone: val }));
                        setInvoiceData((p) => ({ ...p, clientPhone: val }));
                      });
                    }}
                    onBlur={() => {
                      const cur = docType === 'QUOTATION' ? quoteData.clientPhone : invoiceData.clientPhone;
                      const formatted = formatKenyanPhone(cur || '');
                      setQuoteData((p) => ({ ...p, clientPhone: formatted }));
                      setInvoiceData((p) => ({ ...p, clientPhone: formatted }));
                    }}
                    placeholder="e.g. 0722 000 000 -> +254..."
                    className="w-full h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Client KRA PIN (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A012345678Z"
                    value={invoiceData.clientPin || ''}
                    onChange={(e) => setInvoiceData((p) => ({ ...p, clientPin: e.target.value }))}
                    className="w-full h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Document Line Items
                </h4>
                <Button
                  type="button"
                  size="sm"
                  onClick={addItem}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs flex items-center gap-1.5 h-7"
                >
                  <Plus className="h-3 w-3" />
                  Add Row
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-800 shadow-inner">
                <div className="min-w-[540px]">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-3 text-right">Unit Price (KES)</div>
                    <div className="col-span-1"></div>
                  </div>

                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 px-4 py-2 items-center border-b border-slate-800 last:border-0 hover:bg-slate-800/30"
                    >
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          placeholder="Security equipment or service description..."
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
                          step={100}
                          value={item.unitPrice}
                          onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full h-7 rounded border border-slate-700 bg-slate-950 px-2 text-xs text-white text-right focus:border-sky-600 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          disabled={items.length === 1}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-900/20 disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tax & Live Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Value Added Tax (VAT Rate %)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={activeTaxRate}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setQuoteData((p) => ({ ...p, taxRate: val }));
                      setInvoiceData((p) => ({ ...p, taxRate: val }));
                    }}
                    className="w-32 h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                {docType === 'QUOTATION' ? (
                  <>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        Quotation Payment Terms
                      </label>
                      <Textarea
                        value={quoteData.paymentTerms}
                        onChange={(e) => setQuoteData((p) => ({ ...p, paymentTerms: e.target.value }))}
                        rows={2}
                        className="bg-slate-950 border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        Notes &amp; Warranty Details
                      </label>
                      <Textarea
                        value={quoteData.notes}
                        onChange={(e) => setQuoteData((p) => ({ ...p, notes: e.target.value }))}
                        rows={2}
                        className="bg-slate-950 border-slate-700 text-white text-xs"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        Invoice Payment Instructions (M-Pesa / Bank)
                      </label>
                      <Textarea
                        value={invoiceData.paymentInstructions}
                        onChange={(e) => setInvoiceData((p) => ({ ...p, paymentInstructions: e.target.value }))}
                        rows={2}
                        className="bg-slate-950 border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        Legal Notes &amp; Terms of Sale
                      </label>
                      <Textarea
                        value={invoiceData.notes}
                        onChange={(e) => setInvoiceData((p) => ({ ...p, notes: e.target.value }))}
                        rows={2}
                        className="bg-slate-950 border-slate-700 text-white text-xs"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Live Totals Box */}
              <div className="flex flex-col justify-start">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                  Summary in Kenyan Shillings
                </h4>
                <div className="rounded-xl border border-slate-700 bg-slate-950 overflow-hidden">
                  <div className="flex justify-between px-5 py-3 border-b border-slate-800">
                    <span className="text-xs text-slate-400">Net Subtotal</span>
                    <span className="text-xs font-mono font-bold text-white">{fmtKES(subtotal)}</span>
                  </div>
                  <div className="flex justify-between px-5 py-3 border-b border-slate-800">
                    <span className="text-xs text-slate-400">VAT ({activeTaxRate}%)</span>
                    <span className="text-xs font-mono font-bold text-white">{fmtKES(taxAmount)}</span>
                  </div>
                  <div
                    className={`flex justify-between px-5 py-4 ${
                      docType === 'QUOTATION' ? 'bg-sky-950/40' : 'bg-emerald-950/40'
                    }`}
                  >
                    <span
                      className={`text-sm font-bold uppercase tracking-wider ${
                        docType === 'QUOTATION' ? 'text-sky-300' : 'text-emerald-300'
                      }`}
                    >
                      Total Payable (KES)
                    </span>
                    <span
                      className={`text-sm font-mono font-bold ${
                        docType === 'QUOTATION' ? 'text-sky-400' : 'text-emerald-400'
                      }`}
                    >
                      {fmtKES(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Toolbar - All aligned in one single cohesive line */}
            <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-slate-800">
              {docType === 'QUOTATION' ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleConvertToInvoice}
                    disabled={isSavingDoc}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/40"
                  >
                    <Receipt className="h-4 w-4" />
                    <span>Convert to Invoice Upon Full Payment</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSendQuoteEmail}
                    disabled={isSendingEmail || isSavingDoc}
                    className="bg-sky-900 hover:bg-sky-800 text-sky-100 text-xs flex items-center gap-1.5 border border-sky-700/60"
                  >
                    {isSendingEmail ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Mail className="h-3.5 w-3.5 text-sky-400" />
                    )}
                    <span>Email Quote to Client</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveQuoted}
                    disabled={isSavingDoc}
                    className="bg-sky-800 hover:bg-sky-700 text-white text-xs flex items-center gap-1.5 font-semibold"
                  >
                    {isSavingDoc ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileCheck className="h-3.5 w-3.5" />
                    )}
                    <span>{status === 'QUOTED' ? 'Save Quotation Changes' : 'Save & Mark as QUOTED'}</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenPdfPreview('QUOTATION')}
                    disabled={isPreviewLoading}
                    className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs flex items-center gap-1.5 font-semibold"
                  >
                    {isPreviewLoading && previewDocType === 'QUOTATION' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-sky-400" />
                    )}
                    <span>Preview Quotation PDF</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleDirectDownloadPdf('QUOTATION')}
                    disabled={isDownloadingPdf}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs flex items-center gap-1.5 font-semibold shadow-sm"
                  >
                    {isDownloadingPdf ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span>Download Quotation PDF</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setDocType('QUOTATION')}
                    className="border-slate-700 bg-slate-950 text-slate-300 hover:text-white text-xs flex items-center gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5 text-sky-400" />
                    <span>Switch Back to Quotation</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSendInvoiceEmail}
                    disabled={isSendingEmail || isSavingDoc}
                    className="bg-emerald-950 hover:bg-emerald-900 text-emerald-100 text-xs flex items-center gap-1.5 border border-emerald-700/60"
                  >
                    {isSendingEmail ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Mail className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span>Email Invoice to Client</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveInvoiced}
                    disabled={isSavingDoc}
                    className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs flex items-center gap-1.5 font-semibold"
                  >
                    {isSavingDoc ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileCheck className="h-3.5 w-3.5" />
                    )}
                    <span>Save &amp; Record INVOICE</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenPdfPreview('INVOICE')}
                    disabled={isPreviewLoading}
                    className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs flex items-center gap-1.5 font-semibold"
                  >
                    {isPreviewLoading && previewDocType === 'INVOICE' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span>Preview Tax Invoice PDF</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleDirectDownloadPdf('INVOICE')}
                    disabled={isDownloadingPdf}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center gap-1.5 font-semibold shadow-sm"
                  >
                    {isDownloadingPdf ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span>Download Tax Invoice PDF</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PDF Interactive Preview Modal */}
      <PdfPreviewModal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          if (previewPdfUrl) {
            URL.revokeObjectURL(previewPdfUrl);
            setPreviewPdfUrl(null);
          }
        }}
        title={previewPdfTitle}
        blobUrl={previewPdfUrl}
        fileName={previewPdfFilename}
        isLoading={isPreviewLoading}
        docType={previewDocType}
      />
    </div>
  );
}
