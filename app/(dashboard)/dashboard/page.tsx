"use client";

import { useSession } from "@/lib/auth/client";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { InvoiceStatusChart } from "@/components/dashboard/invoice-status-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}!
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <InvoiceStatusChart />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
