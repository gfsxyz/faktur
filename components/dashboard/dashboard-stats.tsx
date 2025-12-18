"use client";

import { trpc } from "@/lib/trpc/client";
import { StatCard } from "./stat-card";
import { formatCurrencyForChart } from "@/lib/utils/money";

export function DashboardStats() {
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();

  if (isLoading || !stats) {
    return (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-20 lg:h-24 animate-pulse rounded-lg bg-muted/50"
          />
        ))}
      </div>
    );
  }

  const formatDelta = (value: number, isCurrency: boolean = false) => {
    const sign = value >= 0 ? "+" : "";
    if (isCurrency) {
      return `${sign}${formatCurrencyForChart(Math.abs(value))}`;
    }
    return `${sign}${value}`;
  };

  return (
    <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={formatCurrencyForChart(stats.totalRevenue)}
        description="from last month"
        trend={{
          value: stats.trends.revenue,
          isPositive: stats.trends.revenue > 0,
          absoluteDelta: formatDelta(stats.absoluteDeltas.revenue, true),
        }}
      />
      <StatCard
        title="Outstanding"
        value={formatCurrencyForChart(stats.outstandingAmount)}
        description={`from last month${
          stats.overduePercentage > 0
            ? ` - ${stats.overduePercentage}% overdue`
            : ""
        }`}
        trend={{
          value: stats.trends.outstanding,
          isPositive: stats.trends.outstanding < 0,
          absoluteDelta: formatDelta(stats.absoluteDeltas.outstanding, true),
        }}
      />
      <StatCard
        title="Payment Rate"
        value={`${stats.paymentRate}%`}
        description="from last month"
        trend={{
          value: stats.trends.paymentRate,
          isPositive: stats.trends.paymentRate > 0,
          absoluteDelta: `${formatDelta(stats.absoluteDeltas.paymentRate)}%`,
        }}
      />
      <StatCard
        title="Overdue"
        value={stats.overdueInvoicesCount}
        description="from last month"
        trend={{
          value: stats.trends.overdue,
          isPositive: stats.trends.overdue < 0,
          absoluteDelta: formatDelta(stats.absoluteDeltas.overdue),
        }}
      />
    </div>
  );
}
