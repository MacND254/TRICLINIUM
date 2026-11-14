'use client';

import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { fetchApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';

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

  const loadInquiry = async () => {
    try {
      const data = await fetchApi(`/admin/inquiries/${id}`);
      setInquiry(data);
      setStatus(data.status);
      setUrgency(data.urgency);
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
    </div>
  );
}
