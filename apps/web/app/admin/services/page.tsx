'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Archive, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/api-client';

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi(`/admin/services${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setServices(res.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive "${name}"?`)) return;
    try {
      await fetchApi(`/admin/services/${id}`, { method: 'DELETE' });
      await loadServices();
    } catch (err: any) {
      alert(err.message || 'Failed to archive service');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Engineering Services</h1>
          <p className="text-xs text-slate-400 mt-1">Manage fabrication disciplines, FEA consulting, and workflow steps.</p>
        </div>
        <Link href="/admin/services/new">
          <Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white text-xs flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Create New Service</span>
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadServices();
          }}
          className="relative w-full sm:w-80"
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search engineering services..."
            className="bg-slate-950 border-slate-800 text-white text-xs pr-8 h-9"
          />
          <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : services.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No services found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Service</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Pricing Model</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        {s.featuredImage && (
                          <img
                            src={s.featuredImage}
                            alt=""
                            className="h-9 w-9 rounded object-cover border border-slate-800 shrink-0"
                          />
                        )}
                        <span className="truncate max-w-[240px]">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-4">{s.category?.name || '-'}</td>
                    <td className="p-4 font-mono">{s.pricingModel}</td>
                    <td className="p-4">
                      <Badge
                        variant={s.status === 'PUBLISHED' ? 'success' : s.status === 'DRAFT' ? 'warning' : 'outline'}
                        className="text-[10px] uppercase font-bold"
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/services/${s.slug}`} target="_blank" title="View Public Page">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-white">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/admin/services/${s.id}`} title="Edit Service">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-sky-400 hover:text-white">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        {s.status !== 'ARCHIVED' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleArchive(s.id, s.name)}
                            className="h-7 w-7 text-rose-400 hover:text-rose-300"
                            title="Archive"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
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
