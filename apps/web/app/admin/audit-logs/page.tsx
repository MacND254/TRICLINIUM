'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Shield, User, Package, Wrench, FileText, Settings, MessageSquare, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

const API = process.env.NEXT_PUBLIC_API_URL || '';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}/api/v1${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

const ENTITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  AUTH: Shield,
  USER: User,
  PRODUCT: Package,
  SERVICE: Wrench,
  CMS: FileText,
  SETTINGS: Settings,
  INQUIRY: MessageSquare,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-900/40 text-emerald-400',
  UPDATE: 'bg-sky-900/40 text-sky-400',
  DELETE: 'bg-rose-900/40 text-rose-400',
  LOGIN: 'bg-purple-900/40 text-purple-400',
  LOGOUT: 'bg-slate-800 text-slate-400',
  EXPORT: 'bg-amber-900/30 text-amber-400',
  PUBLISH: 'bg-emerald-900/40 text-emerald-400',
  ARCHIVE: 'bg-orange-900/30 text-orange-400',
};

function getActionColor(action: string): string {
  for (const [key, cls] of Object.entries(ACTION_COLORS)) {
    if (action.includes(key)) return cls;
  }
  return 'bg-slate-800 text-slate-400';
}

function EntityIcon({ type }: { type: string }) {
  const Icon = ENTITY_ICONS[type] || FileText;
  return (
    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-slate-400" />
    </div>
  );
}

function MetadataViewer({ metadata }: { metadata: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  if (!metadata || Object.keys(metadata).length === 0) return null;

  return (
    <div className="mt-2">
      <button onClick={() => setExpanded(e => !e)} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
        {expanded ? '▲' : '▼'} Details
      </button>
      {expanded && (
        <pre className="mt-2 rounded-lg bg-slate-800 p-3 text-xs text-slate-400 overflow-x-auto max-h-48">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 25;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PER_PAGE),
        ...(entityFilter !== 'ALL' && { entityType: entityFilter }),
        ...(search && { search }),
      });
      const data = await apiFetch(`/admin/audit-logs?${params}`);
      setLogs(Array.isArray(data.data) ? data.data : []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotal(data.meta?.total || 0);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, entityFilter, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, entityFilter]);

  const entityTypes = ['ALL', 'AUTH', 'USER', 'PRODUCT', 'SERVICE', 'INQUIRY', 'CMS', 'SETTINGS'];

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Audit Logs</h1>
        <p className="mt-1 text-slate-400">{total.toLocaleString()} total events recorded</p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            placeholder="Search actions, users, entities…" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 pl-10 pr-8 py-2 text-sm text-slate-300 focus:border-sky-500 focus:outline-none">
            {entityTypes.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-sky-500" /></div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Shield className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium">No audit logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors">
                <EntityIcon type={log.entityType} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-sm text-slate-400 font-mono text-xs">{log.entityType}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ''}</span>
                    <span className="text-xs text-slate-600 ml-auto">{formatRelativeTime(log.createdAt)}</span>
                  </div>
                  {log.user && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      {log.user.name} <span className="text-slate-700">·</span> {log.user.email}
                      {log.ipAddress && <><span className="text-slate-700">·</span> {log.ipAddress}</>}
                    </p>
                  )}
                  {log.metadata && <MetadataViewer metadata={log.metadata} />}
                </div>
                <span className="text-xs text-slate-600 shrink-0 hidden lg:block">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-slate-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-40">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
