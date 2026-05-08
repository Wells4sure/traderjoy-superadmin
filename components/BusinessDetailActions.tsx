"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, AlertCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { EditBusinessModal } from "@/components/EditBusinessModal";
import { SubscriptionModal } from "@/components/SubscriptionModal";

type Status = "ACTIVE" | "INACTIVE" | "EXPIRED" | "CANCELLED";
type SubStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "EXPIRED" | "CANCELED";

type BillingCycle = "MONTHLY" | "YEARLY";

interface Subscription {
  id: number;
  addon: { id: number; name: string; category: string };
  status: SubStatus;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string | null;
  trialEndDate: string | null;
}

interface Props {
  businessId: number;
  businessName: string;
  businessStatus: Status;
  subscriptions?: Subscription[];
  subscriptionsOnly?: boolean;
}

function subVariant(status: string) {
  if (status === "ACTIVE")  return "success" as const;
  if (status === "TRIAL")   return "info" as const;
  if (status === "EXPIRED" || status === "CANCELLED" || status === "CANCELED") return "danger" as const;
  if (status === "SUSPENDED" || status === "PAST_DUE") return "warning" as const;
  return "gray" as const;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function BusinessDetailActions({
  businessId,
  businessName,
  businessStatus,
  subscriptions = [],
  subscriptionsOnly = false,
}: Props) {
  const router = useRouter();
  const [editBusiness, setEditBusiness] = useState(false);
  const [addSub, setAddSub] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  function refresh() {
    router.refresh();
  }

  // Subscriptions-only mode: renders the subscriptions panel inside the card
  if (subscriptionsOnly) {
    return (
      <>
        <CardContent className="space-y-3 pt-2">
          {subscriptions.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
              <AlertCircle className="h-4 w-4" />
              No subscriptions found
            </div>
          ) : (
            subscriptions.map((s) => (
              <div key={s.id} className="rounded-lg border border-slate-100 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900 text-sm truncate">{s.addon?.name ?? "Unknown Plan"}</p>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={subVariant(s.status)}>{s.status}</Badge>
                    <button
                      onClick={() => setEditingSub(s)}
                      className="text-slate-400 hover:text-orange-500 transition-colors"
                      title="Edit subscription"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {s.addon?.category && (
                  <p className="text-xs text-slate-500">Category: {s.addon.category}</p>
                )}
                <div className="flex flex-col gap-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Started {fmtDate(s.startDate)}
                  </span>
                  {s.endDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Ends {fmtDate(s.endDate)}
                    </span>
                  )}
                  {s.trialEndDate && (
                    <span className="flex items-center gap-1.5 text-sky-600">
                      <AlertCircle className="h-3 w-3" />
                      Trial ends {fmtDate(s.trialEndDate)}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-slate-400">
                    {s.billingCycle}
                  </span>
                </div>
              </div>
            ))
          )}

          <button
            onClick={() => setAddSub(true)}
            className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors pt-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Subscription
          </button>
        </CardContent>

        {addSub && (
          <SubscriptionModal
            businessId={businessId}
            onClose={() => setAddSub(false)}
            onSaved={refresh}
          />
        )}
        {editingSub && (
          <SubscriptionModal
            businessId={businessId}
            subscription={editingSub}
            onClose={() => setEditingSub(null)}
            onSaved={refresh}
          />
        )}
      </>
    );
  }

  // Header edit button mode
  return (
    <>
      <button
        onClick={() => setEditBusiness(true)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-orange-300 hover:text-orange-600 transition-colors shrink-0"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit Business
      </button>

      {editBusiness && (
        <EditBusinessModal
          business={{ id: businessId, name: businessName, status: businessStatus }}
          onClose={() => setEditBusiness(false)}
          onSaved={refresh}
        />
      )}
    </>
  );
}
