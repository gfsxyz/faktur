"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isToday, isYesterday } from "date-fns";
import Link from "next/link";
import { ChevronRight, Shredder } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants/status-colors";
import EmptyState from "../ui/empty-state";

export function RecentActivity() {
  const { data: activities, isLoading } =
    trpc.dashboard.getRecentActivity.useQuery({
      limit: 5,
    });

  if (isLoading || !activities) {
    return (
      <Card className="border-muted/40 backdrop-blur-sm">
        <div className="border-b border-border/40 px-5 py-4">
          <h3 className="font-semibold tracking-tight">Recent Activity</h3>
          <p className="text-xs text-muted-foreground/80">
            Latest invoice updates
          </p>
        </div>
        <div className="divide-y divide-border/40 p-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 px-2">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-muted/50"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-24 animate-pulse rounded bg-muted/50"></div>
                <div className="h-3 w-32 animate-pulse rounded bg-muted/30"></div>
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-muted/50"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTimeGroup = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return "Earlier";
  };

  const groupedActivities = activities?.reduce((acc, activity) => {
    const date = new Date(activity.updatedAt);
    const group = getTimeGroup(date);
    if (!acc[group]) acc[group] = [];
    acc[group].push(activity);
    return acc;
  }, {} as Record<string, typeof activities>);

  if (activities.length === 0) {
    return (
      <Card className="border-muted/40 backdrop-blur-sm">
        <div className="px-5">
          <h3 className="font-semibold tracking-tight">Recent Activity</h3>
          <p className="text-xs text-muted-foreground/80">
            Latest invoice updates
          </p>
        </div>

        <div className="h-80">
          <EmptyState
            icon={<Shredder size={44} />}
            description="No recent activity"
          />
        </div>
      </Card>
    );
  }

  const timeOrder = ["Today", "Yesterday", "Earlier"];

  return (
    <Card className="border-muted/40 backdrop-blur-sm px-4">
      <div className="px-4">
        <Link
          href="/dashboard/invoices"
          className="hover:underline underline-offset-2"
          title="view all"
          aria-label="view all"
        >
          <h3 className="font-semibold tracking-tight">Recent Activity</h3>
        </Link>
        <p className="text-xs text-muted-foreground/80">
          Latest invoice updates
        </p>
      </div>
      <div>
        {timeOrder.map(
          (timeGroup) =>
            groupedActivities?.[timeGroup] && (
              <div key={timeGroup}>
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground/70">
                  {timeGroup}
                </div>
                <div className="divide-y divide-border/40">
                  {groupedActivities[timeGroup].map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/dashboard/invoices/${activity.id}`}
                      className="group flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:bg-accent/50 active:bg-accent"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium truncate">
                            {activity.invoiceNumber}
                          </p>
                          <Badge
                            className="shrink-0 px-2 py-0 text-[10px] font-medium"
                            style={{
                              backgroundColor: STATUS_COLORS[activity.status],
                              color: "white",
                              border: "none",
                            }}
                          >
                            {STATUS_LABELS[activity.status] || activity.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs text-muted-foreground/80 truncate">
                            {activity.clientName || "No client"}
                          </p>
                          {activity.clientCompany && (
                            <p className="text-[10px] text-muted-foreground/60 truncate">
                              {activity.clientCompany}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrency(activity.total || 0)}
                        </p>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
        )}
      </div>
    </Card>
  );
}
