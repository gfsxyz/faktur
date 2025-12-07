"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { STATUS_COLORS } from "@/lib/constants/status-colors";

const CHART_COLOR = STATUS_COLORS.draft;

export function RevenueChart() {
  const [months, setMonths] = useState(6);
  const { data, isLoading } = trpc.dashboard.getRevenueOverTime.useQuery({
    months,
  });

  if (isLoading || !data) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">
            Monthly revenue from paid invoices
          </p>
        </div>
        <div className="h-80 animate-pulse rounded bg-muted"></div>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base lg:text-lg font-semibold">
            Revenue Overview
          </h3>
          <p className="text-xs lg:text-sm text-muted-foreground">
            Monthly revenue from paid invoices
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setMonths(3)}
            className={`rounded-md px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors ${
              months === 3
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            3M
          </button>
          <button
            onClick={() => setMonths(6)}
            className={`rounded-md px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors ${
              months === 6
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            6M
          </button>
          <button
            onClick={() => setMonths(12)}
            className={`rounded-md px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors ${
              months === 12
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            12M
          </button>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 5, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLOR} stopOpacity={1} />
                <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              tick={{
                fill: "var(--secondary-foreground)",
                dy: 7,
                fontSize: 12,
              }}
              tickFormatter={(month) => month.slice(0, 3)}
            />
            <YAxis
              tick={{
                fill: "var(--secondary-foreground)",
                dx: -7,
                fontSize: 12,
              }}
              tickFormatter={formatCurrency}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                padding: "8px 12px",
                color: "var(--popover-foreground)",
              }}
              itemStyle={{
                color: "var(--popover-foreground)",
                fontSize: "13px",
                fontWeight: "500",
                padding: "2px 0",
              }}
              labelStyle={{
                color: "var(--muted-foreground)",
                fontSize: "11px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "2px",
              }}
              formatter={(value: number) => [formatCurrency(value), "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLOR}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
