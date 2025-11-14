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

interface PaymentHistoryProps {
  invoiceId: string;
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

export function PaymentHistory({ invoiceId }: PaymentHistoryProps) {
  const { data: payments, isLoading } = trpc.payments.getByInvoiceId.useQuery({
    invoiceId,
  });
  const deletePaymentMutation = trpc.payments.delete.useMutation();
  const utils = trpc.useUtils();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment? This action cannot be undone.")) {
      return;
    }

    setDeletingId(paymentId);
    try {
      await deletePaymentMutation.mutateAsync({ id: paymentId });
      await utils.payments.getByInvoiceId.invalidate({ invoiceId });
      await utils.invoices.getById.invalidate({ id: invoiceId });
      await utils.dashboard.getStats.invalidate();
      await utils.dashboard.getRecentActivity.invalidate();
    } catch (error) {
      console.error("Failed to delete payment:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            No payments recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment History</CardTitle>
          <div className="text-sm">
            <span className="text-muted-foreground">Total Paid: </span>
            <span className="font-semibold">
              USD {totalPaid.toFixed(2)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="font-medium">
                  USD {payment.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {PAYMENT_METHOD_LABELS[payment.paymentMethod] ||
                      payment.paymentMethod}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {payment.reference || "-"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {payment.notes || "-"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
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
      </CardContent>
    </Card>
  );
}
