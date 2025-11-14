"use client";

import { trpc } from "@/lib/trpc/client";
import { StatCard } from "./stat-card";
import {
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

export function DashboardStats() {
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg bg-muted"
          ></div>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        description="From paid invoices"
        icon={DollarSign}
      />
      <StatCard
        title="Outstanding"
        value={formatCurrency(stats.outstandingAmount)}
        description={`${stats.unpaidInvoicesCount} unpaid invoice${stats.unpaidInvoicesCount !== 1 ? "s" : ""}`}
        icon={Clock}
      />
      <StatCard
        title="Paid Invoices"
        value={stats.paidInvoicesCount}
        description={`Out of ${stats.totalInvoices} total`}
        icon={CheckCircle}
      />
      <StatCard
        title="Overdue"
        value={stats.overdueInvoicesCount}
        description="Requires attention"
        icon={AlertCircle}
      />
    </div>
  );
}
