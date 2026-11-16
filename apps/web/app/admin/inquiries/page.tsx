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
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { handleKenyanPhoneChange, formatKenyanPhone } from '@/lib/phone';
import { QuotationPDF } from '@/components/admin/quotation-pdf';
import { InvoicePDF } from '@/components/admin/invoice-pdf';
import { PdfPreviewModal } from '@/components/admin/pdf-preview-modal';

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

  // PDF Interactive Preview & Quick Download States
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState('');
  const [previewPdfFilename, setPreviewPdfFilename] = useState('');
  const [previewDocType, setPreviewDocType] = useState<'QUOTATION' | 'INVOICE'>('QUOTATION');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'preview' | 'download' | null>(null);

  // Custom Quote Modal & Edit State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editingQuoteRef, setEditingQuoteRef] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
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
    window.open(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/admin/inquiries/export`, '_blank');
  };

  const handleOpenCreateModal = () => {
    setEditingQuoteId(null);
    setEditingQuoteRef(null);
    setModalError(null);
    setQuoteCustomerName('');
    setQuoteEmail('');
    setQuotePhone('');
    setQuoteCompany('');
    setQuoteSubject('4K CCTV & Security System Quotation');
    setQuoteNotes('Includes 1-year on-site equipment warranty, conduit cabling, and mobile app setup.');
    setQuotePaymentTerms('50% commitment upon project confirmation, 50% upon completed commissioning.');
    setQuoteValidUntil('30 Days');
    setQuoteItems([
      { description: 'TRICLINIUM ApexGuard 4K AI Turret Camera (PoE)', qty: 4, unitPrice: 14500 },
      { description: '8-Channel 4K NVR with 2TB Surveillance Hard Drive', qty: 1, unitPrice: 28500 },
      { description: 'Pure Copper Cat6 Cabling & Conduit Routing (per run)', qty: 4, unitPrice: 2500 },
      { description: 'Certified Installation, Commissioning & Mobile App Handover', qty: 1, unitPrice: 10000 },
    ]);
    setShowQuoteModal(true);
  };

  const handleOpenEditModal = (inq: any) => {
    setEditingQuoteId(inq.id);
    setEditingQuoteRef(inq.referenceNumber);
    setModalError(null);
    setQuoteCustomerName(inq.customerName || '');
    setQuoteEmail(inq.email || '');
    setQuotePhone(inq.phone || '');
    setQuoteCompany(inq.company || '');
    setQuoteSubject(inq.subject || 'Custom Security Quotation');

    let notesVal = '';
    let termsVal = '';
    if (inq.message && inq.message.includes('Notes:')) {
      const matchNotes = inq.message.match(/Notes:\s*([^\n]+)/);
      if (matchNotes && matchNotes[1] && matchNotes[1] !== 'None') {
        notesVal = matchNotes[1].trim();
      }
    }
    if (inq.message && inq.message.includes('Terms:')) {
      const matchTerms = inq.message.match(/Terms:\s*([^\n]+)/);
      if (matchTerms && matchTerms[1] && matchTerms[1] !== 'Standard') {
        termsVal = matchTerms[1].trim();
      }
    }
    setQuoteNotes(notesVal || 'Includes 1-year on-site equipment warranty, conduit cabling, and mobile app setup.');
    setQuotePaymentTerms(termsVal || '50% commitment upon project confirmation, 50% upon completed commissioning.');
    setQuoteValidUntil('30 Days');

    const extractPrice = (itm: any): number => {
      if (itm.unitPrice !== undefined && itm.unitPrice !== null && !isNaN(Number(itm.unitPrice))) {
        return Number(itm.unitPrice);
      }
      if (itm.notes) {
        try {
          const parsed = JSON.parse(itm.notes);
          if (parsed.unitPrice !== undefined && !isNaN(Number(parsed.unitPrice))) {
            return Number(parsed.unitPrice);
          }
        } catch {}
      }
      return 0;
    };

    let parsedItems: CustomQuoteItem[] = [];
    if (inq.items && inq.items.length > 0) {
      parsedItems = inq.items.map((itm: any) => ({
        description: itm.productName || itm.description || 'Equipment / Service Item',
        qty: itm.quantity || itm.qty || 1,
        unitPrice: extractPrice(itm),
      }));
    } else if (inq.message && inq.message.includes('Custom Quote Items:')) {
      const itemPart = inq.message.slice(
        inq.message.indexOf('Custom Quote Items:') + 'Custom Quote Items:'.length,
        inq.message.indexOf('\n\n') > -1 ? inq.message.indexOf('\n\n') : undefined
      );
      const regex = /(?:^|\n|,\s*)(.+?)\s*\(x(\d+)\s*@\s*Ksh\s*([\d,]+)\)(?=,\s*|$)/g;
      let m;
      while ((m = regex.exec(itemPart.trim())) !== null) {
        parsedItems.push({
          description: m[1].trim(),
          qty: parseInt(m[2], 10),
          unitPrice: parseFloat(m[3].replace(/,/g, '')),
        });
      }
    }

    if (parsedItems.length === 0) {
      parsedItems = [
        { description: inq.subject || '4K CCTV & Security System Quotation', qty: 1, unitPrice: 28500 },
      ];
    }

    setQuoteItems(parsedItems);
    setShowQuoteModal(true);
  };

  const handleDeleteInquiry = async (inq: any) => {
    const isQuotation = inq.type === 'QUOTATION' || inq.status === 'QUOTED';
    const label = isQuotation ? `quotation ${inq.referenceNumber}` : `inquiry ${inq.referenceNumber}`;
    if (!window.confirm(`Are you sure you want to delete ${label} for "${inq.customerName}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeletingId(inq.id);
    try {
      await fetchApi(`/admin/inquiries/${inq.id}`, { method: 'DELETE' });
      await loadInquiries();
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    } finally {
      setIsDeletingId(null);
    }
  };

  const buildInquiryDocData = (inq: any) => {
    const isInvoice = inq.status === 'CONVERTED' || inq.status === 'CLOSED';

    const extractItemUnitPrice = (item: any): number => {
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

    let initialItems: CustomQuoteItem[] = [];
    if (inq.items && inq.items.length > 0) {
      initialItems = inq.items.map((item: any) => ({
        description: item.productName || item.product?.name || item.description || 'Security Equipment / Installation',
        qty: item.quantity || item.qty || 1,
        unitPrice: extractItemUnitPrice(item),
      }));
    } else if (inq.message && inq.message.includes('Custom Quote Items:')) {
      const itemPart = inq.message.slice(
        inq.message.indexOf('Custom Quote Items:') + 'Custom Quote Items:'.length,
        inq.message.indexOf('\n\n') > -1 ? inq.message.indexOf('\n\n') : undefined
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
        {
          description:
            inq.subject || inq.product?.name || inq.service?.name || 'CCTV Surveillance & Security System',
          qty: 1,
          unitPrice: 28500,
        },
      ];
    }

    const cleanRef = (inq.referenceNumber || '2026-001').replace(/^(QT-|INV-)/, '');

    let extractedNotes = typeof inq.notes === 'string' ? inq.notes : '';
    let extractedTerms = '';
    if (inq.message && inq.message.includes('Notes:')) {
      const matchNotes = inq.message.match(/Notes:\s*([^\n]+)/);
      if (matchNotes && matchNotes[1] && matchNotes[1] !== 'None') {
        extractedNotes = matchNotes[1].trim();
      }
    }
    if (inq.message && inq.message.includes('Terms:')) {
      const matchTerms = inq.message.match(/Terms:\s*([^\n]+)/);
      if (matchTerms && matchTerms[1] && matchTerms[1] !== 'Standard') {
        extractedTerms = matchTerms[1].trim();
      }
    }

    if (isInvoice) {
      return {
        docType: 'INVOICE' as const,
        cleanRef,
        data: {
          invoiceNumber: `INV-${cleanRef}`,
          subject: inq.subject || 'CCTV & Security System Invoice',
          date: inq.createdAt ? new Date(inq.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          dueDate: 'Upon Receipt',
          clientName: inq.customerName || 'Valued Client',
          clientCompany: inq.company || '',
          clientEmail: inq.email || '',
          clientPhone: inq.phone || '',
          clientPin: '',
          items: initialItems,
          taxRate: 16,
          notes: extractedNotes || 'Goods remain the property of TRICLINIUM SYSTEMS until settled in full.',
          paymentInstructions: 'M-Pesa Paybill: 247247 | Acc: [Invoice Number] or Equity Bank Westlands',
          preparedBy: 'Finance & Accounts',
          status: inq.status === 'CONVERTED' ? 'PAID' : 'ISSUED',
        },
      };
    } else {
      return {
        docType: 'QUOTATION' as const,
        cleanRef,
        data: {
          quoteRef: `QT-${cleanRef}`,
          subject: inq.subject || 'Custom Security Quotation',
          date: inq.createdAt ? new Date(inq.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          validUntil: '30 Days',
          clientName: inq.customerName || 'Valued Client',
          clientCompany: inq.company || '',
          clientEmail: inq.email || '',
          clientPhone: inq.phone || '',
          items: initialItems,
          taxRate: 16,
          notes: extractedNotes || 'Includes 1-year on-site equipment warranty and mobile app configuration.',
          paymentTerms: extractedTerms || 'Payment terms: 50% commitment upon project confirmation, 50% upon completed commissioning.',
          preparedBy: 'Chief Technical Engineer',
        },
      };
    }
  };

  const handlePreviewRowPdf = async (inq: any) => {
    setActiveActionId(inq.id);
    setActionType('preview');
    setIsPreviewLoading(true);

    const { docType, data, cleanRef } = buildInquiryDocData(inq);
    setPreviewDocType(docType);
    const title =
      docType === 'QUOTATION'
        ? `Quotation: QT-${cleanRef}`
        : `Tax Invoice: INV-${cleanRef}`;
    const filename = `${docType === 'QUOTATION' ? 'QT' : 'INV'}-${cleanRef}.pdf`;
    setPreviewPdfTitle(title);
    setPreviewPdfFilename(filename);
    setPreviewModalOpen(true);

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const doc =
        docType === 'QUOTATION' ? (
          <QuotationPDF quoteData={data} />
        ) : (
          <InvoicePDF invoiceData={data} />
        );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      setPreviewPdfUrl(url);
    } catch (err: any) {
      console.error('PDF preview error:', err);
      alert('Failed to generate PDF for preview');
      setPreviewModalOpen(false);
    } finally {
      setIsPreviewLoading(false);
      setActiveActionId(null);
      setActionType(null);
    }
  };

  const handleDownloadRowPdf = async (inq: any) => {
    setActiveActionId(inq.id);
    setActionType('download');
    try {
      const { docType, data, cleanRef } = buildInquiryDocData(inq);
      const { pdf } = await import('@react-pdf/renderer');
      const doc =
        docType === 'QUOTATION' ? (
          <QuotationPDF quoteData={data} />
        ) : (
          <InvoicePDF invoiceData={data} />
        );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const filename = `${docType === 'QUOTATION' ? 'QT' : 'INV'}-${cleanRef}.pdf`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF download error:', err);
      alert('Failed to download PDF');
    } finally {
      setActiveActionId(null);
      setActionType(null);
    }
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
      const payload = {
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
      };

      if (editingQuoteId) {
        await fetchApi(`/admin/inquiries/custom-quote/${editingQuoteId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setShowQuoteModal(false);
        setEditingQuoteId(null);
        setEditingQuoteRef(null);
        await loadInquiries();
      } else {
        const res = await fetchApi('/admin/inquiries/custom-quote', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        setShowQuoteModal(false);
        if (res?.data?.id) {
          router.push(`/admin/inquiries/${res.data.id}`);
        } else {
          await loadInquiries();
        }
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to save quotation');
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
            onClick={handleOpenCreateModal}
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
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="px-3 py-2.5 whitespace-nowrap">Reference</th>
                  <th className="px-2.5 py-2.5 whitespace-nowrap">Type</th>
                  <th className="px-3 py-2.5">Customer &amp; Phone</th>
                  <th className="px-3 py-2.5">Subject / Scope</th>
                  <th className="px-2.5 py-2.5 whitespace-nowrap">Status</th>
                  <th className="px-2.5 py-2.5 whitespace-nowrap">Date</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">Action</th>
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
                      <td className="px-3 py-2.5 font-mono font-bold text-sky-400 whitespace-nowrap text-xs">
                        {inq.referenceNumber}
                      </td>
                      <td className="px-2.5 py-2.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-300 text-[11px]">{inq.type}</span>
                      </td>
                      <td className="px-3 py-2.5 min-w-0 max-w-[130px] lg:max-w-[160px]">
                        <div className="font-bold text-white truncate text-xs">{inq.customerName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{inq.phone || inq.email}</div>
                      </td>
                      <td className="px-3 py-2.5 min-w-0 max-w-[140px] lg:max-w-[200px] xl:max-w-[280px] truncate text-slate-300 text-xs">
                        {inq.subject || inq.product?.name || inq.service?.name || inq.message}
                      </td>
                      <td className="px-2.5 py-2.5 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold border px-1.5 py-0.5 ${
                            statusColors[inq.status] || 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {inq.status === 'CONVERTED' ? 'INVOICED / PAID' : inq.status}
                        </Badge>
                      </td>
                      <td className="px-2.5 py-2.5 whitespace-nowrap font-mono text-[10px] text-slate-400">
                        {formatDate(inq.createdAt)}
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {['QUOTED', 'CONVERTED', 'CLOSED'].includes(inq.status) && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreviewRowPdf(inq)}
                                disabled={activeActionId === inq.id}
                                title={`Preview ${inq.status === 'QUOTED' ? 'Quotation' : 'Tax Invoice'} PDF`}
                                aria-label={`Preview ${inq.status === 'QUOTED' ? 'Quotation' : 'Tax Invoice'} PDF`}
                                className="h-7 w-7 p-0 border-slate-700 bg-slate-950 text-slate-300 hover:text-white hover:border-sky-500 shrink-0 shadow-sm flex items-center justify-center"
                              >
                                {activeActionId === inq.id && actionType === 'preview' ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Eye className="h-3 w-3 text-sky-400" />
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadRowPdf(inq)}
                                disabled={activeActionId === inq.id}
                                title={`Download ${inq.status === 'QUOTED' ? 'Quotation' : 'Tax Invoice'} PDF`}
                                aria-label={`Download ${inq.status === 'QUOTED' ? 'Quotation' : 'Tax Invoice'} PDF`}
                                className="h-7 w-7 p-0 border-slate-700 bg-slate-950 text-slate-300 hover:text-white hover:border-emerald-500 shrink-0 shadow-sm flex items-center justify-center"
                              >
                                {activeActionId === inq.id && actionType === 'download' ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Download className="h-3 w-3 text-emerald-400" />
                                )}
                              </Button>
                            </>
                          )}

                          {/* Edit Quotation / Details */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditModal(inq)}
                            title="Edit Quotation / Scope"
                            aria-label="Edit Quotation / Scope"
                            className="h-7 w-7 p-0 border-slate-700 bg-slate-950 text-slate-300 hover:text-amber-300 hover:border-amber-500 shrink-0 shadow-sm flex items-center justify-center"
                          >
                            <Pencil className="h-3 w-3 text-amber-400" />
                          </Button>

                          {/* Delete Quotation / Inquiry */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteInquiry(inq)}
                            disabled={isDeletingId === inq.id}
                            title="Delete Quotation"
                            aria-label="Delete Quotation"
                            className="h-7 w-7 p-0 border-slate-700 bg-slate-950 text-slate-300 hover:text-rose-300 hover:border-rose-500 shrink-0 shadow-sm flex items-center justify-center"
                          >
                            {isDeletingId === inq.id ? (
                              <Loader2 className="h-3 w-3 animate-spin text-rose-400" />
                            ) : (
                              <Trash2 className="h-3 w-3 text-rose-400" />
                            )}
                          </Button>

                          <Link href={`/admin/inquiries/${inq.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 border-slate-700 bg-slate-950 text-slate-200 hover:border-sky-500 hover:text-white text-[11px] font-semibold shrink-0"
                            >
                              <span>Manage</span>
                            </Button>
                          </Link>
                        </div>
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
      {/* Create / Edit Custom Quote Modal */}
      {/* ───────────────────────────────────────────────────────── */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header - Sticky at Top */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-800 px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                  {editingQuoteId ? <Pencil className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                    {editingQuoteId ? `Edit Security Quotation (${editingQuoteRef || ''})` : 'Create Custom Security Quotation'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    {editingQuoteId
                      ? 'Modify client information, scope items, pricing and terms.'
                      : 'Generate an official proposal in Kenyan Shillings (KES) with PDF & Email options.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form with Scrollable Body */}
            <form onSubmit={handleCreateCustomQuote} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-4 overscroll-contain">
                {modalError && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Client Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                <div className="space-y-2.5 pt-1">
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

                  <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 shadow-inner">
                    <div className="min-w-[540px] divide-y divide-slate-800">
                      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] text-slate-400 uppercase font-semibold bg-slate-950/80">
                        <div className="col-span-6">Description</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-3 text-right">Price (KES)</div>
                        <div className="col-span-1"></div>
                      </div>

                      {quoteItems.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 p-2 items-center hover:bg-slate-900/40">
                          <div className="col-span-6">
                            <input
                              required
                              value={item.description}
                              onChange={(e) => updateQuoteItem(idx, 'description', e.target.value)}
                              placeholder="Equipment or service name..."
                              className="w-full h-8 rounded border border-slate-800 bg-slate-900 px-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) => updateQuoteItem(idx, 'qty', Number(e.target.value))}
                              className="w-full h-8 rounded border border-slate-800 bg-slate-900 px-2 text-xs text-white text-center focus:outline-none focus:border-sky-500"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              min={0}
                              step={100}
                              value={item.unitPrice}
                              onChange={(e) => updateQuoteItem(idx, 'unitPrice', Number(e.target.value))}
                              className="w-full h-8 rounded border border-slate-800 bg-slate-900 px-2 text-xs text-white text-right font-mono focus:outline-none focus:border-sky-500"
                            />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() => removeQuoteItem(idx)}
                              disabled={quoteItems.length === 1}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 disabled:opacity-30 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals Preview */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="text-slate-400">
                      Subtotal: <span className="text-slate-200 font-mono">Ksh {quoteSubtotal.toLocaleString()}</span> · VAT (16%): <span className="text-slate-200 font-mono">Ksh {quoteVat.toLocaleString()}</span>
                    </div>
                    <div className="font-extrabold text-sm text-sky-400 font-mono">
                      Total: Ksh {quoteGrandTotal.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Notes & Terms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
              </div>

              {/* Actions - Sticky at Bottom */}
              <div className="shrink-0 flex items-center justify-end gap-3 px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-800 bg-slate-900 z-10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowQuoteModal(false)}
                  className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
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
                      <span>{editingQuoteId ? 'Saving Changes...' : 'Creating Official Quotation...'}</span>
                    </>
                  ) : (
                    <>
                      {editingQuoteId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      <span>{editingQuoteId ? 'Save Quotation Changes' : 'Create Official Quotation'}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
