'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Save,
  Eye,
  Download,
  Loader2,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Copy,
  Info,
  Layers,
  Ruler,
  Compass,
  Smartphone,
  Table2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { fetchApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { PdfPreviewModal } from '@/components/admin/pdf-preview-modal';
import { BuildingSurveyReportPDF } from '@/components/admin/lift-survey-pdf';
import { usePublicSettings } from '@/lib/settings-context';

export default function AdminLiftSurveyDetailPage() {
  const { settings } = usePublicSettings();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [survey, setSurvey] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Active Lift Section Tab (for multi-lift buildings)
  const [activeLiftIdx, setActiveLiftIdx] = useState(0);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [surveyDate, setSurveyDate] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [numberOfLifts, setNumberOfLifts] = useState(1);
  const [numberOfStops, setNumberOfStops] = useState(6);
  const [floorNames, setFloorNames] = useState<string[]>([]);
  const [liftsData, setLiftsData] = useState<any[]>([]);
  const [observations, setObservations] = useState<string[]>(Array(12).fill(''));
  const [surveyorName, setSurveyorName] = useState('');
  const [surveyorSignDate, setSurveyorSignDate] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [directorSignDate, setDirectorSignDate] = useState('');

  // PDF Preview State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState('');
  const [previewPdfFilename, setPreviewPdfFilename] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Mobile Workspace View State (Floor-by-Floor Cards vs Full Grid Table)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedMobileFloorIdx, setSelectedMobileFloorIdx] = useState<number>(-1); // -1 = Required Blueprint, 0..N = Floor stops
  const [showSketchesMobile, setShowSketchesMobile] = useState<boolean>(false);

  useEffect(() => {
    // Default to grid table on large desktop screens, and touch-optimized floor card view on mobile phones
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setViewMode('table');
    }
  }, []);

  const loadSurvey = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi(`/admin/lift-surveys/${id}`);
      const data = res?.data ?? res;
      if (data && (data.id || data.surveyNumber)) {
        setSurvey(data);
        setProjectName(data.projectName || '');
        setClientName(data.clientName || '');
        setSiteLocation(data.siteLocation || '');
        setSurveyDate(data.date || new Date().toISOString().split('T')[0]);
        setStatus(data.status || 'DRAFT');
        setNumberOfLifts(data.numberOfLifts || 1);
        setNumberOfStops(data.numberOfStops || 6);

        const fNames = Array.isArray(data.floorNames) && data.floorNames.length > 0
          ? data.floorNames
          : ['B', 'G', '1', '2', '3', '4'];
        setFloorNames(fNames);

        let initialLifts = Array.isArray(data.liftsData) && data.liftsData.length > 0
          ? data.liftsData
          : [];

        if (initialLifts.length === 0) {
          // Initialize every new lift survey with completely blank measurements
          initialLifts = Array.from({ length: data.numberOfLifts || 1 }).map((_, idx) => ({
            liftNumber: idx + 1,
            liftName: (data.numberOfLifts || 1) > 1 ? `Lift ${idx + 1} (L${idx + 1} ELE.)` : 'Lift 1 (L1 ELE.)',
            pitDepth: '',
            overheadHeight: '',
            requiredDimensions: { a: '', b: '', c: '', d: '', e: '', f: '', g: '', h: '', i: '' },
            floors: fNames.map((fn: string) => ({
              floorName: fn,
              a: '',
              b: '',
              c: '',
              d: '',
              e: '',
              f: '',
              g: '',
              h: '',
              i: '',
              height: '',
            })),
          }));
        } else {
          initialLifts = initialLifts.map((l: any, idx: number) => {
            let fls = l.floors || [];
            if (fls.length === 0) {
              fls = fNames.map((fn: string) => ({
                floorName: fn,
                a: '', b: '', c: '', d: '', e: '',
                f: '', g: '', h: '', i: '', height: '',
              }));
            }
            return {
              ...l,
              liftNumber: l.liftNumber || idx + 1,
              liftName: l.liftName || `Lift ${idx + 1}`,
              floors: fls,
            };
          });
        }

        setLiftsData(initialLifts);

        const obsArr = Array(12).fill('');
        if (Array.isArray(data.observations)) {
          data.observations.forEach((item: string, idx: number) => {
            if (idx < 12) obsArr[idx] = item || '';
          });
        }
        setObservations(obsArr);

        setSurveyorName(data.surveyorName || '');
        setSurveyorSignDate(data.surveyorSignDate || data.date);
        setDirectorName(data.directorName || '');
        setDirectorSignDate(data.directorSignDate || data.date);
      }
    } catch (err: any) {
      console.error('Failed to load survey:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadSurvey();
  }, [id]);

  // Handle Updates to Lifts Data
  const currentLift = liftsData[activeLiftIdx] || {
    liftNumber: activeLiftIdx + 1,
    liftName: `Lift ${activeLiftIdx + 1}`,
    pitDepth: 'not accessible',
    overheadHeight: '4634',
    requiredDimensions: { a: '', b: '', c: '2004', d: '2000', e: '', f: '963', g: '2207', h: '', i: '' },
    floors: [],
  };

  const updateLiftField = (field: string, value: any) => {
    setLiftsData((prev) => {
      const updated = [...prev];
      if (!updated[activeLiftIdx]) {
        updated[activeLiftIdx] = { ...currentLift };
      }
      updated[activeLiftIdx] = {
        ...updated[activeLiftIdx],
        [field]: value,
      };
      return updated;
    });
  };

  const updateRequiredDim = (field: string, value: string) => {
    setLiftsData((prev) => {
      const updated = [...prev];
      if (!updated[activeLiftIdx]) updated[activeLiftIdx] = { ...currentLift };
      const req = { ...(updated[activeLiftIdx].requiredDimensions || {}) };
      req[field] = value;
      updated[activeLiftIdx].requiredDimensions = req;
      return updated;
    });
  };

  const updateFloorMeasurement = (floorIdx: number, field: string, value: string) => {
    setLiftsData((prev) => {
      const updated = [...prev];
      if (!updated[activeLiftIdx]) updated[activeLiftIdx] = { ...currentLift };
      const fls = [...(updated[activeLiftIdx].floors || [])];
      if (fls[floorIdx]) {
        fls[floorIdx] = { ...fls[floorIdx], [field]: value };
      }
      updated[activeLiftIdx].floors = fls;
      return updated;
    });
  };

  const updateObservation = (idx: number, text: string) => {
    setObservations((prev) => {
      const updated = [...prev];
      updated[idx] = text;
      return updated;
    });
  };

  const copyLift1MeasurementsToCurrent = () => {
    if (activeLiftIdx === 0 || !liftsData[0]) return;
    if (!window.confirm('Copy all shaft dimensions and floor measurements from Lift 1 to this lift?')) return;
    setLiftsData((prev) => {
      const updated = [...prev];
      const source = prev[0];
      updated[activeLiftIdx] = {
        ...updated[activeLiftIdx],
        pitDepth: source.pitDepth,
        overheadHeight: source.overheadHeight,
        requiredDimensions: { ...source.requiredDimensions },
        floors: source.floors.map((fl: any) => ({ ...fl })),
      };
      return updated;
    });
  };

  const copyPreviousFloorToCurrent = (targetIdx: number) => {
    if (targetIdx <= 0) return;
    const prev = currentLift.floors?.[targetIdx - 1];
    if (!prev) return;
    setLiftsData((prevLifts: any[]) => {
      const copy = [...prevLifts];
      const lift = { ...copy[activeLiftIdx] };
      const fls = [...(lift.floors || [])];
      fls[targetIdx] = {
        ...fls[targetIdx],
        a: prev.a || '',
        b: prev.b || '',
        c: prev.c || '',
        d: prev.d || '',
        e: prev.e || '',
        f: prev.f || '',
        g: prev.g || '',
        h: prev.h || '',
        i: prev.i || '',
        height: prev.height || '',
      };
      lift.floors = fls;
      copy[activeLiftIdx] = lift;
      return copy;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await fetchApi(`/admin/lift-surveys/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          projectName: projectName.trim(),
          clientName: clientName.trim() || null,
          siteLocation: siteLocation.trim() || null,
          date: surveyDate,
          status,
          numberOfLifts,
          numberOfStops: floorNames.length,
          floorNames,
          liftsData,
          observations,
          surveyorName: surveyorName.trim(),
          surveyorSignDate,
          directorName: directorName.trim(),
          directorSignDate,
        }),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      await loadSurvey();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save survey report');
    } finally {
      setIsSaving(false);
    }
  };

  const buildReportPayload = () => ({
    surveyNumber: survey?.surveyNumber || 'BSR-2026',
    projectName,
    clientName,
    siteLocation,
    date: surveyDate,
    numberOfLifts,
    numberOfStops: floorNames.length,
    floorNames,
    status,
    lifts: liftsData,
    observations,
    surveyorName,
    surveyorSignDate,
    directorName,
    directorSignDate,
  });

  const handlePreviewPdf = async () => {
    setIsPreviewLoading(true);
    const reportData = buildReportPayload();
    setPreviewPdfTitle(`Building Survey Report: ${projectName} (${survey?.surveyNumber})`);
    setPreviewPdfFilename(`${survey?.surveyNumber || 'BSR'}-${projectName.replace(/\s+/g, '_')}.pdf`);
    setPreviewModalOpen(true);

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(<BuildingSurveyReportPDF report={reportData} companyDetails={settings} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPreviewPdfUrl(url);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF for preview');
      setPreviewModalOpen(false);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const reportData = buildReportPayload();
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(<BuildingSurveyReportPDF report={reportData} companyDetails={settings} />).toBlob();
      const url = URL.createObjectURL(blob);
      const filename = `${survey?.surveyNumber || 'BSR'}-${projectName.replace(/\s+/g, '_')}.pdf`;

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

  if (!survey) {
    return (
      <div className="text-white text-center py-20">
        <p className="text-base font-semibold">Lift Survey Report not found.</p>
        <Link href="/admin/lift-surveys" className="text-sky-400 text-xs hover:underline mt-2 inline-block">
          &larr; Back to Lift Surveys
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-32 md:pb-24">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/admin/lift-surveys">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 border-slate-700 bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white text-xs shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              <span>Back</span>
            </Button>
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white font-mono">
                {survey.surveyNumber}
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-bold border-sky-800/80 bg-sky-950/40 text-sky-400 px-1.5 py-0.5"
              >
                Building Survey Report
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-bold border-amber-800/80 bg-amber-950/40 text-amber-400 px-1.5 py-0.5"
              >
                {numberOfLifts === 1 ? 'Single Lift' : `${numberOfLifts} Lifts`} · {floorNames.length} Stops
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Project: <span className="font-semibold text-slate-200">{projectName}</span> · Date: {surveyDate}
            </p>
          </div>
        </div>

        {/* Save & PDF Actions */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs hidden sm:inline">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="APPROVED">APPROVED</option>
            </select>
          </div>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/30"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Survey</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handlePreviewPdf}
            disabled={isPreviewLoading}
            className="h-8 border-slate-700 bg-slate-950 text-slate-200 hover:text-white hover:border-sky-500 text-xs flex items-center gap-1.5"
          >
            {isPreviewLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5 text-sky-400" />}
            <span>Preview PDF</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="h-8 border-slate-700 bg-slate-950 text-slate-200 hover:text-white hover:border-emerald-500 text-xs flex items-center gap-1.5"
          >
            {isDownloadingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 text-emerald-400" />}
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>Building Survey Report saved successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-400" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Project & Site Details Card */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="text-slate-400 font-semibold block mb-1">Project Name</label>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="h-8 bg-slate-950 border-slate-800 text-white text-xs uppercase"
          />
        </div>
        <div>
          <label className="text-slate-400 font-semibold block mb-1">Client / Building</label>
          <Input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Coast Cables Ltd"
            className="h-8 bg-slate-950 border-slate-800 text-white text-xs"
          />
        </div>
        <div>
          <label className="text-slate-400 font-semibold block mb-1">Site Location</label>
          <Input
            value={siteLocation}
            onChange={(e) => setSiteLocation(e.target.value)}
            placeholder="e.g. Mombasa Port Industrial Hub"
            className="h-8 bg-slate-950 border-slate-800 text-white text-xs"
          />
        </div>
        <div>
          <label className="text-slate-400 font-semibold block mb-1">Survey Date</label>
          <Input
            type="date"
            value={surveyDate}
            onChange={(e) => setSurveyDate(e.target.value)}
            className="h-8 bg-slate-950 border-slate-800 text-white text-xs"
          />
        </div>
      </div>

      {/* Visual Technical Diagram Reference Card (Collapsible on mobile screens to save screen real estate) */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Technical Dimension Reference Diagrams
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">All dimensions in millimeters (MM)</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSketchesMobile(!showSketchesMobile)}
              className="md:hidden h-7 px-2 text-[11px] text-sky-400 hover:text-white"
            >
              {showSketchesMobile ? 'Hide Sketches' : 'View Sketches'}
              {showSketchesMobile ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
            </Button>
          </div>
        </div>

        <div className={`grid-cols-1 md:grid-cols-3 gap-4 text-xs ${showSketchesMobile ? 'grid' : 'hidden md:grid'}`}>
          {/* Sketch 1: Shaft Plan */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mb-2">
              1. Shaft Plan Dimensions
            </span>
            <div className="w-full flex justify-center py-1">
              <img
                src="/images/shaft-plan-diagram-cropped.png"
                alt="Shaft Plan Dimensions"
                className="max-h-[135px] w-auto object-contain rounded bg-white p-1 shadow-sm"
              />
            </div>
            <div className="w-full text-[10px] text-slate-400 space-y-0.5 mt-2 border-t border-slate-900 pt-1.5">
              <p><strong className="text-sky-400">A / B:</strong> Front Left / Right Return Walls</p>
              <p><strong className="text-sky-400">C:</strong> Shaft Depth (Exclusive of Walls)</p>
              <p><strong className="text-sky-400">D:</strong> Shaft Width (Exclusive of Walls)</p>
              <p><strong className="text-sky-400">E:</strong> Door Opening Width</p>
            </div>
          </div>

          {/* Sketch 2: Entrance View */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mb-2">
              2. Entrance View Dimensions
            </span>
            <div className="w-full flex justify-center py-1">
              <svg width="130" height="110" viewBox="0 0 140 125" className="overflow-visible">
                <line x1="25" y1="14" x2="125" y2="14" stroke="#38bdf8" strokeWidth="1" />
                <text x="75" y="10" fontSize="10" fontWeight="bold" fill="#38bdf8" textAnchor="middle">F</text>

                <line x1="14" y1="22" x2="14" y2="118" stroke="#38bdf8" strokeWidth="1" />
                <text x="5" y="70" fontSize="10" fontWeight="bold" fill="#38bdf8">G</text>

                <rect x="25" y="22" width="100" height="96" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />
                <line x1="75" y1="22" x2="75" y2="118" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
              </svg>
            </div>
            <div className="w-full text-[10px] text-slate-400 space-y-0.5 mt-2 border-t border-slate-900 pt-1.5">
              <p><strong className="text-sky-400">F:</strong> Landing Entrance Clear Width</p>
              <p><strong className="text-sky-400">G:</strong> Landing Entrance Clear Height</p>
            </div>
          </div>

          {/* Sketch 3: Hall Button Cut Out */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mb-2">
              3. Hall Button Station Cutout
            </span>
            <div className="w-full flex justify-center py-1">
              <svg width="90" height="110" viewBox="0 0 90 125" className="overflow-visible">
                <line x1="20" y1="20" x2="60" y2="20" stroke="#38bdf8" strokeWidth="1" />
                <text x="40" y="14" fontSize="10" fontWeight="bold" fill="#38bdf8" textAnchor="middle">H</text>

                <rect x="20" y="26" width="40" height="76" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />

                <line x1="70" y1="26" x2="70" y2="102" stroke="#38bdf8" strokeWidth="1" />
                <text x="76" y="67" fontSize="10" fontWeight="bold" fill="#38bdf8">I</text>
              </svg>
            </div>
            <div className="w-full text-[10px] text-slate-400 space-y-0.5 mt-2 border-t border-slate-900 pt-1.5">
              <p><strong className="text-sky-400">H:</strong> Call Station Wall Cutout Width</p>
              <p><strong className="text-sky-400">I:</strong> Call Station Wall Cutout Height</p>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Lift Selector Tabs (if more than 1 lift) */}
      {numberOfLifts > 1 && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            {Array.from({ length: numberOfLifts }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveLiftIdx(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeLiftIdx === idx
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Lift {idx + 1} (L{idx + 1} ELE.)</span>
              </button>
            ))}
          </div>

          {activeLiftIdx > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={copyLift1MeasurementsToCurrent}
              className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs flex items-center gap-1.5"
            >
              <Copy className="h-3.5 w-3.5 text-amber-400" />
              <span>Copy from Lift 1</span>
            </Button>
          )}
        </div>
      )}

      {/* Pit Depth & Overhead Height Controls */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Ruler className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {currentLift.liftName || `Lift ${activeLiftIdx + 1}`} Vertical Parameters
            </h4>
            <p className="text-[11px] text-slate-400">
              Pit depth accessibility and clear overhead machine room height.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300 font-semibold whitespace-nowrap">Pit Depth (MM):</label>
            <Input
              value={currentLift.pitDepth || ''}
              onChange={(e) => updateLiftField('pitDepth', e.target.value)}
              placeholder="e.g. not accessible or 1500"
              className="h-8 w-36 bg-slate-950 border-slate-800 text-xs text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300 font-semibold whitespace-nowrap">Overhead Height (MM):</label>
            <Input
              value={currentLift.overheadHeight || ''}
              onChange={(e) => updateLiftField('overheadHeight', e.target.value)}
              placeholder="e.g. 4634"
              className="h-8 w-28 bg-slate-950 border-slate-800 text-xs text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* View Mode Toggle: Floor-by-Floor (Mobile Optimized) vs Full Grid Table */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === 'cards'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Floor-by-Floor (Mobile View)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === 'table'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table2 className="h-3.5 w-3.5" />
            <span>Full Grid Table</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          {viewMode === 'cards'
            ? 'Optimized for fast one-thumb keying with phone numeric keypad'
            : 'Multi-column overview with sticky floor headers'}
        </span>
      </div>

      {/* MODE 1: Mobile Floor-by-Floor Touch Cards Workspace */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {/* Scrollable Floor Selector Tabs */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-0.5">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-sky-400" />
                <span>Select Stop to Key In Measurements:</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedMobileFloorIdx === -1
                  ? 'Blueprint Target'
                  : `Stop ${selectedMobileFloorIdx + 1} of ${floorNames.length}`}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedMobileFloorIdx(-1)}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedMobileFloorIdx === -1
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50'
                    : 'bg-slate-950 text-rose-300 border border-rose-900/40 hover:bg-slate-800'
                }`}
              >
                <span>📐 Required Dim</span>
              </button>

              {floorNames.map((fn: string, fIdx: number) => {
                const fl = currentLift.floors?.[fIdx] || {};
                const filledCount = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'height'].filter((k) =>
                  Boolean(fl[k])
                ).length;
                const isComplete = filledCount >= 10;
                const isSelected = selectedMobileFloorIdx === fIdx;

                return (
                  <button
                    key={fIdx}
                    type="button"
                    onClick={() => setSelectedMobileFloorIdx(fIdx)}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-2 ring-sky-400/50'
                        : isComplete
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/40'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span>Stop {fn}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected
                          ? 'bg-sky-800 text-white'
                          : isComplete
                          ? 'bg-emerald-900 text-emerald-200'
                          : filledCount > 0
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {filledCount}/10
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Body: Either Required Blueprint or Current Floor Stop */}
          {selectedMobileFloorIdx === -1 ? (
            /* Required Blueprint Card */
            <div className="p-4 sm:p-5 rounded-xl border border-rose-900/60 bg-gradient-to-b from-rose-950/20 to-slate-900 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-rose-900/40 pb-3 flex-wrap gap-2">
                <div>
                  <Badge variant="outline" className="border-rose-700 bg-rose-950/60 text-rose-300 uppercase text-[10px] font-bold">
                    Design Target Specification
                  </Badge>
                  <h3 className="text-base font-bold text-white mt-1">Required Architectural Dimensions</h3>
                  <p className="text-xs text-slate-400">Baseline values from layout drawings to compare against actual shaft</p>
                </div>
              </div>

              {/* Sub-section 1: Shaft Plan Walls */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  1. Shaft Plan Dimensions (mm)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 block">
                      <strong className="text-sky-400 font-mono text-sm">A</strong> · Left Return
                    </label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.a || ''}
                      onChange={(e) => updateRequiredDim('a', e.target.value)}
                      placeholder="mm"
                      className="h-11 bg-slate-950 border-slate-800 text-rose-300 font-mono text-base focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 block">
                      <strong className="text-sky-400 font-mono text-sm">B</strong> · Right Return
                    </label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.b || ''}
                      onChange={(e) => updateRequiredDim('b', e.target.value)}
                      placeholder="mm"
                      className="h-11 bg-slate-950 border-slate-800 text-rose-300 font-mono text-base focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 block">
                      <strong className="text-sky-400 font-mono text-sm">C</strong> · Shaft Depth
                    </label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.c || ''}
                      onChange={(e) => updateRequiredDim('c', e.target.value)}
                      placeholder="mm"
                      className="h-11 bg-slate-950 border-slate-800 text-rose-300 font-mono text-base focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 block">
                      <strong className="text-sky-400 font-mono text-sm">D</strong> · Shaft Width
                    </label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.d || ''}
                      onChange={(e) => updateRequiredDim('d', e.target.value)}
                      placeholder="mm"
                      className="h-11 bg-slate-950 border-slate-800 text-rose-300 font-mono text-base focus:border-rose-500"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-1">
                    <label className="text-xs text-slate-300 block">
                      <strong className="text-sky-400 font-mono text-sm">E</strong> · Front Opening
                    </label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.e || ''}
                      onChange={(e) => updateRequiredDim('e', e.target.value)}
                      placeholder="mm"
                      className="h-11 bg-slate-950 border-slate-800 text-rose-300 font-mono text-base focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sub-section 2: Entrance & Hall Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                    2. Entrance View (mm)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 block">
                        <strong className="text-blue-400 font-mono text-sm">F</strong> · Door Width
                      </label>
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={currentLift.requiredDimensions?.f || ''}
                        onChange={(e) => updateRequiredDim('f', e.target.value)}
                        placeholder="mm"
                        className="h-11 bg-slate-950 border-slate-800 text-rose-300 font-mono text-base focus:border-rose-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 block">
                        <strong className="text-blue-400 font-mono text-sm">G</strong> · Door Height
                      </label>
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={currentLift.requiredDimensions?.g || ''}
                        onChange={(e) => updateRequiredDim('g', e.target.value)}
                        placeholder="mm"
                        className="h-11 bg-slate-950 border-slate-800 text-rose-300 font-mono text-base focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                    3. Hall Button Station (mm)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 block">
                        <strong className="text-purple-400 font-mono text-sm">H</strong> · Cutout Width
                      </label>
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={currentLift.requiredDimensions?.h || ''}
                        onChange={(e) => updateRequiredDim('h', e.target.value)}
                        placeholder="mm"
                        className="h-11 bg-slate-950 border-slate-800 text-rose-300 font-mono text-base focus:border-rose-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 block">
                        <strong className="text-purple-400 font-mono text-sm">I</strong> · Cutout Height
                      </label>
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={currentLift.requiredDimensions?.i || ''}
                        onChange={(e) => updateRequiredDim('i', e.target.value)}
                        placeholder="mm"
                        className="h-11 bg-slate-950 border-slate-800 text-rose-300 font-mono text-base focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Button */}
              <div className="pt-3 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setSelectedMobileFloorIdx(0)}
                  className="h-11 px-5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <span>Start Floor Stops (Stop {floorNames[0]})</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* Selected Floor Stop Card */
            <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-xl bg-sky-600 text-white font-mono font-extrabold flex items-center justify-center text-base shadow-md shadow-sky-600/30">
                    {floorNames[selectedMobileFloorIdx]}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Stop {floorNames[selectedMobileFloorIdx]} Measurements
                    </h3>
                    <p className="text-xs text-slate-400">
                      Floor {selectedMobileFloorIdx + 1} of {floorNames.length} · {currentLift.liftName || `Lift ${activeLiftIdx + 1}`}
                    </p>
                  </div>
                </div>

                {selectedMobileFloorIdx > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyPreviousFloorToCurrent(selectedMobileFloorIdx)}
                    className="h-8 text-xs border-slate-700 bg-slate-950 text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5 text-sky-400" />
                    <span>Copy Stop {floorNames[selectedMobileFloorIdx - 1]}</span>
                  </Button>
                )}
              </div>

              {/* Section 1: Shaft Plan Dimensions A, B, C, D, E */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    1. Shaft Plan Dimensions (mm)
                  </span>
                  <span className="text-[10px] text-slate-400">Inner length exclusive of walls</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 block">
                      <strong className="text-sky-400 font-mono text-sm">A</strong> · Left Return
                    </label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.floors?.[selectedMobileFloorIdx]?.a || ''}
                      onChange={(e) => updateFloorMeasurement(selectedMobileFloorIdx, 'a', e.target.value)}
                      placeholder="mm"
                      className="h-11 bg-slate-950 border-slate-800 text-white font-mono text-base focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 block">
                      <strong className="text-sky-400 font-mono text-sm">B</strong> · Right Return
                    </label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.floors?.[selectedMobileFloorIdx]?.b || ''}
                      onChange={(e) => updateFloorMeasurement(selectedMobileFloorIdx, 'b', e.target.value)}
                      placeholder="mm"
                      className="h-11 bg-slate-950 border-slate-800 text-white font-mono text-base focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 block">
                      <strong className="text-sky-400 font-mono text-sm">C</strong> · Shaft Depth
                    </label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.floors?.[selectedMobileFloorIdx]?.c || ''}
                      onChange={(e) => updateFloorMeasurement(selectedMobileFloorIdx, 'c', e.target.value)}
                      placeholder="mm"
                      className="h-11 bg-slate-950 border-slate-800 text-white font-mono text-base focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 block">
                      <strong className="text-sky-400 font-mono text-sm">D</strong> · Shaft Width
                    </label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.floors?.[selectedMobileFloorIdx]?.d || ''}
                      onChange={(e) => updateFloorMeasurement(selectedMobileFloorIdx, 'd', e.target.value)}
                      placeholder="mm"
                      className="h-11 bg-slate-950 border-slate-800 text-white font-mono text-base focus:border-sky-500"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-1">
                    <label className="text-xs text-slate-300 block">
                      <strong className="text-sky-400 font-mono text-sm">E</strong> · Front Opening
                    </label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.floors?.[selectedMobileFloorIdx]?.e || ''}
                      onChange={(e) => updateFloorMeasurement(selectedMobileFloorIdx, 'e', e.target.value)}
                      placeholder="mm"
                      className="h-11 bg-slate-950 border-slate-800 text-white font-mono text-base focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Entrance & Hall Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                    2. Entrance View (mm)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 block">
                        <strong className="text-blue-400 font-mono text-sm">F</strong> · Door Clear Width
                      </label>
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={currentLift.floors?.[selectedMobileFloorIdx]?.f || ''}
                        onChange={(e) => updateFloorMeasurement(selectedMobileFloorIdx, 'f', e.target.value)}
                        placeholder="mm"
                        className="h-11 bg-slate-950 border-slate-800 text-white font-mono text-base focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 block">
                        <strong className="text-blue-400 font-mono text-sm">G</strong> · Door Clear Height
                      </label>
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={currentLift.floors?.[selectedMobileFloorIdx]?.g || ''}
                        onChange={(e) => updateFloorMeasurement(selectedMobileFloorIdx, 'g', e.target.value)}
                        placeholder="mm"
                        className="h-11 bg-slate-950 border-slate-800 text-white font-mono text-base focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                    3. Hall Button Station (mm)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 block">
                        <strong className="text-purple-400 font-mono text-sm">H</strong> · Cutout Width
                      </label>
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={currentLift.floors?.[selectedMobileFloorIdx]?.h || ''}
                        onChange={(e) => updateFloorMeasurement(selectedMobileFloorIdx, 'h', e.target.value)}
                        placeholder="mm"
                        className="h-11 bg-slate-950 border-slate-800 text-white font-mono text-base focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 block">
                        <strong className="text-purple-400 font-mono text-sm">I</strong> · Cutout Height
                      </label>
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={currentLift.floors?.[selectedMobileFloorIdx]?.i || ''}
                        onChange={(e) => updateFloorMeasurement(selectedMobileFloorIdx, 'i', e.target.value)}
                        placeholder="mm"
                        className="h-11 bg-slate-950 border-slate-800 text-white font-mono text-base focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Floor to Floor Height HT */}
              <div className="pt-3 border-t border-slate-800">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    4. Floor-to-Floor Height (HT in mm)
                  </span>
                  <div className="max-w-xs space-y-1">
                    <label className="text-xs text-slate-300 block">
                      <strong className="text-emerald-400 font-mono text-sm">HT</strong> · Height to Next Landing Floor
                    </label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.floors?.[selectedMobileFloorIdx]?.height || ''}
                      onChange={(e) => updateFloorMeasurement(selectedMobileFloorIdx, 'height', e.target.value)}
                      placeholder="mm"
                      className="h-11 bg-slate-950 border-slate-800 text-emerald-400 font-bold font-mono text-base focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step Navigation Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedMobileFloorIdx(selectedMobileFloorIdx - 1)}
                  className="h-11 px-4 text-xs border-slate-700 bg-slate-950 text-slate-200 hover:text-white flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>
                    {selectedMobileFloorIdx === 0
                      ? 'Required Dim'
                      : `Stop ${floorNames[selectedMobileFloorIdx - 1]}`}
                  </span>
                </Button>

                {selectedMobileFloorIdx < floorNames.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => setSelectedMobileFloorIdx(selectedMobileFloorIdx + 1)}
                    className="h-11 px-5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/30"
                  >
                    <span>Next: Stop {floorNames[selectedMobileFloorIdx + 1]}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-11 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? 'Saving...' : 'Save All Floors'}</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Master Measurement Grid Table (Sticky headers, overview layout) */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs uppercase tracking-wider">
                {currentLift.liftName || `Lift ${activeLiftIdx + 1}`} Dimensional Measurements Table
              </span>
              <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                {floorNames.length} Stops Configured
              </Badge>
            </div>
            <span className="text-[10px] text-slate-400">All input values in mm (or design target)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                {/* Category Grouping Header */}
                <tr className="bg-slate-950/90 text-slate-300 border-b border-slate-800 text-[11px] font-bold">
                  <th className="px-3 py-2 border-r border-slate-800 sticky left-0 bg-slate-950 z-20 shadow-sm">
                    FLOOR
                  </th>
                  <th colSpan={5} className="px-3 py-2 border-r border-slate-800 text-center bg-sky-950/20 text-sky-300">
                    SHAFT PLAN DIMENSIONS (MM)
                  </th>
                  <th colSpan={2} className="px-3 py-2 border-r border-slate-800 text-center bg-blue-950/20 text-blue-300">
                    ENTRANCE VIEW (MM)
                  </th>
                  <th colSpan={2} className="px-3 py-2 border-r border-slate-800 text-center bg-purple-950/20 text-purple-300">
                    HALL BUTTON CUT OUT (MM)
                  </th>
                  <th className="px-3 py-2 text-center bg-emerald-950/20 text-emerald-300">
                    FLOOR HEIGHT (MM)
                  </th>
                </tr>

                {/* Sub-column Indicators - Strictly Pure Letters (No Brackets) */}
                <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                  <th className="px-3 py-2 border-r border-slate-800 sticky left-0 bg-slate-950 z-20 shadow-sm">
                    STOP NO
                  </th>
                  <th className="px-2 py-2 text-center border-r border-slate-800">A</th>
                  <th className="px-2 py-2 text-center border-r border-slate-800">B</th>
                  <th className="px-2 py-2 text-center border-r border-slate-800">C</th>
                  <th className="px-2 py-2 text-center border-r border-slate-800">D</th>
                  <th className="px-2 py-2 text-center border-r border-slate-800">E</th>
                  <th className="px-2 py-2 text-center border-r border-slate-800">F</th>
                  <th className="px-2 py-2 text-center border-r border-slate-800">G</th>
                  <th className="px-2 py-2 text-center border-r border-slate-800">H</th>
                  <th className="px-2 py-2 text-center border-r border-slate-800">I</th>
                  <th className="px-2 py-2 text-center">HT</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800 text-slate-200">
                {/* Row 1: Required Dimensions (Design Blueprint) */}
                <tr className="bg-rose-950/20 font-bold border-b border-rose-900/50">
                  <td className="px-3 py-2 text-rose-400 text-xs border-r border-slate-800 sticky left-0 bg-slate-950 z-10 shadow-sm">
                    Required Dim.
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.a || ''}
                      onChange={(e) => updateRequiredDim('a', e.target.value)}
                      placeholder="-"
                      className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.b || ''}
                      onChange={(e) => updateRequiredDim('b', e.target.value)}
                      placeholder="-"
                      className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.c || ''}
                      onChange={(e) => updateRequiredDim('c', e.target.value)}
                      placeholder="-"
                      className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.d || ''}
                      onChange={(e) => updateRequiredDim('d', e.target.value)}
                      placeholder="-"
                      className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.e || ''}
                      onChange={(e) => updateRequiredDim('e', e.target.value)}
                      placeholder="-"
                      className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.f || ''}
                      onChange={(e) => updateRequiredDim('f', e.target.value)}
                      placeholder="-"
                      className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.g || ''}
                      onChange={(e) => updateRequiredDim('g', e.target.value)}
                      placeholder="-"
                      className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.h || ''}
                      onChange={(e) => updateRequiredDim('h', e.target.value)}
                      placeholder="-"
                      className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentLift.requiredDimensions?.i || ''}
                      onChange={(e) => updateRequiredDim('i', e.target.value)}
                      placeholder="-"
                      className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </td>
                  <td className="p-1 text-center text-slate-500 text-xs">-</td>
                </tr>

                {/* Floor Stop Measurement Rows */}
                {currentLift.floors?.map((fl: any, fIdx: number) => (
                  <tr key={fIdx} className="hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-mono font-bold text-sky-400 border-r border-slate-800 sticky left-0 bg-slate-950 z-10 shadow-sm">
                      {fl.floorName}
                    </td>
                    <td className="p-1 border-r border-slate-800">
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={fl.a || ''}
                        onChange={(e) => updateFloorMeasurement(fIdx, 'a', e.target.value)}
                        placeholder="-"
                        className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-800">
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={fl.b || ''}
                        onChange={(e) => updateFloorMeasurement(fIdx, 'b', e.target.value)}
                        placeholder="-"
                        className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-800">
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={fl.c || ''}
                        onChange={(e) => updateFloorMeasurement(fIdx, 'c', e.target.value)}
                        placeholder="-"
                        className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-800">
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={fl.d || ''}
                        onChange={(e) => updateFloorMeasurement(fIdx, 'd', e.target.value)}
                        placeholder="-"
                        className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-800">
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={fl.e || ''}
                        onChange={(e) => updateFloorMeasurement(fIdx, 'e', e.target.value)}
                        placeholder="-"
                        className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-800">
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={fl.f || ''}
                        onChange={(e) => updateFloorMeasurement(fIdx, 'f', e.target.value)}
                        placeholder="-"
                        className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-800">
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={fl.g || ''}
                        onChange={(e) => updateFloorMeasurement(fIdx, 'g', e.target.value)}
                        placeholder="-"
                        className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-800">
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={fl.h || ''}
                        onChange={(e) => updateFloorMeasurement(fIdx, 'h', e.target.value)}
                        placeholder="-"
                        className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-800">
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={fl.i || ''}
                        onChange={(e) => updateFloorMeasurement(fIdx, 'i', e.target.value)}
                        placeholder="-"
                        className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={fl.height || ''}
                        onChange={(e) => updateFloorMeasurement(fIdx, 'height', e.target.value)}
                        placeholder="-"
                        className="w-full h-8 sm:h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Observations / Comments (1 to 12) */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Site Observations &amp; Engineering Comments (1 to 12)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Printed directly onto bottom section of report</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
          {observations.map((obsText, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-6 font-mono font-bold text-slate-500 text-right shrink-0">
                {idx + 1}.
              </span>
              <Input
                value={obsText}
                onChange={(e) => updateObservation(idx, e.target.value)}
                placeholder={`Observation ${idx + 1}...`}
                className="h-8 bg-slate-950 border-slate-800 text-white text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sign-off & Personnel */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
          Engineering Signatures &amp; Field Certifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Survey Conducted By */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <span className="font-bold text-slate-200 uppercase text-[11px] block">
              1. Survey Conducted By
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Surveyor Full Name(s)</label>
              <Input
                value={surveyorName}
                onChange={(e) => setSurveyorName(e.target.value)}
                placeholder="e.g. Suleiman Marenya & Arjun Gandhi"
                className="h-8 bg-slate-900 border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Signature Date</label>
              <Input
                type="date"
                value={surveyorSignDate}
                onChange={(e) => setSurveyorSignDate(e.target.value)}
                className="h-8 bg-slate-900 border-slate-800 text-white text-xs"
              />
            </div>
          </div>

          {/* Checked By Field Operation Director */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <span className="font-bold text-slate-200 uppercase text-[11px] block">
              2. Checked By (Director / Engineer)
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Approver Name &amp; Title</label>
              <Input
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                placeholder="e.g. Field Operation Director"
                className="h-8 bg-slate-900 border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Signature Date</label>
              <Input
                type="date"
                value={directorSignDate}
                onChange={(e) => setDirectorSignDate(e.target.value)}
                className="h-8 bg-slate-900 border-slate-800 text-white text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Floating Save Toolbar */}
      <div className="hidden md:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-slate-700 shadow-2xl rounded-full px-5 py-2.5 items-center gap-3 backdrop-blur-md">
        <span className="text-xs text-slate-300 font-medium">
          {survey.surveyNumber} · {projectName}
        </span>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-600/30 rounded-full"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          <span>Save Changes</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handlePreviewPdf}
          disabled={isPreviewLoading}
          className="border-slate-700 text-slate-200 hover:text-white text-xs flex items-center gap-1.5 rounded-full"
        >
          {isPreviewLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5 text-sky-400" />}
          <span>Preview PDF</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="border-slate-700 text-slate-200 hover:text-white text-xs flex items-center gap-1.5 rounded-full"
        >
          {isDownloadingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 text-emerald-400" />}
          <span>Download PDF</span>
        </Button>
      </div>

      {/* Mobile Sticky Bottom Bar (Thumb-optimized for on-site phone surveying) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md px-3 py-2.5 flex items-center justify-between gap-2 shadow-2xl">
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider truncate">
            {survey.surveyNumber}
          </span>
          <span className="text-xs font-bold text-sky-400 truncate">
            {currentLift.liftName || `Lift ${activeLiftIdx + 1}`} · {selectedMobileFloorIdx === -1 ? 'Req Dim' : `Stop ${floorNames[selectedMobileFloorIdx] || ''}`}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePreviewPdf}
            disabled={isPreviewLoading}
            className="h-9 px-3 border-slate-700 bg-slate-900 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1"
          >
            {isPreviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 text-sky-400" />}
            <span>PDF</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-sky-600/30"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save</span>
          </Button>
        </div>
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
        docType="SURVEY"
      />
    </div>
  );
}
