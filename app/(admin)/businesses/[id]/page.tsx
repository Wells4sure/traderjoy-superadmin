import { Suspense } from "react";
import { fetchBusinessDetails } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft, Store, Users, CreditCard, Package,
  Clock, Mail, Phone, MapPin, UserCircle,
} from "lucide-react";
import { UsersTable } from "@/components/UsersTable";
import { BusinessDetailActions } from "@/components/BusinessDetailActions";
import { fmtDate, fmtDateTime, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

function subVariant(status: string) {
  if (status === "ACTIVE")  return "success" as const;
  if (status === "TRIAL")   return "info" as const;
  if (status === "EXPIRED" || status === "CANCELLED" || status === "CANCELED") return "danger" as const;
  return "gray" as const;
}

async function BusinessDetailContent({ id }: { id: string }) {
  const data = await fetchBusinessDetails(id);
  const biz: any = data.payload.business;

  const allUsers: any[]  = biz.User ?? [];
  const allStores: any[] = biz.stores ?? [];
  const allSubs: any[]   = biz.businessSubscriptions ?? [];
  const activeSubs       = allSubs.filter((s: any) => s.status === "ACTIVE" || s.status === "TRIAL");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/businesses" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-orange-500 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Businesses
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 shadow-md">
          <span className="text-white font-bold text-2xl">{biz.name?.[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 truncate">{biz.name}</h1>
            <Badge variant={biz.status === "ACTIVE" ? "success" : "danger"}>{biz.status}</Badge>
          </div>
          <p className="text-slate-500 text-sm mt-1">{biz.country?.name ?? "Unknown country"}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {activeSubs.length > 0 ? (
              activeSubs.map((s: any) => (
                <Badge key={s.id} variant={subVariant(s.status)}>
                  {s.addon?.name ?? s.status}
                </Badge>
              ))
            ) : (
              <Badge variant="gray">No active subscription</Badge>
            )}
            <Badge variant="gray">Joined {fmtDate(biz.createdAt)}</Badge>
          </div>
        </div>
        {/* Edit business button — client component island */}
        <BusinessDetailActions
          businessId={Number(biz.id)}
          businessName={biz.name}
          businessStatus={biz.status ?? "ACTIVE"}
        />
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Store,      label: "Stores",       value: allStores.length },
          { icon: Users,      label: "Users",         value: allUsers.length  },
          { icon: Package,    label: "Categories",    value: allStores.reduce((s: number, st: any) => s + (st.categories?.length ?? 0), 0) },
          { icon: CreditCard, label: "Subscriptions", value: allSubs.length   },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 py-4">
              <Icon className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xl font-bold text-slate-900">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Users */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <CardTitle>Users ({allUsers.length})</CardTitle>
            </CardHeader>
            <UsersTable users={allUsers} />
          </Card>

          {/* Stores */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Store className="h-4 w-4 text-slate-400" />
              <CardTitle>Stores ({allStores.length})</CardTitle>
            </CardHeader>
            <div className="space-y-0 divide-y divide-slate-100">
              {allStores.map((store: any) => {
                const storeUsers: any[] = store.storeUsers?.map((su: any) => su.user).filter(Boolean) ?? [];
                const lastTx = store.transactions?.[0]?.createdAt;
                return (
                  <div key={store.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{store.name}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                          {store.currency && (
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" /> {store.currency}
                            </span>
                          )}
                          {store.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {store.city}
                            </span>
                          )}
                          {store.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {store.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 text-xs text-slate-500 space-y-1">
                        <div className="flex items-center gap-1 justify-end">
                          <Users className="h-3 w-3" />
                          {storeUsers.length} staff
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <Package className="h-3 w-3" />
                          {store.categories?.length ?? 0} categories
                        </div>
                        {lastTx && (
                          <div className="flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" />
                            Last sale {timeAgo(lastTx)}
                          </div>
                        )}
                      </div>
                    </div>
                    {storeUsers.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {storeUsers.map((u: any) => (
                          <span key={u.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                            {u.name ?? u.email}
                            <Badge variant={u.role === "OWNER" ? "warning" : "gray"} className="text-[9px] py-0 px-1.5">{u.role}</Badge>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Subscriptions — client island for add/edit */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
                <CardTitle>Subscriptions</CardTitle>
              </div>
            </CardHeader>
            {/* Pass subscription data to the client actions component */}
            <BusinessDetailActions
              businessId={Number(biz.id)}
              businessName={biz.name}
              businessStatus={biz.status ?? "ACTIVE"}
              subscriptions={allSubs}
              subscriptionsOnly
            />
          </Card>

          {/* Recent Transactions */}
          {allStores.some((s: any) => s.transactions?.length > 0) && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                {allStores
                  .flatMap((s: any) =>
                    (s.transactions ?? []).map((tx: any) => ({ ...tx, storeName: s.name }))
                  )
                  .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 8)
                  .map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-xs font-medium text-slate-900">{tx.storeName}</p>
                        <p className="text-[10px] text-slate-400">{fmtDateTime(tx.createdAt)}</p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Owner contact */}
          {allUsers[0] && (
            <Card>
              <CardHeader>
                <CardTitle>Owner Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <UserCircle className="h-4 w-4 text-slate-400" />
                  {allUsers[0].name || "—"}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {allUsers[0].email}
                </div>
                {allUsers[0].phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {allUsers[0].phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-500 text-xs pt-1">
                  <Clock className="h-3.5 w-3.5" />
                  Last login {timeAgo(allUsers[0].lastLogin)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-20 rounded-xl bg-slate-200 animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <BusinessDetailContent id={id} />
    </Suspense>
  );
}
