"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { fmtDate, timeAgo } from "@/lib/utils";

const PAGE_SIZE = 15;

function subscriptionVariant(status: string) {
  if (status === "ACTIVE")  return "success" as const;
  if (status === "TRIAL")   return "info" as const;
  if (status === "EXPIRED" || status === "CANCELLED") return "danger" as const;
  return "gray" as const;
}

export function BusinessTable({ businesses }: { businesses: any[] }) {
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Country</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stores</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Users</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Active</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Subscriptions</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slice.map((biz) => {
              const activeSubs = biz.businessSubscriptions?.filter(
                (s: any) => s.status === "ACTIVE" || s.status === "TRIAL",
              ) ?? [];
              return (
                <tr key={biz.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">{biz.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{biz.name}</p>
                        <p className="text-xs text-slate-400">{biz.User?.[0]?.email ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Globe className="h-3.5 w-3.5 text-slate-400" />
                      {biz.country?.name ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-slate-700 font-medium">{biz.stats?.totalStores ?? 0}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-slate-700 font-medium">{biz.stats?.totalUsers ?? 0}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-slate-700 font-medium">{biz.stats?.activeUsersCount ?? 0}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {activeSubs.length > 0 ? (
                        activeSubs.map((s: any) => (
                          <Badge key={s.id} variant={subscriptionVariant(s.status)}>
                            {s.addon?.name ?? s.status}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="gray">None</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">{fmtDate(biz.createdAt)}</td>
                  <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">{timeAgo(biz.stats?.lastActivityAt)}</td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/businesses/${biz.id}`}
                      className="flex items-center gap-1 text-orange-500 hover:text-orange-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
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
