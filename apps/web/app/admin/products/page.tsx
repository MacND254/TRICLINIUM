'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Archive, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/api-client';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (statusFilter) query.set('status', statusFilter);

      const res = await fetchApi(`/admin/products?${query.toString()}`);
      setProducts(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [statusFilter]);

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive "${name}"?`)) return;
    try {
      await fetchApi(`/admin/products/${id}`, { method: 'DELETE' });
      await loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to archive product');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Products Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">Manage physical & digital assemblies, pricing, and stock.</p>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white text-xs flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Create New Product</span>
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadProducts();
          }}
          className="relative w-full sm:w-80"
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="bg-slate-950 border-slate-800 text-white text-xs pr-8 h-9"
          />
          <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No products match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        {p.images?.[0]?.url && (
                          <img
                            src={p.images[0].url}
                            alt=""
                            className="h-9 w-9 rounded object-cover border border-slate-800 shrink-0"
                          />
                        )}
                        <span className="truncate max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{p.sku}</td>
                    <td className="p-4">{p.category?.name || '-'}</td>
                    <td className="p-4 font-mono">
                      {p.price ? formatPrice(p.price, p.currency) : 'RFQ Quote'}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold border-slate-700 text-slate-300">
                        {p.availability}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={p.status === 'PUBLISHED' ? 'success' : p.status === 'DRAFT' ? 'warning' : 'outline'}
                        className="text-[10px] uppercase font-bold"
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/products/${p.slug}`} target="_blank" title="View Public Page">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-white">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/admin/products/${p.id}`} title="Edit Specifications">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-sky-400 hover:text-white">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        {p.status !== 'ARCHIVED' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleArchive(p.id, p.name)}
                            className="h-7 w-7 text-rose-400 hover:text-rose-300"
                            title="Archive Product"
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
