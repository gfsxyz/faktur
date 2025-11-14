"use client";

import { use, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pencil, Download, Loader2 } from "lucide-react";
import { generateInvoicePDF } from "@/lib/pdf/generate-invoice-pdf";
import { RecordPaymentDialog } from "@/components/payments/record-payment-dialog";
import { PaymentHistory } from "@/components/payments/payment-history";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants/status-colors";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: invoice, isLoading } = trpc.invoices.getById.useQuery({ id });
  const { data: businessProfile } = trpc.businessProfile.get.useQuery();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    setIsDownloading(true);
    try {
      await generateInvoicePDF({
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
        items: invoice.items?.map((item) => ({
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
      });
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {invoice.invoiceNumber}
            </h1>
            <p className="text-muted-foreground">Invoice Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {invoice.status !== "paid" && invoice.status !== "cancelled" && (
            <RecordPaymentDialog
              invoiceId={id}
              remainingBalance={invoice.total - invoice.amountPaid}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/invoices/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              style={{
                backgroundColor: STATUS_COLORS[invoice.status],
                color: "white",
                border: "none",
              }}
            >
              {STATUS_LABELS[invoice.status]}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Issue Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Due Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{invoice.client?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{invoice.client?.email}</p>
            </div>
            {invoice.client?.phone && (
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{invoice.client.phone}</p>
              </div>
            )}
            {invoice.client?.company && (
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-sm text-muted-foreground">{invoice.client.company}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Total Amount:</span>
              <span className="text-sm font-medium">
                USD {invoice.total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Amount Paid:</span>
              <span className="text-sm font-medium">
                USD {invoice.amountPaid.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-medium">Balance Due:</span>
              <span className="font-bold">
                USD {(invoice.total - invoice.amountPaid).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    USD {item.rate.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    USD {item.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 space-y-2">
            <div className="flex justify-end gap-32">
              <span className="text-sm text-muted-foreground">Subtotal:</span>
              <span className="text-sm font-medium">
                USD {invoice.subtotal.toFixed(2)}
              </span>
            </div>
            {invoice.discountAmount && invoice.discountAmount > 0 && (
              <div className="flex justify-end gap-32">
                <span className="text-sm text-muted-foreground">Discount:</span>
                <span className="text-sm font-medium text-green-600">
                  -USD {invoice.discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-end gap-32">
              <span className="text-sm text-muted-foreground">
                Tax ({invoice.taxRate}%):
              </span>
              <span className="text-sm font-medium">
                USD {invoice.taxAmount.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-end gap-32">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-lg font-bold">
                USD {invoice.total.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {(invoice.notes || invoice.terms) && (
        <div className="grid gap-6 md:grid-cols-2">
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {invoice.terms && (
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {invoice.terms}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Payment History */}
      <PaymentHistory invoiceId={id} />
    </div>
  );
}
