"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { HandCoins, Loader2 } from "lucide-react";
import { NumberInput } from "@/components/ui/number-input";
import { DatePicker } from "@/components/ui/date-picker";
import { roundMoney, moneyGreaterThanOrEqual } from "@/lib/utils/money";

const createPaymentSchema = (maxAmount: number) =>
  z.object({
    amount: z
      .number()
      .min(0.01, "Payment amount must be greater than 0")
      .max(100000000, "Payment amount must not exceed 100,000,000")
      .refine(
        (val) => moneyGreaterThanOrEqual(maxAmount, val),
        {
          message: `Payment amount cannot exceed remaining balance ($${roundMoney(maxAmount).toFixed(2)})`,
        }
      ),
  paymentDate: z
    .string()
    .min(1, "Payment date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Payment date must be in YYYY-MM-DD format")
    .refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    }, "Payment date must be a valid date")
    .refine((date) => {
      const d = new Date(date);
      const minDate = new Date("2000-01-01");
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 1); // Allow today and earlier
      return d >= minDate && d <= maxDate;
    }, "Payment date invalid"),
  paymentMethod: z.enum([
    "cash",
    "check",
    "bank_transfer",
    "credit_card",
    "paypal",
    "stripe",
    "other",
  ]),
  reference: z
    .string()
    .refine(
      (val) => !val || val.length <= 100,
      "Reference number must not exceed 100 characters"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .refine(
      (val) => !val || val.length <= 1000,
      "Notes must not exceed 1000 characters"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  });

interface RecordPaymentDialogProps {
  invoiceId: string;
  remainingBalance: number;
  onSuccess?: () => void;
  buttonLabel?: string;
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

export function RecordPaymentDialog({
  invoiceId,
  remainingBalance,
  onSuccess,
  buttonLabel,
}: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const createPaymentMutation = trpc.payments.create.useMutation();

  // Round remaining balance to avoid float errors
  const roundedRemainingBalance = roundMoney(remainingBalance);

  // Create schema with dynamic max amount validation
  const paymentSchema = createPaymentSchema(roundedRemainingBalance);
  type PaymentFormData = z.infer<typeof paymentSchema>;

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "bank_transfer",
      reference: "",
      notes: "",
    },
  });

  // Update amount when dialog opens or remainingBalance changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      form.reset({
        amount: roundedRemainingBalance,
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "bank_transfer",
        reference: "",
        notes: "",
      });
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await createPaymentMutation.mutateAsync({
        invoiceId,
        amount: data.amount,
        paymentDate: new Date(data.paymentDate),
        paymentMethod: data.paymentMethod,
        reference: data.reference || undefined,
        notes: data.notes || undefined,
      });

      // Invalidate queries
      await utils.payments.getByInvoiceId.invalidate({ invoiceId });
      await utils.invoices.getById.invalidate({ id: invoiceId });
      await utils.dashboard.getStats.invalidate();
      await utils.dashboard.getRecentActivity.invalidate();

      // Close dialog
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to record payment:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <HandCoins />
          {buttonLabel || "Record Payment"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-base font-medium">
            Record Payment
          </DialogTitle>
          <DialogDescription className="text-xs">
            Record a payment received for this invoice. Remaining balance: ${" "}
            {roundedRemainingBalance.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">
                      Amount
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground z-10">
                          $
                        </span>
                        <NumberInput
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          max={roundedRemainingBalance}
                          placeholder="0.00"
                          className="pl-8 h-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">
                      Payment Date
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) =>
                          field.onChange(
                            date?.toISOString().split("T")[0] || ""
                          )
                        }
                        maxDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                        placeholder="Select payment date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">
                      Payment Method
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PAYMENT_METHOD_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">
                      Reference Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Transaction ID, check number, etc."
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">Notes</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Additional notes..."
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createPaymentMutation.isPending}
                className="h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPaymentMutation.isPending}
                className="h-10"
              >
                {createPaymentMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
