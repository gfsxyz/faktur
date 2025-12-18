"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ChartNoAxesColumn } from "lucide-react";
import EmptyState from "../ui/empty-state";
import { formatCurrencyForChart } from "@/lib/utils/money";
import { getChartDateRangeText } from "@/lib/utils/chart";

const CHART_COLOR = "var(--primary)";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        backgroundColor: "var(--popover)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        padding: "8px 12px",
        color: "var(--popover-foreground)",
      }}
    >
      <p
        style={{
          color: "var(--muted-foreground)",
          fontSize: "11px",
          fontWeight: "500",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "4px",
        }}
      >
        {label}
      </p>
      {payload.map((entry: any, index: number) => {
        const isPaid = entry.dataKey === "paid";
        return (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "2px 0",
            }}
          >
            <svg width="20" height="2" style={{ flexShrink: 0 }}>
              <line
                x1="0"
                y1="1"
                x2="20"
                y2="1"
                stroke={CHART_COLOR}
                strokeWidth="2"
                strokeDasharray={isPaid ? "0" : "4 2"}
              />
            </svg>
            <span
              style={{
                color: "var(--popover-foreground)",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              {isPaid ? "Paid" : "Sent"}: {formatCurrencyForChart(entry.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export function RevenueChart() {
  const [months, setMonths] = useState(6);
  const { data, isLoading } = trpc.dashboard.getRevenueOverTime.useQuery(
    {
      months,
    },
    {
      placeholderData: (previousData) => previousData,
    }
  );

  const dateRangeText = useMemo(
    () => getChartDateRangeText(data, "No revenue data"),
    [data]
  );

  if (isLoading && !data) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">{dateRangeText}</p>
        </div>
        <div className="h-80 animate-pulse bg-muted"></div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base lg:text-lg font-semibold">
            Revenue Overview
          </h3>
          <p className="text-xs lg:text-sm text-muted-foreground">
            {dateRangeText}
          </p>
        </div>
        {data && (
          <Select
            value={String(months)}
            onValueChange={(value) => setMonths(Number(value))}
          >
            <SelectTrigger className="w-30 text-xs lg:text-sm" size="sm">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Months</SelectItem>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="h-80 outline-none **:outline-none">
        {data ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 5, bottom: 0 }}
            >
              <defs>
                <pattern
                  id="diagonalHatch"
                  patternUnits="userSpaceOnUse"
                  width="10"
                  height="10"
                  patternTransform="rotate(-45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="10"
                    stroke={CHART_COLOR}
                    strokeWidth="1"
                    opacity="1"
                  />
                </pattern>

                <linearGradient id="fadeMask" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="70%" stopColor="white" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>

                <mask id="areaFadeMask">
                  <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="url(#fadeMask)"
                  />
                </mask>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                opacity={0.5}
              />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{
                  dy: 7,
                  fontSize: 12,
                }}
                tickFormatter={(month) => month.slice(0, 3)}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  dx: -2,
                  fontSize: 12,
                }}
                tickFormatter={formatCurrencyForChart}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="linear"
                dataKey="sent"
                stroke={CHART_COLOR}
                strokeWidth={2}
                strokeDasharray="5 5"
                strokeOpacity={0.5}
                fillOpacity={0}
                fill="transparent"
              />
              <Area
                type="linear"
                dataKey="paid"
                stroke={CHART_COLOR}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#diagonalHatch)"
                mask="url(#areaFadeMask)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={<ChartNoAxesColumn size={44} />} />
        )}
      </div>
    </Card>
  );
}
