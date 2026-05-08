"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Loader2, RefreshCw, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LogEntry {
  id: number;
  action: string;
  table: string;
  recordId: number | null;
  userId: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: any;
  createdAt: string;
  user: { id: number; name: string | null; email: string } | null;
}

interface PageData {
  logs: LogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const CLEAR_OPTIONS = [
  { label: "Older than 7 days",  days: 7  },
  { label: "Older than 30 days", days: 30 },
  { label: "Older than 60 days", days: 60 },
  { label: "Older than 90 days", days: 90 },
  { label: "Clear ALL logs",     days: 0  },
];

function actionVariant(action: string) {
  const a = action.toUpperCase();
  if (a.includes("DELETE") || a.includes("REMOVE")) return "danger" as const;
  if (a.includes("CREATE") || a.includes("SIGNUP") || a.includes("REGISTER")) return "success" as const;
  if (a.includes("UPDATE") || a.includes("EDIT") || a.includes("RESET")) return "info" as const;
  if (a.includes("LOGIN") || a.includes("LOGOUT") || a.includes("AUTH")) return "warning" as const;
  return "gray" as const;
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function AuditLogsPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [clearing, setClearing] = useState(false);
  const [showClearMenu, setShowClearMenu] = useState(false);
  const [clearResult, setClearResult] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "50",
      ...(actionFilter && { action: actionFilter }),
      ...(tableFilter && { table: tableFilter }),
    });
    try {
      const res = await fetch(`/api/super-admin/audit-logs?${params}`);
      const json = await res.json();
      setData(json.payload ?? null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, tableFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [actionFilter, tableFilter]);

  async function handleClear(days: number) {
    setShowClearMenu(false);
    const label = days === 0 ? "all audit logs" : `audit logs older than ${days} days`;
    if (!confirm(`This will permanently delete ${label}. Continue?`)) return;
    setClearing(true);
    setClearResult("");
    try {
      const res = await fetch(`/api/super-admin/audit-logs?olderThanDays=${days}`, { method: "DELETE" });
      const json = await res.json();
      setClearResult(json.message ?? "Done");
      setPage(1);
      fetchLogs();
    } catch {
      setClearResult("Failed to clear logs");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-orange-500" />
            Audit Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {data ? `${data.total.toLocaleString()} total entries` : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="relative">
            <button
              onClick={() => setShowClearMenu((v) => !v)}
              disabled={clearing}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {clearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Clear Logs
            </button>
            {showClearMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowClearMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[200px]">
                  {CLEAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.days}
                      onClick={() => handleClear(opt.days)}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 transition-colors ${opt.days === 0 ? "text-red-500 font-medium" : "text-slate-700"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {clearResult && (
        <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-2.5 text-sm text-green-700">
          {clearResult}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            placeholder="Filter by action…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            placeholder="Filter by table…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Table</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Record ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">IP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading…
                  </td>
                </tr>
              ) : !data || data.logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                data.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <Badge variant={actionVariant(log.action)}>{log.action}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-600">{log.table}</td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <div>
                          <p className="text-xs font-medium text-slate-900 leading-none">{log.user.name ?? "—"}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                      {log.recordId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {log.ipAddress ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {fmtDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {(page - 1) * data.limit + 1}–{Math.min(page * data.limit, data.total)}
              </span>{" "}
              of <span className="font-medium text-slate-700">{data.total.toLocaleString()}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 w-7 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs text-slate-600 px-2">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="h-7 w-7 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
