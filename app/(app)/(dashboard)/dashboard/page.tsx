"use client";

import { useSession } from "@/lib/auth/client";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { InvoiceStatusChart } from "@/components/dashboard/invoice-status-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { OnboardingBanner } from "@/components/dashboard/onboarding-banner";
import { trpc } from "@/lib/trpc/client";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: hasClients } = trpc.clients.hasAny.useQuery();
  const { data: stats } = trpc.dashboard.getStats.useQuery();

  const showClientBanner = hasClients === false;
  const showInvoiceBanner = hasClients === true && stats?.totalInvoices === 0;
  const showBanner = showClientBanner || showInvoiceBanner;

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-primary">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session?.user?.name}!
          </p>
        </div>
      </div>

      {/* Onboarding Banner */}
      {showBanner && (
        <OnboardingBanner
          title={
            showClientBanner
              ? "Welcome! Let's get started"
              : "Ready to send your first invoice?"
          }
          description={
            showClientBanner
              ? "Add your first client to unlock invoicing. It only takes a moment to set up."
              : "Your client is set up. Create a professional invoice now and start the cash flow."
          }
          buttonText={showClientBanner ? "Add Client" : "Create Invoice"}
          href={
            showClientBanner
              ? "/dashboard/clients/new"
              : "/dashboard/invoices/new"
          }
        />
      )}

      {/* Stats Cards */}
      <DashboardStats />

      {/* Charts Row */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <RevenueChart />
        <InvoiceStatusChart />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
