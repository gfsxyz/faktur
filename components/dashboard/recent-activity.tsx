"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { FileText } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants/status-colors";

export function RecentActivity() {
  const { data: activities, isLoading } =
    trpc.dashboard.getRecentActivity.useQuery({
      limit: 10,
    });

  if (isLoading || !activities) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            Latest invoice updates
          </p>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-muted"></div>
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
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            Latest invoice updates
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No recent activity to display
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest invoice updates</p>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            href={`/dashboard/invoices/${activity.id}`}
            className="block rounded-lg border p-4 transition-colors hover:bg-accent"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{activity.invoiceNumber}</p>
                  <Badge
                    style={{
                      backgroundColor: STATUS_COLORS[activity.status],
                      color: "white",
                      border: "none",
                    }}
                  >
                    {STATUS_LABELS[activity.status] || activity.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.clientName || "No client"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Updated{" "}
                  {activity.updatedAt
                    ? formatDistanceToNow(new Date(activity.updatedAt), {
                        addSuffix: true,
                      })
                    : "recently"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(activity.total || 0)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
