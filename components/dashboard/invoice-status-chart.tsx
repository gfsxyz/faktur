"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants/status-colors";

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

  const totalInvoices = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-6 gap-6 lg:gap-11">
      <div>
        <h3 className="text-base lg:text-lg font-semibold">Invoice Status</h3>
        <p className="text-xs lg:text-sm text-muted-foreground">
          Distribution by status
        </p>
      </div>

      <div className="space-y-6">
        <div className="w-full max-w-sm mx-auto h-48 lg:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="100%"
                dataKey="value"
                stroke="var(--card)"
                strokeWidth={4}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      STATUS_COLORS[entry.status] ||
                      "oklch(0.6679 0.0888 94.524)"
                    }
                  />
                ))}
              </Pie>
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
                formatter={(value: number, name: string, props: any) => [
                  `${value} (${formatCurrency(props.payload.total)})`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-w-md mx-auto">
          {chartData.map((item, index) => {
            const percentage = ((item.value / totalInvoices) * 100).toFixed(0);
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[item.status] }}
                />
                <span className="text-xs font-medium truncate">
                  {item.name}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
