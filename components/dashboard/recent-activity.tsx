"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Shredder } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants/status-colors";
import EmptyState from "../ui/empty-state";
import { formatCurrency } from "@/lib/utils/money";
import { getClientAvatar } from "@/lib/utils/avatar";

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
        <div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-3">
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

  return (
    <Card className="border-muted/40 backdrop-blur-sm">
      <div className="px-5">
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
      <div className="divide-y divide-border/40">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            href={`/dashboard/invoices/${activity.id}`}
            className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
          >
            {/* Client Avatar */}
            <div className="relative shrink-0">
              <Image
                src={getClientAvatar(activity.clientId || "unknown")}
                alt={activity.clientCompany || activity.clientName || "Client"}
                width={40}
                height={40}
              />
              {/* Status Indicator Dot */}
              <div
                className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-3 border-background"
                style={{
                  backgroundColor: STATUS_COLORS[activity.status],
                }}
                title="Status indicator marker"
                aria-label="Status indicator marker"
              />
            </div>

            {/* Client & Invoice Info */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="font-semibold text-sm truncate text-foreground">
                {activity.clientCompany || activity.clientName || "No client"}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{activity.invoiceNumber}</span>
                <span className="text-muted-foreground/40">•</span>
                <span className="shrink-0">
                  {STATUS_LABELS[activity.status] || activity.status}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-semibold text-sm tabular-nums text-foreground">
                {formatCurrency(activity.total || 0)}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
