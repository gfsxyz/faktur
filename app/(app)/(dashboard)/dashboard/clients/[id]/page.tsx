"use client";

import { use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { STATUS_COLORS } from "@/lib/constants/status-colors";

const statusColors = {
  draft: "secondary",
  sent: "default",
  paid: "default",
  overdue: "destructive",
  cancelled: "secondary",
} as const;

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: client, isLoading: clientLoading } =
    trpc.clients.getById.useQuery({ id });
  const { data: invoices, isLoading: invoicesLoading } =
    trpc.invoices.list.useQuery();

  // Filter invoices for this client
  const clientInvoices = invoices?.filter((inv) => inv.clientId === id) || [];

  if (clientLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading client...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <p className="text-lg font-medium">Client not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
      </div>
    );
  }

  const totalInvoiced = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = clientInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);
  const outstanding = totalInvoiced - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl text-primary font-bold tracking-tight">
              {client.name}
            </h1>
            <p className="text-muted-foreground text-sm">Client Details</p>
          </div>
        </div>
        <Button size="sm" variant={"outline"} asChild>
          <Link href={`/dashboard/clients/${id}/edit`}>Edit</Link>
        </Button>
      </div>

      {/* Mobile View - Cards */}
      <div className="sm:hidden grid grid-cols-1 gap-3">
        <div className="rounded-lg border border-border/50 bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Total Invoiced
          </p>
          <p className="text-xl font-bold font-mono">
            $
            {totalInvoiced.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/50 bg-card p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Paid
            </p>
            <p
              className="text-lg font-bold font-mono"
              style={{ color: STATUS_COLORS.paid }}
            >
              $
              {totalPaid.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Outstanding
            </p>
            <p
              className="text-lg font-bold font-mono"
              style={{ color: STATUS_COLORS.overdue }}
            >
              $
              {outstanding.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:flex items-center gap-6 rounded-lg border border-border/50 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-muted-foreground">
            Total Invoiced
          </p>
          <p className="text-sm font-bold font-mono">
            $
            {totalInvoiced.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="h-6 w-px bg-border/50" />

        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-muted-foreground">Paid</p>
          <p
            className="text-sm font-bold font-mono"
            style={{ color: STATUS_COLORS.paid }}
          >
            $
            {totalPaid.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="h-6 w-px bg-border/50" />

        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-muted-foreground">
            Outstanding
          </p>
          <p
            className="text-sm font-bold font-mono"
            style={{ color: STATUS_COLORS.overdue }}
          >
            $
            {outstanding.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="gap-1">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-sm font-semibold">
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-6 pb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-sm font-medium">{client.email}</p>
              </div>
              {client.phone && (
                <>
                  <div className="border-t border-border/30" />
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Phone
                    </p>
                    <p className="text-sm font-medium">{client.phone}</p>
                  </div>
                </>
              )}
              {client.company && (
                <>
                  <div className="border-t border-border/30" />
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Company
                    </p>
                    <p className="text-sm font-medium">{client.company}</p>
                  </div>
                </>
              )}
              {client.taxId && (
                <>
                  <div className="border-t border-border/30" />
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Tax ID
                    </p>
                    <p className="text-sm font-medium">{client.taxId}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-1">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-sm font-semibold">Address</CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-6 pb-4">
            {client.address || client.city || client.country ? (
              <div className="space-y-3">
                {client.address && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        Street
                      </p>
                      <p className="text-sm font-medium">{client.address}</p>
                    </div>
                    <div className="border-t border-border/30" />
                  </>
                )}
                {(client.city || client.state || client.postalCode) && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        City
                      </p>
                      <p className="text-sm font-medium">
                        {[client.city, client.state, client.postalCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="border-t border-border/30" />
                  </>
                )}
                {client.country && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Country
                    </p>
                    <p className="text-sm font-medium">{client.country}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No address provided
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {client.notes && (
        <Card className="gap-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-semibold">Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-6 text-muted-foreground">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {client.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="gap-0">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-sm font-semibold">
            Invoice History
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {clientInvoices.length} invoice
            {clientInvoices.length !== 1 ? "s" : ""}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {clientInvoices.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">
              No invoices for this client yet
            </p>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="md:hidden space-y-3 p-4">
                {clientInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/dashboard/invoices/${invoice.id}`}
                    className="block rounded-lg border border-border/50 bg-card p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Invoice
                        </p>
                        <p className="font-mono text-sm font-medium text-primary">
                          {invoice.invoiceNumber}
                        </p>
                      </div>
                      <Badge variant={statusColors[invoice.status]}>
                        {statusLabels[invoice.status]}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Issue Date
                        </p>
                        <p className="text-sm">
                          {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Due Date
                        </p>
                        <p className="text-sm">
                          {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">
                        Amount
                      </p>
                      <p className="text-lg font-bold font-mono">
                        $
                        {invoice.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/30 hover:bg-transparent">
                      <TableHead className="h-10 px-6 text-xs font-medium text-muted-foreground">
                        Invoice #
                      </TableHead>
                      <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">
                        Issue Date
                      </TableHead>
                      <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">
                        Due Date
                      </TableHead>
                      <TableHead className="h-10 px-4 text-right text-xs font-medium text-muted-foreground">
                        Amount
                      </TableHead>
                      <TableHead className="h-10 px-6 text-right text-xs font-medium text-muted-foreground">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientInvoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        className="border-b border-border/20 hover:bg-muted/50 cursor-pointer"
                        onClick={() => window.location.href = `/dashboard/invoices/${invoice.id}`}
                      >
                        <TableCell className="px-6 py-3 font-mono text-sm text-primary">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm">
                          {format(new Date(invoice.issueDate), "MMM dd")}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm">
                          {format(new Date(invoice.dueDate), "MMM dd")}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right font-mono text-sm font-medium">
                          $
                          {invoice.total.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="px-6 py-3 text-right">
                          <Badge variant={statusColors[invoice.status]}>
                            {statusLabels[invoice.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
