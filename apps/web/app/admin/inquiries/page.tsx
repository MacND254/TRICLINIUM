'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Search,
  Download,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Inquiries & Quotations (RFQ)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track customer specification queries, manage RFQ proposals, and update statuses.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCsv}
          className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs flex items-center gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export All to CSV</span>
        </Button>
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
            <option value="AWAITING_CUSTOMER">Awaiting Customer</option>
            <option value="QUOTED">Quoted</option>
            <option value="CONVERTED">Converted</option>
            <option value="CLOSED">Closed</option>
            <option value="SPAM">Spam</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No inquiries match the active filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Customer & Company</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Target / Line Items</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Received</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-sky-400">
                      {inq.referenceNumber}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{inq.customerName}</div>
                      <div className="text-[11px] text-slate-400">{inq.company || inq.email}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px] uppercase font-bold">
                        {inq.type}
                      </Badge>
                    </td>
                    <td className="p-4 max-w-[200px] truncate">
                      {inq.type === 'QUOTATION'
                        ? `${inq.items?.length || 1} line item(s)`
                        : inq.product?.name || inq.service?.name || inq.subject}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          inq.urgency === 'URGENT' || inq.urgency === 'HIGH'
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {inq.urgency}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          inq.status === 'NEW'
                            ? 'warning'
                            : inq.status === 'QUOTED' || inq.status === 'CONVERTED'
                            ? 'success'
                            : 'outline'
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {inq.status}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {formatDate(inq.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/inquiries/${inq.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700 text-sky-400 hover:text-white">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>Inspect</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
