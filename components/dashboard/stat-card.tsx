"use client";

import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Repeat2 } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    absoluteDelta?: string;
  };
}

const POSITIVE_COLOR = "#00bc7d";
const NEGATIVE_COLOR = "#ef4444";

export function StatCard({ title, value, description, trend }: StatCardProps) {
  const valueStr = String(value);
  const getValueFontSize = () => {
    const length = valueStr.length;
    if (length <= 5) return "text-xl lg:text-2xl";
    if (length <= 10) return "text-lg lg:text-xl";
    if (length <= 15) return "text-base lg:text-lg";
    return "text-sm lg:text-base";
  };

  return (
    <Card
      className="p-4 pb-3 lg:px-6 transition-all duration-200 justify-center min-w-min"
      withPatterns
    >
      <div className="space-y-1 lg:space-y-1.5">
        <p className="text-[9px] lg:text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>

        <div className="flex items-baseline gap-2">
          <h3 className={`${getValueFontSize()} font-bold tracking-tight`}>
            {value}
          </h3>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.value === 0 ? (
                <>
                  <Repeat2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    0%
                  </span>
                </>
              ) : (
                <>
                  {trend.value > 0 ? (
                    <ArrowUp
                      className="h-3 w-3"
                      style={{
                        color: trend.isPositive
                          ? POSITIVE_COLOR
                          : NEGATIVE_COLOR,
                      }}
                    />
                  ) : (
                    <ArrowDown
                      className="h-3 w-3"
                      style={{
                        color: trend.isPositive
                          ? POSITIVE_COLOR
                          : NEGATIVE_COLOR,
                      }}
                    />
                  )}
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: trend.isPositive ? POSITIVE_COLOR : NEGATIVE_COLOR,
                    }}
                  >
                    {Math.abs(trend.value)}%
                  </span>
                  {trend.absoluteDelta && (
                    <span
                      className="hidden sm:inline text-xs font-medium opacity-70"
                      style={{
                        color: trend.isPositive
                          ? POSITIVE_COLOR
                          : NEGATIVE_COLOR,
                      }}
                    >
                      ({trend.absoluteDelta})
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {description && (
          <p className="text-[9px] lg:text-[10px] text-muted-foreground/80 line-clamp-1 lg:line-clamp-none">
            {trend && trend.value === 0
              ? "No change from last month"
              : description}
          </p>
        )}
      </div>
    </Card>
  );
}
