"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants/status-colors";
import EmptyState from "../ui/empty-state";
import { LandPlot } from "lucide-react";
import { useState, memo, useCallback, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrencyForChart } from "@/lib/utils/money";
import { cn } from "@/lib/utils";
import { getChartDateRangeText } from "@/lib/utils/chart";

const ALL_STATUSES = ["paid", "sent", "overdue", "draft", "cancelled"] as const;

const CustomTooltip = memo(
  ({
    active,
    payload,
    label,
    metric,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
    metric: "count" | "amount";
  }) => {
    if (active && payload && payload.length) {
      // Reverse the payload to match visual stacking order (top to bottom)
      const reversedPayload = [...payload].reverse();

      return (
        <div className="rounded-md border border-border/50 bg-popover/95 px-3 py-2 text-sm shadow-lg">
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
          <div className="flex flex-col gap-1">
            {reversedPayload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        STATUS_COLORS[
                          entry.dataKey as keyof typeof STATUS_COLORS
                        ],
                    }}
                  />
                  <span className="text-xs text-muted-foreground capitalize">
                    {STATUS_LABELS[
                      entry.dataKey as keyof typeof STATUS_LABELS
                    ] || entry.name}
                  </span>
                </div>
                <span className="font-mono text-xs font-medium tabular-nums text-foreground">
                  {metric === "amount"
                    ? formatCurrencyForChart(entry.value)
                    : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  }
);
CustomTooltip.displayName = "CustomTooltip";

const CustomLegend = memo(
  (props: any) => {
    const {
      payload,
      onMouseEnter,
      onMouseLeave,
      hoveredStatus,
      hiddenStatuses,
      onToggle,
    } = props;
    return (
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-4">
        {payload.map((entry: any, index: number) => {
          const isHidden = hiddenStatuses.has(entry.value);
          return (
            <div
              key={`item-${index}`}
              className={cn(
                "flex cursor-pointer items-center gap-2 text-xs transition-opacity select-none",
                isHidden && "opacity-50",
                !isHidden &&
                  hoveredStatus &&
                  hoveredStatus !== entry.value &&
                  "opacity-30"
              )}
              onMouseEnter={() => !isHidden && onMouseEnter(entry.value)}
              onMouseLeave={onMouseLeave}
              onClick={() => onToggle(entry.value)}
            >
              <div
                className="h-2 w-2"
                style={{
                  backgroundColor:
                    STATUS_COLORS[entry.value as keyof typeof STATUS_COLORS] ||
                    entry.color,
                }}
              />
              <span className="font-medium text-muted-foreground">
                {STATUS_LABELS[entry.value as keyof typeof STATUS_LABELS] ||
                  entry.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.hoveredStatus === nextProps.hoveredStatus &&
      prevProps.hiddenStatuses === nextProps.hiddenStatuses &&
      prevProps.payload === nextProps.payload
    );
  }
);
CustomLegend.displayName = "CustomLegend";

export function InvoiceStatusChart() {
  const [metric, setMetric] = useState<"count" | "amount">("count");
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<string>>(new Set());
  const { data, isLoading } = trpc.dashboard.getStatusOverTime.useQuery(
    {
      months: 12,
      metric,
    },
    {
      placeholderData: (previousData) => previousData,
    }
  );

  const handleMouseEnter = useCallback((status: string) => {
    setHoveredStatus(status);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredStatus(null);
  }, []);

  const handleToggleStatus = useCallback((status: string) => {
    setHiddenStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      if (ALL_STATUSES.every((s) => next.has(s))) {
        return new Set();
      }
      return next;
    });
  }, []);

  const hasData = useMemo(
    () =>
      data?.some(
        (item) =>
          item.paid > 0 ||
          item.sent > 0 ||
          item.overdue > 0 ||
          item.draft > 0 ||
          item.cancelled > 0
      ),
    [data]
  );

  const dateRangeText = useMemo(
    () => getChartDateRangeText(data, "No data found"),
    [data]
  );

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base lg:text-lg font-semibold">
              Invoice Status
            </h3>
            <p className="text-xs lg:text-sm text-muted-foreground">
              {dateRangeText}
            </p>
          </div>
        </div>
        <div className="h-80 animate-pulse rounded bg-muted"></div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base lg:text-lg font-semibold">Invoice Status</h3>
          <p className="text-xs lg:text-sm text-muted-foreground">
            {dateRangeText}
          </p>
        </div>
        {hasData && (
          <Tabs
            value={metric}
            onValueChange={(v) => setMetric(v as "count" | "amount")}
          >
            <TabsList>
              <TabsTrigger value="count">Count</TabsTrigger>
              <TabsTrigger value="amount">Amount</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
      <div className="h-80 outline-none **:outline-none">
        {hasData && data ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 25, bottom: 0 }}
              maxBarSize={12}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <pattern
                    key={`hatch-${status}`}
                    id={`hatch-${status}`}
                    patternUnits="userSpaceOnUse"
                    width="4"
                    height="4"
                    patternTransform="rotate(-45)"
                  >
                    <rect width="4" height="4" fill={color} />
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="4"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1.5"
                    />
                  </pattern>
                ))}
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
                tick={{ dy: 10, fontSize: 12, fill: "var(--muted-foreground)" }}
                tickFormatter={(month) => month.slice(0, 3)}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  dx: -10,
                  fontSize: 12,
                  fill: "var(--muted-foreground)",
                }}
                tickFormatter={
                  metric === "amount" ? formatCurrencyForChart : undefined
                }
                width={45}
              />

              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                content={<CustomTooltip metric={metric} />}
              />

              <Legend
                verticalAlign="bottom"
                content={
                  <CustomLegend
                    hoveredStatus={hoveredStatus}
                    hiddenStatuses={hiddenStatuses}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onToggle={handleToggleStatus}
                  />
                }
              />

              {ALL_STATUSES.map((status, index, array) => (
                <Bar
                  key={status}
                  dataKey={status}
                  stackId="status"
                  fill={`url(#hatch-${status})`}
                  fillOpacity={
                    hiddenStatuses.has(status)
                      ? 0
                      : hoveredStatus && hoveredStatus !== status
                      ? 0.3
                      : 1
                  }
                  stroke={STATUS_COLORS[status]}
                  strokeWidth={0.5}
                  isAnimationActive={true}
                  animationDuration={300}
                  animationEasing="ease-out"
                  onMouseEnter={() => handleMouseEnter(status)}
                  hide={hiddenStatuses.has(status)}
                  radius={
                    index === array.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={<LandPlot size={44} />} />
        )}
      </div>
    </Card>
  );
}
