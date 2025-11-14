"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: invoice, isLoading } = trpc.invoices.getById.useQuery({ id });

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

  const defaultValues = {
    clientId: invoice.clientId,
    issueDate: new Date(invoice.issueDate).toISOString().split("T")[0],
    dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
    status: invoice.status,
    currency: invoice.currency,
    taxRate: invoice.taxRate,
    discountType: invoice.discountType || ("" as any),
    discountValue: invoice.discountValue || 0,
    notes: invoice.notes || "",
    terms: invoice.terms || "",
    items: invoice.items || [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
        <p className="text-muted-foreground">
          Update invoice {invoice.invoiceNumber}
        </p>
      </div>

      <InvoiceForm invoiceId={id} defaultValues={defaultValues} />
    </div>
  );
}
