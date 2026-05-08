"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Cpu, MemoryStick, HardDrive, Server, Database,
  RefreshCw, Activity, Clock, Wifi, WifiOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ── helpers ──────────────────────────────────────────────────

function fmtBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}

function fmtUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function pct(used: number, total: number) {
  if (!total) return 0;
  return Math.min(100, (used / total) * 100);
}

// ── sub-components ───────────────────────────────────────────

function GaugeBar({ value, label, color = "orange" }: { value: number; label: string; color?: string }) {
  const colors: Record<string, string> = {
    orange: "bg-orange-500",
    blue:   "bg-blue-500",
    violet: "bg-violet-500",
    emerald:"bg-emerald-500",
    red:    value > 90 ? "bg-red-500" : value > 70 ? "bg-amber-500" : "bg-emerald-500",
  };
  const bar = colors[color] ?? colors.orange;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-medium text-slate-700">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${bar}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-900 font-mono">{value}</span>
    </div>
  );
}

function DbCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

// ── main page ────────────────────────────────────────────────

interface SystemStats {
  os: {
    platform: string;
    arch: string;
    hostname: string;
    cpuCount: number;
    loadAvg: { "1m": number; "5m": number; "15m": number };
    cpuLoadPercent: number;
    memory: { total: number; used: number; free: number };
    uptime: number;
  };
  disk: { total: number; used: number; free: number } | null;
  process: {
    nodeVersion: string;
    uptime: number;
    memory: { rss: number; heapTotal: number; heapUsed: number; external: number };
    pid: number;
  };
  database: {
    businesses: number;
    users: number;
    stores: number;
    products: number;
    transactions: number;
    auditLogs: number;
    subscriptions: number;
  };
  sampledAt: string;
}

const INTERVALS = [
  { label: "5s",  ms: 5000  },
  { label: "15s", ms: 15000 },
  { label: "30s", ms: 30000 },
  { label: "Off", ms: 0     },
];

export default function SystemPage() {
  const [stats, setStats]       = useState<SystemStats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [intervalMs, setIntervalMs] = useState(5000);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch("/api/super-admin/system");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setStats(json.payload);
      setLastFetched(new Date());
      setError("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // initial fetch
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // auto-refresh
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (intervalMs > 0) {
      timerRef.current = setInterval(fetchStats, intervalMs);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [intervalMs, fetchStats]);

  const isLive = intervalMs > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-orange-500" />
            Resource Monitor
          </h1>
          {lastFetched && (
            <p className="text-xs text-slate-400 mt-1">
              Last updated {lastFetched.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${isLive ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}>
            {isLive
              ? <><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" /></span> Live</>
              : <><WifiOff className="h-3 w-3" /> Paused</>
            }
          </div>

          {/* Interval picker */}
          <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden text-xs">
            {INTERVALS.map((opt) => (
              <button
                key={opt.ms}
                onClick={() => setIntervalMs(opt.ms)}
                className={`px-3 py-2 font-medium transition-colors ${intervalMs === opt.ms ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchStats}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Top row — gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* CPU */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Cpu className="h-4 w-4 text-orange-500" />
                <CardTitle>CPU</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <GaugeBar value={stats.os.cpuLoadPercent} label="Load (1 min)" color="red" />
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(["1m","5m","15m"] as const).map((k) => (
                    <div key={k} className="text-center rounded-lg bg-slate-50 py-2">
                      <p className="text-sm font-bold text-slate-900">{stats.os.loadAvg[k].toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400">{k} avg</p>
                    </div>
                  ))}
                </div>
                <StatRow label="Cores" value={stats.os.cpuCount} />
              </CardContent>
            </Card>

            {/* Memory */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <MemoryStick className="h-4 w-4 text-blue-500" />
                <CardTitle>Memory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <GaugeBar
                  value={pct(stats.os.memory.used, stats.os.memory.total)}
                  label="RAM used"
                  color="red"
                />
                <StatRow label="Used"  value={fmtBytes(stats.os.memory.used)} />
                <StatRow label="Free"  value={fmtBytes(stats.os.memory.free)} />
                <StatRow label="Total" value={fmtBytes(stats.os.memory.total)} />
              </CardContent>
            </Card>

            {/* Disk */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <HardDrive className="h-4 w-4 text-violet-500" />
                <CardTitle>Disk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.disk ? (
                  <>
                    <GaugeBar
                      value={pct(stats.disk.used, stats.disk.total)}
                      label="Disk used"
                      color="red"
                    />
                    <StatRow label="Used"  value={fmtBytes(stats.disk.used)} />
                    <StatRow label="Free"  value={fmtBytes(stats.disk.free)} />
                    <StatRow label="Total" value={fmtBytes(stats.disk.total)} />
                  </>
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">Not available on this platform</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle row — process + OS info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Node.js process */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Server className="h-4 w-4 text-emerald-500" />
                <CardTitle>Node.js Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <GaugeBar
                  value={pct(stats.process.memory.heapUsed, stats.process.memory.heapTotal)}
                  label="Heap used"
                  color="blue"
                />
                <StatRow label="Heap used"    value={fmtBytes(stats.process.memory.heapUsed)} />
                <StatRow label="Heap total"   value={fmtBytes(stats.process.memory.heapTotal)} />
                <StatRow label="RSS"          value={fmtBytes(stats.process.memory.rss)} />
                <StatRow label="External"     value={fmtBytes(stats.process.memory.external)} />
                <StatRow label="Node version" value={stats.process.nodeVersion} />
                <StatRow label="PID"          value={stats.process.pid} />
                <StatRow label="Uptime"       value={fmtUptime(stats.process.uptime)} />
              </CardContent>
            </Card>

            {/* OS info */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Wifi className="h-4 w-4 text-sky-500" />
                <CardTitle>System Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <Clock className="h-8 w-8 text-slate-300 shrink-0" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{fmtUptime(stats.os.uptime)}</p>
                    <p className="text-xs text-slate-500">System uptime</p>
                  </div>
                </div>
                <StatRow label="Hostname" value={stats.os.hostname} />
                <StatRow label="Platform" value={stats.os.platform} />
                <StatRow label="Arch"     value={stats.os.arch} />
                <StatRow label="CPU cores" value={stats.os.cpuCount} />
              </CardContent>
            </Card>
          </div>

          {/* Bottom row — DB record counts */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Database className="h-4 w-4 text-pink-500" />
              <CardTitle>Database Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 py-2">
                <DbCount label="Businesses"    value={stats.database.businesses} />
                <DbCount label="Users"         value={stats.database.users} />
                <DbCount label="Stores"        value={stats.database.stores} />
                <DbCount label="Products"      value={stats.database.products} />
                <DbCount label="Transactions"  value={stats.database.transactions} />
                <DbCount label="Subscriptions" value={stats.database.subscriptions} />
                <DbCount label="Audit Logs"    value={stats.database.auditLogs} />
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
