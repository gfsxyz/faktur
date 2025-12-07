"use client";

import { useSession } from "@/lib/auth/client";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { InvoiceStatusChart } from "@/components/dashboard/invoice-status-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-primary">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session?.user?.name}!
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Charts Row */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <RevenueChart />
        <InvoiceStatusChart />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
