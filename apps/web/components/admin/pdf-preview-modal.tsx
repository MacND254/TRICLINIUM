'use client';

import React from 'react';
import { X, ExternalLink, Download, Loader2, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  blobUrl: string | null;
  fileName: string;
  isLoading?: boolean;
  docType?: 'QUOTATION' | 'INVOICE' | 'SURVEY' | string;
}

export function PdfPreviewModal({
  isOpen,
  onClose,
  title,
  blobUrl,
  fileName,
  isLoading = false,
  docType = 'QUOTATION',
}: PdfPreviewModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isQuote = docType === 'QUOTATION';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-900 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-sm ${
                docType === 'SURVEY'
                  ? 'bg-blue-600'
                  : isQuote
                  ? 'bg-sky-600'
                  : 'bg-emerald-600'
              }`}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white truncate leading-tight">
                  {title}
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase font-bold shrink-0 px-2 py-0.5 ${
                    docType === 'SURVEY'
                      ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                      : isQuote
                      ? 'bg-sky-950/80 text-sky-300 border-sky-700'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  }`}
                >
                  {docType === 'SURVEY' ? 'Building Survey Report' : isQuote ? 'Official Quotation' : 'Tax Invoice'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Interactive preview with zoom, paging, download and printing controls.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {blobUrl && (
              <>
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex"
                >
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-slate-700 bg-slate-950 text-slate-200 hover:text-white text-xs gap-1.5 h-8"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open in New Tab</span>
                  </Button>
                </a>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleDownload}
                  className={`text-white text-xs gap-1.5 h-8 font-semibold shadow-sm ${
                    isQuote
                      ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-900/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                  }`}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">Download</span>
                </Button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close preview modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / PDF Viewer Frame */}
        <div className="flex-1 w-full relative bg-slate-950 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
              <p className="text-sm font-semibold text-white">Generating official PDF document...</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Formatting corporate typography, line item breakdown, 16% VAT schedule and TRICLINIUM credentials.
              </p>
            </div>
          ) : blobUrl ? (
            <iframe
              src={blobUrl}
              title={title}
              className="w-full flex-1 border-0 bg-slate-900"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <p className="text-sm">No PDF data available for preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
