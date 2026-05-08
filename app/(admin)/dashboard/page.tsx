import { Suspense } from "react";
import { fetchAnalytics } from "@/lib/api";
import { fmt } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Building2, Users, Store, Package, Receipt,
  CreditCard, TrendingUp, UserCheck, Flame,
} from "lucide-react";
import { DashboardBusinessTable } from "@/components/DashboardBusinessTable";

export const dynamic = "force-dynamic";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{fmt(Number(value))}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

async function DashboardContent() {
  const data = await fetchAnalytics();
  const { businesses, globalStats, recentActivity } = data.payload;

  const sortedBusinesses = [...businesses].sort((a: any, b: any) => {
    const aDate = new Date(a.stats?.lastActivityAt ?? 0).getTime();
    const bDate = new Date(b.stats?.lastActivityAt ?? 0).getTime();
    return bDate - aDate;
  });

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-slate-500 text-sm mt-1">All-time statistics across the entire TraderJoy platform</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Building2} label="Businesses"        value={globalStats.totalBusinesses}    color="bg-violet-500" />
        <StatCard icon={Store}     label="Stores"            value={globalStats.totalStores}         color="bg-blue-500"   />
        <StatCard icon={Users}     label="Users"             value={globalStats.totalUsers}          color="bg-sky-500"    />
        <StatCard icon={Package}   label="Products"          value={globalStats.totalProducts}       color="bg-emerald-500"/>
        <StatCard icon={Receipt}   label="Transactions"      value={globalStats.totalTransactions}   color="bg-orange-500" />
        <StatCard icon={CreditCard}label="Active Subs"       value={globalStats.activeSubscriptions} color="bg-pink-500"   />
      </div>

      {/* Last 30 days activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            Last 30 Days
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 py-5">
          {[
            { label: "New Businesses", value: recentActivity.newBusinesses, icon: Building2 },
            { label: "New Users",      value: recentActivity.newUsers,      icon: Users },
            { label: "New Stores",     value: recentActivity.newStores,     icon: Store },
            { label: "Active Users",   value: recentActivity.activeUsers,   icon: UserCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xl font-bold text-slate-900">{fmt(value)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent businesses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Most Recently Active Businesses
          </CardTitle>
          <Link href="/businesses" className="text-xs text-orange-500 hover:underline font-medium">
            View all →
          </Link>
        </CardHeader>
        <DashboardBusinessTable businesses={sortedBusinesses} />
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-6 gap-4 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-slate-200 animate-pulse" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
