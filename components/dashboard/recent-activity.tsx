"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants/status-colors";

export function RecentActivity() {
  const { data: activities, isLoading } =
    trpc.dashboard.getRecentActivity.useQuery({
      limit: 10,
    });

  if (isLoading || !activities) {
    return (
      <Card className="border-muted/40 backdrop-blur-sm">
        <div className="border-b border-border/40 bg-linear-to-br from-muted/30 to-muted/10 px-5 py-4">
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

  if (activities.length === 0) {
    return (
      <Card className="border-muted/40 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 px-5 py-4">
          <h3 className="font-semibold tracking-tight">Recent Activity</h3>
          <p className="text-xs text-muted-foreground/80">
            Latest invoice updates
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="rounded-2xl bg-muted/30 p-4 mb-4">
            <FileText className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground/60">
            No recent activity
          </p>
          <p className="text-xs text-muted-foreground/40 mt-1">
            Invoice updates will appear here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-muted/40 backdrop-blur-sm px-4">
      <div className="px-4 pt-3">
        <h3 className="font-semibold tracking-tight">Recent Activity</h3>
        <p className="text-xs text-muted-foreground/80">
          Latest invoice updates
        </p>
      </div>
      <div className="divide-y divide-border/40">
        {activities.map((activity) => (
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
              <p className="text-xs text-muted-foreground/80 truncate">
                {activity.clientName || "No client"}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-[10px] text-muted-foreground/60">
                  {activity.updatedAt
                    ? formatDistanceToNow(new Date(activity.updatedAt), {
                        addSuffix: true,
                      })
                    : "recently"}
                </p>
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
    </Card>
  );
}
