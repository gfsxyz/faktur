"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Status colors - hardcoded from globals.css
const STATUS_COLORS: Record<string, string> = {
  paid: "oklch(0.6886 0.1136 122.0697)",    // --chart-1 (green)
  sent: "oklch(0.6655 0.0902 172.4808)",    // --chart-2 (blue)
  draft: "oklch(0.5416 0.111 21.4177)",     // --chart-3 (orange)
  overdue: "oklch(0.5471 0.1438 32.9149)",  // --destructive (red)
  cancelled: "oklch(0.5532 0.145 320.2471)", // --chart-5 (purple)
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export function InvoiceStatusChart() {
  const { data, isLoading } = trpc.dashboard.getStatusDistribution.useQuery();

  if (isLoading || !data) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Invoice Status</h3>
          <p className="text-sm text-muted-foreground">
            Distribution by status
          </p>
        </div>
        <div className="h-80 animate-pulse rounded bg-muted"></div>
      </Card>
    );
  }

  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: STATUS_LABELS[item.status] || item.status,
      value: item.count,
      total: item.total,
      status: item.status,
    }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Invoice Status</h3>
        <p className="text-sm text-muted-foreground">
          Distribution by status
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.status] || "oklch(0.6679 0.0888 94.524)"}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value} invoice${value !== 1 ? "s" : ""} (${formatCurrency(props.payload.total)})`,
                props.payload.name,
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-sm">
                  {value}: {entry.payload.value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
