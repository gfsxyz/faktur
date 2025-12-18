"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  DeleteConfirmationDialog,
  useDeleteConfirmation,
} from "@/components/ui/delete-confirmation-dialog";
import { toast } from "sonner";
import { roundMoney, formatCurrency } from "@/lib/utils/money";

interface PaymentHistoryProps {
  invoiceId: string;
  currency?: string;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  check: "Check",
  bank_transfer: "Bank Transfer",
  credit_card: "Credit Card",
  paypal: "PayPal",
  stripe: "Stripe",
  other: "Other",
};

export function PaymentHistory({
  invoiceId,
  currency = "USD",
}: PaymentHistoryProps) {
  const { data: payments, isLoading } = trpc.payments.getByInvoiceId.useQuery({
    invoiceId,
  });
  const deletePaymentMutation = trpc.payments.delete.useMutation();
  const utils = trpc.useUtils();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteConfirmation = useDeleteConfirmation();

  const handleDelete = async (paymentId: string) => {
    deleteConfirmation.confirm(async () => {
      setDeletingId(paymentId);
      try {
        await deletePaymentMutation.mutateAsync({ id: paymentId });
        await utils.payments.getByInvoiceId.invalidate({ invoiceId });
        await utils.invoices.getById.invalidate({ id: invoiceId });
        await utils.dashboard.getStats.invalidate();
        await utils.dashboard.getRecentActivity.invalidate();
        toast.success("Payment deleted successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete payment");
      } finally {
        setDeletingId(null);
      }
    });
  };

  if (isLoading) {
    return (
      <Card className="gap-0">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-sm font-semibold">
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card className="gap-0">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-sm font-semibold">
            Payment History
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            No payments recorded yet
          </p>
        </CardHeader>
      </Card>
    );
  }

  const totalPaid = roundMoney(
    payments.reduce((sum, payment) => sum + payment.amount, 0)
  );

  return (
    <Card className="gap-0 pb-3">
      <CardHeader className="space-y-1 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-sm font-semibold">
            Payment History
          </CardTitle>
          <div className="text-xs">
            <span className="text-muted-foreground">Total Paid: </span>
            <span className="font-mono font-semibold text-primary">
              {formatCurrency(totalPaid)}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {payments.length} payment{payments.length !== 1 ? "s" : ""} recorded
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-3 p-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="group relative rounded-lg border border-border/50 bg-card p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="pr-8 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-bold font-mono text-primary">
                    {formatCurrency(payment.amount)}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {PAYMENT_METHOD_LABELS[payment.paymentMethod] ||
                      payment.paymentMethod}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground">
                  {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                </div>

                {(payment.reference || payment.notes) && (
                  <div className="space-y-1 pt-2 border-t border-border/30">
                    {payment.reference && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Ref:</span>
                        <span className="ml-1.5 text-foreground">
                          {payment.reference}
                        </span>
                      </div>
                    )}
                    {payment.notes && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Note:</span>
                        <span className="ml-1.5 text-foreground/80">
                          {payment.notes}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                  onClick={() => handleDelete(payment.id)}
                  disabled={deletingId === payment.id}
                >
                  {deletingId === payment.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  )}
                </Button>
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
                  Date
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">
                  Amount
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">
                  Method
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">
                  Reference
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">
                  Notes
                </TableHead>
                <TableHead className="h-10 px-6 w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="group border-b border-border/20 hover:bg-muted/50"
                >
                  <TableCell className="px-6 py-3 text-sm">
                    {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-mono text-sm font-medium text-primary">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">
                      {PAYMENT_METHOD_LABELS[payment.paymentMethod] ||
                        payment.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {payment.reference || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                    {payment.notes || "-"}
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(payment.id)}
                      disabled={deletingId === payment.id}
                    >
                      {deletingId === payment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.handleCancel}
        onConfirm={deleteConfirmation.handleConfirm}
        title="Delete Payment"
        description="Are you sure you want to delete this payment? This action cannot be undone."
      />
    </Card>
  );
}
