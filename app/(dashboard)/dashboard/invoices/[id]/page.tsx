"use client";

import { use, useState } from "react";
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
import {
  ArrowLeft,
  Pencil,
  Download,
  Loader2,
  ChevronDown,
  FileText,
} from "lucide-react";
import { generateInvoicePDF } from "@/lib/pdf/generate-invoice-pdf";
import { RecordPaymentDialog } from "@/components/payments/record-payment-dialog";
import { PaymentHistory } from "@/components/payments/payment-history";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants/status-colors";
import { TEMPLATE_OPTIONS, TemplateType } from "@/components/invoices/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: invoice, isLoading } = trpc.invoices.getById.useQuery({ id });
  const { data: businessProfile } = trpc.businessProfile.get.useQuery();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async (template: TemplateType) => {
    if (!invoice) return;

    setIsDownloading(true);
    try {
      await generateInvoicePDF(
        {
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          subtotal: invoice.subtotal,
          taxRate: invoice.taxRate,
          taxAmount: invoice.taxAmount,
          discountAmount: invoice.discountAmount || 0,
          total: invoice.total,
          notes: invoice.notes,
          terms: invoice.terms,
          client: invoice.client
            ? {
                name: invoice.client.name,
                email: invoice.client.email,
                phone: invoice.client.phone,
                company: invoice.client.company,
              }
            : null,
          items:
            invoice.items?.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
            })) || [],
          businessProfile: businessProfile
            ? {
                companyName: businessProfile.companyName,
                email: businessProfile.email,
                phone: businessProfile.phone,
                address: businessProfile.address,
                city: businessProfile.city,
                state: businessProfile.state,
                country: businessProfile.country,
                postalCode: businessProfile.postalCode,
                taxId: businessProfile.taxId,
                logo: businessProfile.logo,
              }
            : null,
        },
        template
      );
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <p className="text-lg font-medium">Invoice not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
              <Link href="/dashboard/invoices">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-mono font-semibold tracking-tight">
                  {invoice.invoiceNumber}
                </h1>
                <p className="text-sm text-muted-foreground">Invoice Details</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {invoice &&
            invoice.status !== "paid" &&
            invoice.status !== "cancelled" ? (
              <RecordPaymentDialog
                invoiceId={id}
                remainingBalance={invoice.total - invoice.amountPaid}
              />
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isDownloading}>
                  {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {isDownloading ? "Generating..." : "Download PDF"}
                  {!isDownloading && <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {TEMPLATE_OPTIONS.map((template) => (
                  <DropdownMenuItem
                    key={template.value}
                    onClick={() => handleDownloadPDF(template.value)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{template.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {template.description}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild>
              <Link href={`/dashboard/invoices/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border/50 bg-card p-4 shadow-sm">
        {/* Status */}
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

        {/* Divider */}
        <div className="hidden h-6 w-px bg-border/50 md:block" />

        {/* Issue Date */}
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-muted-foreground">Issued</p>
          <p className="text-sm font-medium">
            {format(new Date(invoice.issueDate), "MMM dd")}
          </p>
        </div>

        {/* Divider */}
        <div className="hidden h-6 w-px bg-border/50 md:block" />

        {/* Due Date */}
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-muted-foreground">Due</p>
          <p className="text-sm font-medium">
            {format(new Date(invoice.dueDate), "MMM dd")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
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

        <Card className="border-border/50 shadow-sm">
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
                  ${invoice.total.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-border/30" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Amount Paid
                </span>
                <span className="text-sm font-mono font-medium">
                  ${invoice.amountPaid.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-border/30" />
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Balance Due
                </span>
                <span className="text-sm font-mono font-bold text-primary">
                  ${(invoice.total - invoice.amountPaid).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-sm font-semibold">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                    ${item.rate.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-right font-mono text-sm font-medium">
                    ${item.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="space-y-0 border-t border-border/30">
            <div className="flex items-center justify-end gap-16 px-6 py-2.5">
              <span className="text-xs font-medium text-muted-foreground">
                Subtotal
              </span>
              <span className="w-24 text-right font-mono text-sm font-medium">
                ${invoice.subtotal.toFixed(2)}
              </span>
            </div>

            {(invoice.discountAmount ?? 0) > 0 && (
              <div className="flex items-center justify-end gap-16 px-6 py-2.5 border-t border-border/20">
                <span className="text-xs font-medium text-muted-foreground">
                  Discount
                </span>
                <span className="w-24 text-right font-mono text-sm font-medium text-green-600">
                  -${(invoice.discountAmount ?? 0).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-end gap-16 px-6 py-2.5 border-t border-border/20">
              <span className="text-xs font-medium text-muted-foreground">
                Tax ({invoice.taxRate}%)
              </span>
              <span className="w-24 text-right font-mono text-sm font-medium">
                ${invoice.taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-end gap-16 px-6 py-2.5 border-t border-border/30 bg-muted/30">
              <span className="text-xs font-semibold">Total</span>
              <span className="w-24 text-right font-mono text-sm font-bold text-primary">
                ${invoice.total.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {(invoice.notes || invoice.terms) && (
        <div className="grid gap-6">
          {invoice.notes && (
            <Card className="border-border/50 shadow-sm gap-0">
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
            <Card className="border-border/50 shadow-sm gap-0">
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
