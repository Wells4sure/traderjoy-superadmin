"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { timeAgo } from "@/lib/utils";

const PAGE_SIZE = 10;

function subscriptionVariant(status: string) {
  if (status === "ACTIVE") return "success" as const;
  if (status === "TRIAL")  return "info" as const;
  if (status === "EXPIRED" || status === "CANCELLED") return "danger" as const;
  return "gray" as const;
}

export function DashboardBusinessTable({ businesses }: { businesses: any[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(businesses.length / PAGE_SIZE);
  const slice = businesses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Business</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Country</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stores</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Users</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Subscription</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slice.map((biz: any) => (
              <tr key={biz.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-slate-900">{biz.name}</p>
                  <p className="text-xs text-slate-400">{biz.User?.[0]?.email ?? "—"}</p>
                </td>
                <td className="px-5 py-3.5 text-slate-600 text-sm">{biz.country?.name ?? "—"}</td>
                <td className="px-4 py-3.5 text-center font-medium text-slate-700">{biz.stats?.totalStores ?? 0}</td>
                <td className="px-4 py-3.5 text-center font-medium text-slate-700">{biz.stats?.totalUsers ?? 0}</td>
                <td className="px-4 py-3.5">
                  {biz.activeSubscription ? (
                    <Badge variant={subscriptionVariant(biz.activeSubscription.status)}>
                      {biz.activeSubscription.addon?.name ?? biz.activeSubscription.status}
                    </Badge>
                  ) : (
                    <Badge variant="gray">None</Badge>
                  )}
                </td>
                <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{timeAgo(biz.stats?.lastActivityAt)}</td>
                <td className="px-4 py-3.5">
                  <Link href={`/businesses/${biz.id}`} className="text-xs text-orange-500 hover:underline font-medium">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={businesses.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </>
  );
}
