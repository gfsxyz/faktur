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
import { RecordPaymentDialog } from "@/components/payments/record-payment-dialog";
import { PaymentHistory } from "@/components/payments/payment-history";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants/status-colors";
import { NotFound } from "@/components/ui/not-found";
import LoadingLogo from "@/components/loading-logo";
import { FileCog, FileDown } from "lucide-react";
import { moneySubtract, formatCurrency } from "@/lib/utils/money";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: invoice, isLoading } = trpc.invoices.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  if (!invoice) {
    return (
      <NotFound
        prefix="Invoice"
        backHref="/dashboard/invoices"
        backLabel="Back to Invoices"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl text-primary font-mono font-semibold tracking-tight">
            {invoice.invoiceNumber}
          </h1>
          <p className="text-sm text-muted-foreground">Invoice Details</p>
        </div>

        <div className="gap-2 flex flex-wrap">
          {invoice &&
          invoice.status !== "paid" &&
          invoice.status !== "cancelled" ? (
            <RecordPaymentDialog
              invoiceId={id}
              remainingBalance={moneySubtract(
                invoice.total,
                invoice.amountPaid
              )}
              buttonLabel="Payment"
            />
          ) : null}
          <Button variant="outline" asChild>
            <Link href={`/dashboard/invoices/${id}/preview`}>
              <FileDown />
              <span className="hidden sm:inline">Preview & Download</span>
              <span className="sm:hidden">Download</span>
            </Link>
          </Button>
          <Button asChild variant={"outline"}>
            <Link href={`/dashboard/invoices/${id}/edit`}>
              <FileCog />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="lg:hidden grid grid-cols-2 gap-3">
        <Card className="py-3">
          <CardContent>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Status
              </p>
              <Badge
                className="text-xs font-medium"
                style={{
                  backgroundColor: STATUS_COLORS[invoice.status],
                  color: "white",
                  border: "none",
                }}
              >
                {STATUS_LABELS[invoice.status]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="py-3">
          <CardContent>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Issued
              </p>
              <p className="text-sm font-semibold">
                {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-3">
          <CardContent>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Due Date
              </p>
              <p className="text-sm font-semibold">
                {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-3">
          <CardContent>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Remaining
              </p>
              <p className="text-sm font-mono font-semibold text-primary">
                {formatCurrency(
                  moneySubtract(invoice.total, invoice.amountPaid)
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop View */}
      <Card className="py-4 hidden lg:flex">
        <CardContent className="flex items-center gap-6 rounded-lg">
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-muted-foreground">Status</p>
            <Badge
              className="text-xs font-medium"
              style={{
                backgroundColor: STATUS_COLORS[invoice.status],
                color: "white",
                border: "none",
              }}
            >
              {STATUS_LABELS[invoice.status]}
            </Badge>
          </div>

          <div className="h-6 w-px bg-border/50" />

          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-muted-foreground">Issued</p>
            <p className="text-sm font-medium">
              {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
            </p>
          </div>

          <div className="h-6 w-px bg-border/50" />

          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-muted-foreground">Due</p>
            <p className="text-sm font-medium">
              {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
            </p>
          </div>

          <div className="h-6 w-px bg-border/50" />

          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-muted-foreground">
              Remaining
            </p>
            <p className="text-sm font-mono font-semibold text-primary">
              {formatCurrency(moneySubtract(invoice.total, invoice.amountPaid))}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href={`/dashboard/clients/${invoice.client?.id}`}
          className="cursor-pointer"
        >
          <Card className="gap-1 h-full hover:bg-muted/30 transition-colors">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-sm font-semibold">
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 px-6 pb-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-sm font-medium">{invoice.client?.name}</p>
                </div>
                <div className="border-t border-border/30" />
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-sm font-medium">{invoice.client?.email}</p>
                </div>
                {invoice.client?.phone && (
                  <>
                    <div className="border-t border-border/30" />
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        Phone
                      </p>
                      <p className="text-sm font-medium">
                        {invoice.client.phone}
                      </p>
                    </div>
                  </>
                )}
                {invoice.client?.company && (
                  <>
                    <div className="border-t border-border/30" />
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        Company
                      </p>
                      <p className="text-sm font-medium">
                        {invoice.client.company}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="gap-1">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-sm font-semibold">
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-6 pb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Total Amount
                </span>
                <span className="text-sm font-mono font-medium">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
              <div className="border-t border-border/30" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Amount Paid
                </span>
                <span className="text-sm font-mono font-medium">
                  {formatCurrency(invoice.amountPaid)}
                </span>
              </div>
              <div className="border-t border-border/30" />
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Balance Due
                </span>
                <span className="text-sm font-mono font-bold text-primary">
                  {formatCurrency(
                    moneySubtract(invoice.total, invoice.amountPaid)
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-1 pb-0">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-sm font-semibold">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-3 p-4 pt-0">
            {invoice.items?.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-3"
              >
                <div className="font-medium text-sm">{item.description}</div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-4">
                    <div>
                      <span className="text-muted-foreground">Qty:</span>
                      <span className="ml-1 font-medium">{item.quantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rate:</span>
                      <span className="ml-1 font-mono font-medium">
                        {formatCurrency(item.rate)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground text-xs mb-0.5">
                      Amount
                    </div>
                    <div className="font-mono font-bold text-sm">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/30 hover:bg-transparent">
                  <TableHead className="h-10 px-6 text-xs font-medium text-muted-foreground">
                    Description
                  </TableHead>
                  <TableHead className="h-10 px-4 text-right text-xs font-medium text-muted-foreground">
                    Qty
                  </TableHead>
                  <TableHead className="h-10 px-4 text-right text-xs font-medium text-muted-foreground">
                    Rate
                  </TableHead>
                  <TableHead className="h-10 px-6 text-right text-xs font-medium text-muted-foreground">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items?.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-border/20 hover:bg-muted/50"
                  >
                    <TableCell className="px-6 py-3 text-sm">
                      {item.description}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-sm">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-mono text-sm">
                      {formatCurrency(item.rate)}
                    </TableCell>
                    <TableCell className="px-6 py-3 text-right font-mono text-sm font-medium">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-0 border-t border-border/30">
            <div className="flex items-center justify-end gap-16 px-6 py-2.5">
              <span className="text-xs font-medium text-muted-foreground">
                Subtotal
              </span>
              <span className="w-24 text-right font-mono text-sm font-medium">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>

            {(invoice.discountAmount ?? 0) > 0 && (
              <div className="flex items-center justify-end gap-16 px-6 py-2.5 border-t border-border/20">
                <span className="text-xs font-medium text-muted-foreground">
                  Discount
                </span>
                <span className="w-24 text-right font-mono text-sm font-medium text-green-600">
                  -{formatCurrency(invoice.discountAmount ?? 0)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-end gap-16 px-6 py-2.5 border-t border-border/20">
              <span className="text-xs font-medium text-muted-foreground">
                Tax ({invoice.taxRate}%)
              </span>
              <span className="w-24 text-right font-mono text-sm font-medium">
                {formatCurrency(invoice.taxAmount)}
              </span>
            </div>
            <div className="flex items-center justify-end gap-16 px-6 py-2.5 border-t border-border/30 bg-muted/30">
              <span className="text-xs font-semibold">Total</span>
              <span className="w-24 text-right font-mono text-sm font-bold text-primary">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {(invoice.notes || invoice.terms) && (
        <div className="grid gap-6">
          {invoice.notes && (
            <Card className="gap-0">
              <CardHeader className="space-y-1">
                <CardTitle className="text-sm font-semibold">Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-0 px-6">
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {invoice.terms && (
            <Card className="gap-0">
              <CardHeader className="space-y-1">
                <CardTitle className="text-sm font-semibold">
                  Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 px-6">
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {invoice.terms}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Payment History */}
      {invoice && <PaymentHistory invoiceId={id} />}
    </div>
  );
}
