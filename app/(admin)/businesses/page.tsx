import { Suspense } from "react";
import { fetchAnalytics } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { BusinessTable } from "@/components/BusinessTable";

export const dynamic = "force-dynamic";

async function BusinessList() {
  const data = await fetchAnalytics();
  const businesses: any[] = data.payload.businesses;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Businesses</h1>
          <p className="text-slate-500 text-sm mt-1">{businesses.length} onboarded businesses</p>
        </div>
      </div>

      <Card>
        <BusinessTable businesses={businesses} />
      </Card>
    </div>
  );
}

export default function BusinessesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <div className="h-8 w-36 rounded bg-slate-200 animate-pulse" />
          <div className="h-96 rounded-xl bg-slate-200 animate-pulse" />
        </div>
      }
    >
      <BusinessList />
    </Suspense>
  );
}
