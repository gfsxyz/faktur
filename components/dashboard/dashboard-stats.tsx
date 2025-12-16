"use client";

import { trpc } from "@/lib/trpc/client";
import { StatCard } from "./stat-card";

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  return (
    <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={formatCompactCurrency(stats.totalRevenue)}
        description={`${formatCurrency(stats.totalRevenue)} paid invoices`}
      />
      <StatCard
        title="Outstanding"
        value={formatCompactCurrency(stats.outstandingAmount)}
        description={`${stats.unpaidInvoicesCount} unpaid invoice${
          stats.unpaidInvoicesCount !== 1 ? "s" : ""
        }`}
      />
      <StatCard
        title="Paid Invoices"
        value={stats.paidInvoicesCount}
        description={`${Math.round(
          (stats.paidInvoicesCount / stats.totalInvoices) * 100
        )}% of ${stats.totalInvoices}`}
      />
      <StatCard
        title="Overdue"
        value={stats.overdueInvoicesCount}
        description={
          stats.overdueInvoicesCount > 0 ? "Action needed" : "All caught up!"
        }
      />
    </div>
  );
}
