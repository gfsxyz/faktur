"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { NotFound } from "@/components/ui/not-found";
import {
  DeleteConfirmationDialog,
  useDeleteConfirmation,
} from "@/components/ui/delete-confirmation-dialog";
import { toast } from "sonner";
import LoadingLogo from "@/components/loading-logo";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();
  const deleteConfirmation = useDeleteConfirmation();
  const { data: invoice, isLoading } = trpc.invoices.getById.useQuery({ id });

  const deleteMutation = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.invoices.hasAny.invalidate();
      toast.success("Invoice deleted successfully");
      router.push("/dashboard/invoices");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete invoice");
    },
  });

  const handleDelete = () => {
    deleteConfirmation.confirm(async () => {
      await deleteMutation.mutateAsync({ id });
    });
  };

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

  const defaultValues = {
    clientId: invoice.clientId,
    issueDate: new Date(invoice.issueDate).toISOString().split("T")[0],
    dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
    status: invoice.status,
    taxRate: invoice.taxRate,
    discountType:
      (invoice.discountType as "percentage" | "fixed" | "none" | undefined) ||
      "none",
    discountValue: invoice.discountValue || 0,
    notes: invoice.notes || "",
    terms: invoice.terms || "",
    items: invoice.items || [],
  };

  return (
    <div className="space-y-6">
      <InvoiceForm
        invoiceId={id}
        invoiceNumber={invoice.invoiceNumber}
        defaultValues={defaultValues}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.handleCancel}
        onConfirm={deleteConfirmation.handleConfirm}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
      />
    </div>
  );
}
