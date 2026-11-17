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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { fetchApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { PdfPreviewModal } from '@/components/admin/pdf-preview-modal';
import { BuildingSurveyReportPDF } from '@/components/admin/lift-survey-pdf';

export default function AdminLiftSurveyDetailPage() {
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
          initialLifts = Array.from({ length: data.numberOfLifts || 1 }).map((_, idx) => ({
            liftNumber: idx + 1,
            liftName: (data.numberOfLifts || 1) > 1 ? `Lift ${idx + 1} (L${idx + 1} ELE.)` : 'Lift 1 (L1 ELE.)',
            pitDepth: 'not accessible',
            overheadHeight: '4634',
            requiredDimensions: { a: '', b: '', c: '2004', d: '2000', e: '', f: '963', g: '2207', h: '', i: '' },
            floors: fNames.map((fn: string, fIdx: number) => ({
              floorName: fn,
              a: '', b: '',
              c: fIdx === 0 ? '2004' : fIdx === 1 ? '1999' : '',
              d: '2000',
              e: '',
              f: fIdx === 0 ? '963' : fIdx === 1 ? '974' : '',
              g: fIdx === 0 ? '2207' : fIdx === 1 ? '2200' : '',
              h: '', i: '',
              height: fIdx === 0 ? '3433' : fIdx === 1 ? '4634' : '',
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

        setSurveyorName(data.surveyorName || 'Suleiman Marenya & Arjun Gandhi');
        setSurveyorSignDate(data.surveyorSignDate || data.date);
        setDirectorName(data.directorName || 'Field Operation Director');
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
      const blob = await pdf(<BuildingSurveyReportPDF report={reportData} />).toBlob();
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
      const blob = await pdf(<BuildingSurveyReportPDF report={reportData} />).toBlob();
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
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
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

      {/* Visual Technical Diagram Reference Card */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Technical Dimension Reference Diagrams
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">All dimensions in millimeters (MM)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Sketch 1: Shaft Plan */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mb-2">
              1. Shaft Plan Dimensions
            </span>
            <div className="w-full flex justify-center py-1">
              <svg width="180" height="110" viewBox="0 0 200 125" className="overflow-visible">
                <path
                  d="M 25 105 L 25 20 L 175 20 L 175 105 L 140 105 L 140 95 L 165 95 L 165 30 L 35 30 L 35 95 L 60 95 L 60 105 Z"
                  fill="#1e293b"
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                <rect x="55" y="38" width="90" height="50" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                <text x="100" y="66" fontSize="10" fontWeight="bold" fill="#f87171" textAnchor="middle">
                  {currentLift.liftName || 'L1 ELE.'}
                </text>
                {/* Lines */}
                <line x1="15" y1="20" x2="15" y2="105" stroke="#38bdf8" strokeWidth="1" />
                <text x="5" y="65" fontSize="10" fontWeight="bold" fill="#38bdf8">C</text>

                <line x1="25" y1="12" x2="175" y2="12" stroke="#38bdf8" strokeWidth="1" />
                <text x="100" y="9" fontSize="10" fontWeight="bold" fill="#38bdf8" textAnchor="middle">D</text>

                <line x1="25" y1="114" x2="60" y2="114" stroke="#38bdf8" strokeWidth="1" />
                <text x="42" y="123" fontSize="9" fontWeight="bold" fill="#38bdf8" textAnchor="middle">A</text>

                <line x1="140" y1="114" x2="175" y2="114" stroke="#38bdf8" strokeWidth="1" />
                <text x="157" y="123" fontSize="9" fontWeight="bold" fill="#38bdf8" textAnchor="middle">B</text>

                <line x1="60" y1="105" x2="140" y2="105" stroke="#a855f7" strokeWidth="1" strokeDasharray="2,2" />
                <text x="100" y="118" fontSize="10" fontWeight="bold" fill="#a855f7" textAnchor="middle">E</text>
              </svg>
            </div>
            <div className="w-full text-[10px] text-slate-400 space-y-0.5 mt-2 border-t border-slate-900 pt-1.5">
              <p><strong className="text-sky-400">A / B:</strong> Left / Right Front Door Jamb Returns</p>
              <p><strong className="text-sky-400">C:</strong> Shaft Internal Depth · <strong className="text-sky-400">D:</strong> Shaft Width</p>
              <p><strong className="text-purple-400">E:</strong> Front Shaft Opening Width</p>
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

      {/* Master Measurement Table */}
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
          <span className="text-[10px] text-slate-400">Input values in mm (or design target)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {/* Category Grouping Header */}
              <tr className="bg-slate-950/90 text-slate-300 border-b border-slate-800 text-[11px] font-bold">
                <th className="px-3 py-2 border-r border-slate-800">FLOOR</th>
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

              {/* Sub-column Indicators */}
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                <th className="px-3 py-2 border-r border-slate-800">STOP NO</th>
                <th className="px-2 py-2 text-center border-r border-slate-800">A (Left)</th>
                <th className="px-2 py-2 text-center border-r border-slate-800">B (Right)</th>
                <th className="px-2 py-2 text-center border-r border-slate-800">C (Depth)</th>
                <th className="px-2 py-2 text-center border-r border-slate-800">D (Width)</th>
                <th className="px-2 py-2 text-center border-r border-slate-800">E (Opening)</th>
                <th className="px-2 py-2 text-center border-r border-slate-800">F (Door W)</th>
                <th className="px-2 py-2 text-center border-r border-slate-800">G (Door H)</th>
                <th className="px-2 py-2 text-center border-r border-slate-800">H (Btn W)</th>
                <th className="px-2 py-2 text-center border-r border-slate-800">I (Btn H)</th>
                <th className="px-2 py-2 text-center">HT IN MM</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-slate-200">
              {/* Row 1: Required Dimensions (Design Blueprint) */}
              <tr className="bg-rose-950/20 font-bold border-b border-rose-900/50">
                <td className="px-3 py-2 text-rose-400 text-xs border-r border-slate-800">
                  Required Dim.
                </td>
                <td className="p-1 border-r border-slate-800">
                  <input
                    value={currentLift.requiredDimensions?.a || ''}
                    onChange={(e) => updateRequiredDim('a', e.target.value)}
                    placeholder="-"
                    className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                  />
                </td>
                <td className="p-1 border-r border-slate-800">
                  <input
                    value={currentLift.requiredDimensions?.b || ''}
                    onChange={(e) => updateRequiredDim('b', e.target.value)}
                    placeholder="-"
                    className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                  />
                </td>
                <td className="p-1 border-r border-slate-800">
                  <input
                    value={currentLift.requiredDimensions?.c || ''}
                    onChange={(e) => updateRequiredDim('c', e.target.value)}
                    placeholder="2004"
                    className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                  />
                </td>
                <td className="p-1 border-r border-slate-800">
                  <input
                    value={currentLift.requiredDimensions?.d || ''}
                    onChange={(e) => updateRequiredDim('d', e.target.value)}
                    placeholder="2000"
                    className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                  />
                </td>
                <td className="p-1 border-r border-slate-800">
                  <input
                    value={currentLift.requiredDimensions?.e || ''}
                    onChange={(e) => updateRequiredDim('e', e.target.value)}
                    placeholder="-"
                    className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                  />
                </td>
                <td className="p-1 border-r border-slate-800">
                  <input
                    value={currentLift.requiredDimensions?.f || ''}
                    onChange={(e) => updateRequiredDim('f', e.target.value)}
                    placeholder="963"
                    className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                  />
                </td>
                <td className="p-1 border-r border-slate-800">
                  <input
                    value={currentLift.requiredDimensions?.g || ''}
                    onChange={(e) => updateRequiredDim('g', e.target.value)}
                    placeholder="2207"
                    className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                  />
                </td>
                <td className="p-1 border-r border-slate-800">
                  <input
                    value={currentLift.requiredDimensions?.h || ''}
                    onChange={(e) => updateRequiredDim('h', e.target.value)}
                    placeholder="-"
                    className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                  />
                </td>
                <td className="p-1 border-r border-slate-800">
                  <input
                    value={currentLift.requiredDimensions?.i || ''}
                    onChange={(e) => updateRequiredDim('i', e.target.value)}
                    placeholder="-"
                    className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                  />
                </td>
                <td className="p-1 text-center text-slate-500 text-xs">-</td>
              </tr>

              {/* Floor Stop Measurement Rows */}
              {currentLift.floors?.map((fl: any, fIdx: number) => (
                <tr key={fIdx} className="hover:bg-slate-800/40">
                  <td className="px-3 py-2 font-mono font-bold text-sky-400 border-r border-slate-800">
                    {fl.floorName}
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      value={fl.a || ''}
                      onChange={(e) => updateFloorMeasurement(fIdx, 'a', e.target.value)}
                      placeholder="mm"
                      className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      value={fl.b || ''}
                      onChange={(e) => updateFloorMeasurement(fIdx, 'b', e.target.value)}
                      placeholder="mm"
                      className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      value={fl.c || ''}
                      onChange={(e) => updateFloorMeasurement(fIdx, 'c', e.target.value)}
                      placeholder="mm"
                      className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      value={fl.d || ''}
                      onChange={(e) => updateFloorMeasurement(fIdx, 'd', e.target.value)}
                      placeholder="mm"
                      className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      value={fl.e || ''}
                      onChange={(e) => updateFloorMeasurement(fIdx, 'e', e.target.value)}
                      placeholder="mm"
                      className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      value={fl.f || ''}
                      onChange={(e) => updateFloorMeasurement(fIdx, 'f', e.target.value)}
                      placeholder="mm"
                      className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      value={fl.g || ''}
                      onChange={(e) => updateFloorMeasurement(fIdx, 'g', e.target.value)}
                      placeholder="mm"
                      className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      value={fl.h || ''}
                      onChange={(e) => updateFloorMeasurement(fIdx, 'h', e.target.value)}
                      placeholder="mm"
                      className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      value={fl.i || ''}
                      onChange={(e) => updateFloorMeasurement(fIdx, 'i', e.target.value)}
                      placeholder="mm"
                      className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      value={fl.height || ''}
                      onChange={(e) => updateFloorMeasurement(fIdx, 'height', e.target.value)}
                      placeholder="mm"
                      className="w-full h-7 rounded bg-slate-950 border border-slate-800 text-center text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

      {/* Floating Save Toolbar at Bottom */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-slate-700 shadow-2xl rounded-full px-5 py-2.5 flex items-center gap-3 backdrop-blur-md">
        <span className="text-xs text-slate-300 font-medium hidden sm:inline">
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
