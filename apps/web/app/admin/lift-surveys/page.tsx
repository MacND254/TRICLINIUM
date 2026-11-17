'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Plus,
  Search,
  Download,
  Eye,
  Trash2,
  Pencil,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Compass,
  ArrowRight,
  Sliders,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { PdfPreviewModal } from '@/components/admin/pdf-preview-modal';
import { BuildingSurveyReportPDF } from '@/components/admin/lift-survey-pdf';

export default function AdminLiftSurveysPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Initial Setup Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Survey Generation Setup Fields
  const [projectName, setProjectName] = useState('COAST CABLES');
  const [clientName, setClientName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [surveyDate, setSurveyDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [numberOfLifts, setNumberOfLifts] = useState(1);
  const [numberOfStops, setNumberOfStops] = useState(6);
  const [basementCount, setBasementCount] = useState(1);
  const [floorNamesText, setFloorNamesText] = useState('B, G, 1, 2, 3, 4');
  const [surveyorName, setSurveyorName] = useState('Suleiman Marenya & Arjun Gandhi');
  const [directorName, setDirectorName] = useState('Field Operation Director');

  // PDF Preview & Download States
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState('');
  const [previewPdfFilename, setPreviewPdfFilename] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'preview' | 'download' | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Automatically recalculate floor stops preview when stops or basement count change
  useEffect(() => {
    const stops = Math.max(2, numberOfStops);
    const bCount = Math.max(0, basementCount);
    const floors: string[] = [];

    if (bCount === 1) {
      floors.push('B');
    } else if (bCount > 1) {
      for (let b = bCount; b >= 1; b--) {
        floors.push(`B${b}`);
      }
    }

    if (floors.length < stops) {
      floors.push('G');
    }

    let floorNum = 1;
    while (floors.length < stops) {
      floors.push(`${floorNum}`);
      floorNum++;
    }

    setFloorNamesText(floors.join(', '));
  }, [numberOfStops, basementCount]);

  const loadSurveys = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (statusFilter) query.set('status', statusFilter);
      const res = await fetchApi(`/admin/lift-surveys?${query.toString()}`);
      const list = res?.items || res?.data?.items || (Array.isArray(res) ? res : []);
      setSurveys(list);
    } catch (e) {
      console.error('Failed to load lift surveys:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, [statusFilter]);

  const handleOpenCreateModal = () => {
    setProjectName('');
    setClientName('');
    setSiteLocation('');
    setSurveyDate(new Date().toISOString().split('T')[0]);
    setNumberOfLifts(1);
    setNumberOfStops(6);
    setBasementCount(1);
    setFloorNamesText('B, G, 1, 2, 3, 4');
    setSurveyorName('Suleiman Marenya & Arjun Gandhi');
    setDirectorName('Field Operation Director');
    setModalError(null);
    setShowCreateModal(true);
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const cleanProject = projectName.trim();
    if (!cleanProject) {
      setModalError('Project Name is required.');
      return;
    }

    const cleanFloors = floorNamesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (cleanFloors.length === 0) {
      setModalError('Please specify at least 2 floor stop labels.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build lift data structure for each configured lift with blank measurements ready for on-site keying
      const liftsData = Array.from({ length: numberOfLifts }).map((_, idx) => {
        const liftNo = idx + 1;
        return {
          liftNumber: liftNo,
          liftName: numberOfLifts > 1 ? `Lift ${liftNo} (L${liftNo} ELE.)` : 'Lift 1 (L1 ELE.)',
          pitDepth: '',
          overheadHeight: '',
          requiredDimensions: {
            a: '',
            b: '',
            c: '',
            d: '',
            e: '',
            f: '',
            g: '',
            h: '',
            i: '',
          },
          floors: cleanFloors.map((fn) => ({
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
        };
      });

      // Blank observation checklist ready for fresh on-site surveyor remarks
      const initialObservations = Array(12).fill('');

      const res = await fetchApi('/admin/lift-surveys', {
        method: 'POST',
        body: JSON.stringify({
          projectName: cleanProject,
          clientName: clientName.trim() || undefined,
          siteLocation: siteLocation.trim() || undefined,
          date: surveyDate,
          numberOfLifts,
          numberOfStops: cleanFloors.length,
          floorNames: cleanFloors,
          status: 'DRAFT',
          liftsData,
          observations: initialObservations,
          surveyorName: surveyorName.trim(),
          directorName: directorName.trim(),
        }),
      });

      setShowCreateModal(false);
      const newSurvey = res?.data ?? res;
      const newId = newSurvey?.id;
      if (newId) {
        window.location.href = `/admin/lift-surveys/${newId}`;
      } else {
        await loadSurveys();
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to create building survey report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSurvey = async (survey: any) => {
    if (!window.confirm(`Are you sure you want to delete Survey ${survey.surveyNumber} for "${survey.projectName}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeletingId(survey.id);
    try {
      await fetchApi(`/admin/lift-surveys/${survey.id}`, { method: 'DELETE' });
      await loadSurveys();
    } catch (err: any) {
      alert(err.message || 'Failed to delete survey');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handlePreviewPdf = async (survey: any) => {
    setActiveActionId(survey.id);
    setActionType('preview');
    setIsPreviewLoading(true);

    const reportData = {
      surveyNumber: survey.surveyNumber,
      projectName: survey.projectName,
      clientName: survey.clientName,
      siteLocation: survey.siteLocation,
      date: survey.date,
      numberOfLifts: survey.numberOfLifts,
      numberOfStops: survey.numberOfStops,
      floorNames: survey.floorNames,
      status: survey.status,
      lifts: survey.liftsData || [],
      observations: survey.observations || [],
      surveyorName: survey.surveyorName,
      surveyorSignDate: survey.surveyorSignDate,
      directorName: survey.directorName,
      directorSignDate: survey.directorSignDate,
    };

    setPreviewPdfTitle(`Building Survey Report: ${survey.projectName} (${survey.surveyNumber})`);
    setPreviewPdfFilename(`${survey.surveyNumber}-${survey.projectName.replace(/\s+/g, '_')}.pdf`);
    setPreviewModalOpen(true);

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(<BuildingSurveyReportPDF report={reportData} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPreviewPdfUrl(url);
    } catch (err: any) {
      console.error('PDF preview error:', err);
      alert('Failed to generate survey report preview PDF');
      setPreviewModalOpen(false);
    } finally {
      setIsPreviewLoading(false);
      setActiveActionId(null);
      setActionType(null);
    }
  };

  const handleDownloadPdf = async (survey: any) => {
    setActiveActionId(survey.id);
    setActionType('download');
    try {
      const reportData = {
        surveyNumber: survey.surveyNumber,
        projectName: survey.projectName,
        clientName: survey.clientName,
        siteLocation: survey.siteLocation,
        date: survey.date,
        numberOfLifts: survey.numberOfLifts,
        numberOfStops: survey.numberOfStops,
        floorNames: survey.floorNames,
        status: survey.status,
        lifts: survey.liftsData || [],
        observations: survey.observations || [],
        surveyorName: survey.surveyorName,
        surveyorSignDate: survey.surveyorSignDate,
        directorName: survey.directorName,
        directorSignDate: survey.directorSignDate,
      };

      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(<BuildingSurveyReportPDF report={reportData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const filename = `${survey.surveyNumber}-${survey.projectName.replace(/\s+/g, '_')}.pdf`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF download error:', err);
      alert('Failed to download building survey report PDF');
    } finally {
      setActiveActionId(null);
      setActionType(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Lift Survey (Building Reports)</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Capture on-site shaft &amp; elevator measurements, generate dynamic floor stops, and export official engineering PDFs.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/30 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Building Survey</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadSurveys();
          }}
          className="relative w-full sm:w-80"
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project, survey #, location..."
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
            <option value="">All Report Statuses</option>
            <option value="DRAFT">Draft In Progress</option>
            <option value="COMPLETED">Completed Survey</option>
            <option value="APPROVED">Certified &amp; Approved</option>
          </select>
        </div>
      </div>

      {/* Main Surveys Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : surveys.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Building2 className="h-10 w-10 text-slate-600 mx-auto" />
            <p className="text-sm font-medium">No Lift Survey Reports found.</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Start by creating a new survey. You will specify the number of lifts and floor stops (e.g. B, G, 1, 2, 3, 4) to generate the measurement workspace.
            </p>
            <Button
              size="sm"
              onClick={handleOpenCreateModal}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs"
            >
              + Create First Building Survey
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Report Ref</th>
                  <th className="px-3.5 py-2.5">Project &amp; Site Location</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Lifts &amp; Configuration</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Floor Stops</th>
                  <th className="px-2.5 py-2.5 whitespace-nowrap">Status</th>
                  <th className="px-2.5 py-2.5 whitespace-nowrap">Date</th>
                  <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {surveys.map((sv) => {
                  const statusColors: Record<string, string> = {
                    DRAFT: 'bg-amber-950/60 text-amber-300 border-amber-800',
                    COMPLETED: 'bg-sky-950/60 text-sky-300 border-sky-800',
                    APPROVED: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
                  };

                  return (
                    <tr key={sv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-3.5 py-3 font-mono font-bold text-sky-400 whitespace-nowrap">
                        {sv.surveyNumber}
                      </td>

                      <td className="px-3.5 py-3 min-w-0 max-w-[200px] lg:max-w-[280px]">
                        <div className="font-bold text-white text-xs truncate">{sv.projectName}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {sv.siteLocation || sv.clientName || 'Site Location Not Specified'}
                        </div>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap text-xs">
                        <span className="font-semibold text-slate-200">
                          {sv.numberOfLifts === 1 ? '1 Single Lift' : `${sv.numberOfLifts} Lifts`}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {sv.numberOfLifts > 1 ? 'Multi-Shaft Report' : 'Single Shaft Report'}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-xs max-w-[160px] truncate font-mono text-slate-300">
                        {sv.floorNames?.join(', ') || `${sv.numberOfStops} Stops`}
                      </td>

                      <td className="px-2.5 py-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold border px-1.5 py-0.5 ${
                            statusColors[sv.status] || 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {sv.status}
                        </Badge>
                      </td>

                      <td className="px-2.5 py-3 whitespace-nowrap font-mono text-[10px] text-slate-400">
                        {formatDate(sv.date || sv.createdAt)}
                      </td>

                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Preview PDF */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreviewPdf(sv)}
                            disabled={activeActionId === sv.id}
                            title="Preview Building Survey Report PDF"
                            aria-label="Preview Building Survey Report PDF"
                            className="h-7 w-7 p-0 border-slate-700 bg-slate-950 text-slate-300 hover:text-white hover:border-sky-500 shrink-0 shadow-sm flex items-center justify-center"
                          >
                            {activeActionId === sv.id && actionType === 'preview' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Eye className="h-3 w-3 text-sky-400" />
                            )}
                          </Button>

                          {/* Download PDF */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPdf(sv)}
                            disabled={activeActionId === sv.id}
                            title="Download Building Survey Report PDF"
                            aria-label="Download Building Survey Report PDF"
                            className="h-7 w-7 p-0 border-slate-700 bg-slate-950 text-slate-300 hover:text-white hover:border-emerald-500 shrink-0 shadow-sm flex items-center justify-center"
                          >
                            {activeActionId === sv.id && actionType === 'download' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Download className="h-3 w-3 text-emerald-400" />
                            )}
                          </Button>

                          {/* Open Workspace / Edit */}
                          <Link href={`/admin/lift-surveys/${sv.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              title="Open Measurement Workspace"
                              className="h-7 px-2 border-slate-700 bg-slate-950 text-slate-200 hover:border-sky-500 hover:text-white text-[11px] font-semibold shrink-0 flex items-center gap-1"
                            >
                              <Pencil className="h-3 w-3 text-amber-400" />
                              <span>Measure</span>
                            </Button>
                          </Link>

                          {/* Delete Action */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSurvey(sv)}
                            disabled={isDeletingId === sv.id}
                            title="Delete Survey"
                            aria-label="Delete Survey"
                            className="h-7 w-7 p-0 border-slate-700 bg-slate-950 text-slate-300 hover:text-rose-300 hover:border-rose-500 shrink-0 shadow-sm flex items-center justify-center"
                          >
                            {isDeletingId === sv.id ? (
                              <Loader2 className="h-3 w-3 animate-spin text-rose-400" />
                            ) : (
                              <Trash2 className="h-3 w-3 text-rose-400" />
                            )}
                          </Button>
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
      {/* Create Building Survey Setup Modal */}
      {/* ───────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Create Building Survey Report</h3>
                  <p className="text-xs text-slate-400">
                    Configure project, number of lifts, and floor stops before generating rows.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSurvey} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs overscroll-contain">
                {modalError && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Project Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-300">Project Name *</label>
                    <Input
                      required
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. COAST CABLES"
                      className="mt-1 bg-slate-950 border-slate-700 text-white text-xs uppercase"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300">Survey Date *</label>
                    <Input
                      type="date"
                      required
                      value={surveyDate}
                      onChange={(e) => setSurveyDate(e.target.value)}
                      className="mt-1 bg-slate-950 border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-300">Client / Building Name</label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Coast Cables Ltd"
                      className="mt-1 bg-slate-950 border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300">Site Location / Address</label>
                    <Input
                      value={siteLocation}
                      onChange={(e) => setSiteLocation(e.target.value)}
                      placeholder="e.g. Mombasa Port Industrial Area"
                      className="mt-1 bg-slate-950 border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Configuration: Number of Lifts & Stops */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Sliders className="h-4 w-4 text-sky-400" />
                    <span className="font-bold text-white text-xs uppercase tracking-wider">
                      Shaft &amp; Floor Stops Configuration
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-300">Number of Lifts *</label>
                      <select
                        value={numberOfLifts}
                        onChange={(e) => setNumberOfLifts(Number(e.target.value))}
                        className="w-full mt-1 h-9 rounded-md border border-slate-700 bg-slate-900 px-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value={1}>1 (Single Lift Shaft)</option>
                        <option value={2}>2 (Double Lift Shafts)</option>
                        <option value={3}>3 (Three Lift Shafts)</option>
                        <option value={4}>4 (Four Lift Shafts)</option>
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {numberOfLifts === 1
                          ? 'Generates single L1 ELE. report section'
                          : `Generates ${numberOfLifts} separate sections for each lift`}
                      </p>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300">Total Number of Stops *</label>
                      <Input
                        type="number"
                        min={2}
                        max={30}
                        value={numberOfStops}
                        onChange={(e) => setNumberOfStops(Number(e.target.value))}
                        className="mt-1 bg-slate-900 border-slate-700 text-white text-xs font-mono"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">e.g. 6 stops total</p>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300">Basements Level Preset</label>
                      <select
                        value={basementCount}
                        onChange={(e) => setBasementCount(Number(e.target.value))}
                        className="w-full mt-1 h-9 rounded-md border border-slate-700 bg-slate-900 px-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value={1}>1 Basement (B, G, 1, 2...)</option>
                        <option value={0}>0 Basements (G, 1, 2, 3...)</option>
                        <option value={2}>2 Basements (B2, B1, G...)</option>
                        <option value={3}>3 Basements (B3, B2, B1, G...)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-300">Generated Floor Stop Labels</label>
                      <span className="text-[10px] text-sky-400 font-mono">
                        {floorNamesText.split(',').filter(Boolean).length} stops configured
                      </span>
                    </div>
                    <Input
                      required
                      value={floorNamesText}
                      onChange={(e) => setFloorNamesText(e.target.value)}
                      placeholder="e.g. B, G, 1, 2, 3, 4"
                      className="bg-slate-900 border-slate-700 text-sky-400 font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      For 6 stops with 1 basement, floors are generated as <strong className="text-white">B, G, 1, 2, 3, 4</strong> (up to 4th floor). You can also edit any label directly.
                    </p>
                  </div>
                </div>

                {/* Personnel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-300">Survey Conducted By (Name)</label>
                    <Input
                      value={surveyorName}
                      onChange={(e) => setSurveyorName(e.target.value)}
                      placeholder="e.g. Suleiman Marenya & Arjun Gandhi"
                      className="mt-1 bg-slate-950 border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300">Checked By (Director / Engineer)</label>
                    <Input
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      placeholder="e.g. Field Operation Director"
                      className="mt-1 bg-slate-950 border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center justify-end gap-3 px-5 py-3.5 border-t border-slate-800 bg-slate-900 z-10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-sky-600/30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Survey Workspace...</span>
                    </>
                  ) : (
                    <>
                      <Compass className="h-4 w-4" />
                      <span>Generate Survey Workspace</span>
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
        docType="SURVEY"
      />
    </div>
  );
}
