"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Trash2, CheckCircle2, XCircle, Info } from "lucide-react";

type SubStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "EXPIRED" | "CANCELED";
type BillingCycle = "MONTHLY" | "YEARLY";

interface Addon {
  id: number;
  name: string;
  category: string;
}

interface Subscription {
  id: number;
  addon: Addon;
  status: SubStatus;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string | null;
  trialEndDate: string | null;
}

interface Props {
  businessId: number;
  subscription?: Subscription; // undefined = add mode
  onClose: () => void;
  onSaved: () => void;
}

function toInputDate(iso: string | null | undefined) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function SubscriptionModal({ businessId, subscription, onClose, onSaved }: Props) {
  const isEdit = !!subscription;

  const [addons, setAddons] = useState<Addon[]>([]);
  const [addonId, setAddonId] = useState<number>(subscription?.addon.id ?? 0);
  const [status, setStatus] = useState<SubStatus>(subscription?.status ?? "TRIAL");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(subscription?.billingCycle ?? "MONTHLY");
  const [startDate, setStartDate] = useState(toInputDate(subscription?.startDate));
  const [endDate, setEndDate] = useState(toInputDate(subscription?.endDate));
  const [trialEndDate, setTrialEndDate] = useState(toInputDate(subscription?.trialEndDate));

  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [error, setError] = useState("");
  const [loadingAddons, setLoadingAddons] = useState(!isEdit);
  const [removeLogs, setRemoveLogs] = useState<{ msg: string; type: "info" | "ok" | "err" }[]>([]);

  function addLog(msg: string, type: "info" | "ok" | "err" = "info") {
    setRemoveLogs((prev) => [...prev, { msg, type }]);
  }

  useEffect(() => {
    if (isEdit) return;
    fetch("/api/super-admin/addons")
      .then((r) => r.json())
      .then((d) => {
        const list: Addon[] = d.payload?.addons ?? [];
        setAddons(list);
        if (list.length > 0) setAddonId(list[0].id);
      })
      .catch(() => setError("Failed to load add-ons"))
      .finally(() => setLoadingAddons(false));
  }, [isEdit]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const body = {
        ...(isEdit ? {} : { addonId }),
        status,
        billingCycle,
        startDate: startDate || undefined,
        endDate: endDate || null,
        trialEndDate: trialEndDate || null,
      };

      const url = isEdit
        ? `/api/super-admin/businesses/${businessId}/subscriptions/${subscription!.id}`
        : `/api/super-admin/businesses/${businessId}/subscriptions`;

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save");
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    setError("");
    setRemoveLogs([]);
    try {
      const subName = subscription!.addon.name;
      addLog(`Preparing to remove "${subName}" (id: ${subscription!.id})…`);
      addLog(`Sending DELETE request to server…`);

      const res = await fetch(
        `/api/super-admin/businesses/${businessId}/subscriptions/${subscription!.id}`,
        { method: "DELETE" },
      );

      addLog(`Server responded with status ${res.status}`);
      const json = await res.json();

      if (!res.ok) {
        addLog(`Error: ${json.error ?? "Unknown error"}`, "err");
        throw new Error(json.error ?? "Failed to remove");
      }

      if (json?.payload?.deleted) {
        addLog(`Confirmed deleted: addon="${json.payload.deleted.addon}" status=${json.payload.deleted.status}`, "ok");
      }
      addLog(`Subscription removed successfully. Refreshing page…`, "ok");

      // Small pause so user can see the success log before modal closes
      await new Promise((r) => setTimeout(r, 800));
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            {isEdit ? `Edit Subscription — ${subscription!.addon.name}` : "Add Subscription"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Addon selector — only in add mode */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Add-on Plan</label>
              {loadingAddons ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading plans…
                </div>
              ) : (
                <select
                  value={addonId}
                  onChange={(e) => setAddonId(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {addons.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.category})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubStatus)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="TRIAL">Trial</option>
                <option value="ACTIVE">Active</option>
                <option value="PAST_DUE">Past Due</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Billing Cycle</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {status === "TRIAL" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Trial End Date</label>
              <input
                type="date"
                value={trialEndDate}
                onChange={(e) => setTrialEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          )}

          {(status === "ACTIVE" || status === "EXPIRED") && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                End Date <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        {/* Removal log panel */}
        {removeLogs.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-950 px-3 py-2.5 space-y-1 font-mono text-[11px]">
            {removeLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-1.5">
                {log.type === "ok"  && <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />}
                {log.type === "err" && <XCircle      className="h-3 w-3 text-red-400    mt-0.5 shrink-0" />}
                {log.type === "info"&& <Info         className="h-3 w-3 text-slate-400  mt-0.5 shrink-0" />}
                <span className={
                  log.type === "ok"  ? "text-emerald-400" :
                  log.type === "err" ? "text-red-400"     :
                  "text-slate-300"
                }>{log.msg}</span>
              </div>
            ))}
            {removing && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                <span>Working…</span>
              </div>
            )}
          </div>
        )}

        {/* Confirm remove prompt */}
        {confirmRemove && !removing && removeLogs.length === 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 space-y-2">
            <p className="text-xs font-medium text-red-700">
              Remove <strong>{subscription!.addon.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRemove}
                className="flex items-center gap-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-medium transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Yes, remove
              </button>
              <button
                onClick={() => setConfirmRemove(false)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          {isEdit && !confirmRemove && removeLogs.length === 0 && (
            <button
              onClick={() => setConfirmRemove(true)}
              disabled={removing}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (loadingAddons && !isEdit) || confirmRemove || removing}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEdit ? "Save Changes" : "Add Subscription"}
          </button>
        </div>
      </div>
    </div>
  );
}
