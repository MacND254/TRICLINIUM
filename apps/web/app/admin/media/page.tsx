'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  UploadCloud,
  Search,
  Copy,
  Check,
  Trash2,
  Image as ImageIcon,
  HardDrive,
  Loader2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchApi, uploadAdminMedia } from '@/lib/api-client';

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [storageUsage, setStorageUsage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi(`/admin/media${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setAssets(res.items || []);
      setStorageUsage(res.storageUsage || null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadAdminMedia(file);
      await loadMedia();
      showToast(`"${file.name}" uploaded successfully to media storage!`);
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Media URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete asset "${name}"?`)) return;
    try {
      await fetchApi(`/admin/media/${id}`, { method: 'DELETE' });
      await loadMedia();
      showToast(`Asset "${name}" deleted successfully.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete asset', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-xl text-white text-sm font-medium transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.message}
          <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 ml-2">
            &times;
          </button>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Media & Asset Library</h1>
          <p className="text-xs text-slate-400 mt-1">
            Persistent cloud storage for product photography, CAD renders, and technical diagrams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf"
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs flex items-center gap-1.5"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                <span>Upload Asset</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Storage usage badge & search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadMedia();
          }}
          className="relative w-full sm:w-80"
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filename or asset..."
            className="bg-slate-950 border-slate-800 text-white text-xs pr-8 h-9"
          />
          <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </button>
        </form>

        {storageUsage && (
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-sky-400" />
              <span>Total Volume: <strong className="text-white">{storageUsage.totalFormatted}</strong></span>
            </span>
            <span>Total Objects: <strong className="text-white">{storageUsage.totalFiles}</strong></span>
          </div>
        )}
      </div>

      {/* Grid of assets */}
      {isLoading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : assets.length === 0 ? (
        <div className="py-20 text-center border border-slate-800 rounded-xl bg-slate-900 text-slate-400 space-y-3">
          <ImageIcon className="h-12 w-12 mx-auto text-slate-600" />
          <p className="text-xs">No media files found. Upload a JPEG, PNG, or WEBP image to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="aspect-square bg-slate-950 overflow-hidden relative flex items-center justify-center">
                {asset.mimeType?.startsWith('image') ? (
                  <img src={asset.url} alt={asset.originalName} className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-10 w-10 text-slate-600" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopyUrl(asset.id, asset.url)}
                    className="h-8 w-8 text-white hover:bg-white/20"
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(asset.id, asset.originalName)}
                    className="h-8 w-8 text-rose-400 hover:bg-rose-950"
                    title="Delete Asset"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-2.5 space-y-1">
                <p className="text-[11px] font-semibold text-white truncate" title={asset.originalName}>
                  {asset.originalName}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{(asset.size / 1024).toFixed(0)} KB</span>
                  <span className="uppercase">{asset.provider}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
