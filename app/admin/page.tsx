import type { Metadata } from "next";
import { getAdminOverviewStats } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { OverviewCharts } from "@/components/admin/overview-charts";

export const metadata: Metadata = { title: "Admin Overview — Wanderlust" };

export default async function AdminOverviewPage() {
  const stats = await getAdminOverviewStats();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Overview</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} />
        <StatCard label="Listings" value={`${stats.activeListings} / ${stats.totalListings}`} sub="active / total" />
        <StatCard label="Users" value={String(stats.totalUsers)} />
        <StatCard label="Bookings" value={`${stats.confirmedBookings} / ${stats.totalBookings}`} sub="confirmed / total" />
      </div>

      <div className="mt-6">
        <OverviewCharts data={stats.dailySeries} />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
