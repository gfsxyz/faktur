"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, HandCoins } from "lucide-react";
import { formatCurrency } from "@/lib/utils/money";
import { getClientAvatar } from "@/lib/utils/avatar";
import EmptyState from "../ui/empty-state";

export function MostOverdueClients() {
  const { data: overdueClients, isLoading } =
    trpc.dashboard.getMostOverdueClients.useQuery({
      limit: 5,
    });

  // Get color based on how overdue the payment is
  const getOverdueColor = (days: number) => {
    if (days > 180) return "text-destructive"; // Critical: 6+ months
    if (days >= 90) return "text-amber-600"; // Serious: 3-6 months
    return "text-amber-300"; // Recent: 0-3 months
  };

  if (isLoading || !overdueClients) {
    return (
      <Card className="border-muted/40 backdrop-blur-sm">
        <div className="px-5">
          <h3 className="font-semibold tracking-tight">Most Overdue Clients</h3>
          <p className="text-xs text-muted-foreground/80">
            Clients with outstanding payments
          </p>
        </div>
        <div className="divide-y divide-border/40 p-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 px-2">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-muted/50"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-32 animate-pulse rounded bg-muted/50"></div>
                <div className="h-3 w-24 animate-pulse rounded bg-muted/30"></div>
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-muted/50"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!overdueClients.length) {
    return (
      <Card className="border-muted/40 backdrop-blur-sm">
        <div className="px-5">
          <h3 className="font-semibold tracking-tight">Most Overdue Clients</h3>
          <p className="text-xs text-muted-foreground/80">
            Clients with outstanding payments
          </p>
        </div>
        <div className="h-80">
          <EmptyState
            icon={<HandCoins size={44} />}
            description="No overdue payments. All invoices are up to date!"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-muted/40 backdrop-blur-sm">
      <div className="px-5">
        <h3 className="font-semibold tracking-tight">Most Overdue Clients</h3>
        <p className="text-xs text-muted-foreground/80">
          Clients with outstanding payments
        </p>
      </div>
      <div className="divide-y divide-border/40">
        {overdueClients.map((client) => (
          <Link
            key={client.clientId}
            href={`/dashboard/clients/${client.clientId}`}
            className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
          >
            {/* Client Avatar */}
            <Image
              src={getClientAvatar(client.clientId)}
              alt={client.clientCompany || client.clientName}
              width={40}
              height={40}
            />

            {/* Client Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">
                  {client.clientCompany || client.clientName}
                </p>
                {client.overdueInvoicesCount > 1 && (
                  <Badge className="text-xs shrink-0 h-5 px-1.5 bg-muted text-primary">
                    {client.overdueInvoicesCount} invoices
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span
                  className={`font-mono font-medium ${getOverdueColor(
                    client.oldestOverdueDays
                  )}`}
                >
                  {formatCurrency(client.totalOverdueAmount)}
                </span>
                <span className="text-muted-foreground/60">•</span>
                <span>
                  {client.oldestOverdueDays} day
                  {client.oldestOverdueDays !== 1 ? "s" : ""} overdue
                </span>
              </div>
            </div>

            {/* Arrow Icon */}
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
