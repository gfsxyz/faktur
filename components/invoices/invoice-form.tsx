"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientCombobox } from "@/components/clients/client-combobox";
import LoadingLogo from "@/components/loading-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Calendar, AlertCircle, ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NumberInput } from "@/components/ui/number-input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  roundMoney,
  moneyAdd,
  moneySubtract,
  moneyMultiply,
  formatCurrency,
} from "@/lib/utils/money";

const invoiceItemSchema = z.object({
  description: z
    .string()
    .min(1, "Item description is required")
    .min(3, "Description must be at least 3 characters long")
    .max(500, "Description must not exceed 500 characters")
    .transform((val) => val.trim()),
  quantity: z
    .number()
    .min(0.01, "Quantity must be greater than 0")
    .max(1000000, "Quantity must not exceed 1,000,000")
    .finite("Quantity must be a valid finite number"),
  rate: z
    .number()
    .min(0, "Rate cannot be negative")
    .max(100000000, "Rate must not exceed 100,000,000")
    .finite("Rate must be a valid finite number"),
  amount: z
    .number()
    .min(0, "Amount cannot be negative")
    .finite("Amount must be a valid finite number"),
  order: z.number().int("Order must be a whole number").min(0),
});

const invoiceFormSchema = z
  .object({
    clientId: z.string().min(1, "Please select a client for this invoice"),
    issueDate: z
      .string()
      .min(1, "Issue date is required")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Issue date must be in YYYY-MM-DD format")
      .refine((date) => {
        const d = new Date(date);
        return !isNaN(d.getTime());
      }, "Issue date must be a valid date")
      .refine((date) => {
        const d = new Date(date);
        const minDate = new Date("2000-01-01");
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 10);
        return d >= minDate && d <= maxDate;
      }, "Issue date must be between 2000 and 10 years from now"),
    dueDate: z
      .string()
      .min(1, "Due date is required")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format")
      .refine((date) => {
        const d = new Date(date);
        return !isNaN(d.getTime());
      }, "Due date must be a valid date"),
    status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
    taxRate: z
      .number()
      .min(0, "Tax rate cannot be negative")
      .max(100, "Tax rate cannot exceed 100%")
      .finite("Tax rate must be a valid finite number"),
    discountType: z.enum(["percentage", "fixed", "none"]).optional(),
    discountValue: z
      .number()
      .min(0, "Discount value cannot be negative")
      .max(100000000, "Discount value must not exceed 100,000,000")
      .finite("Discount value must be a valid finite number"),
    notes: z
      .string()
      .refine(
        (val) => !val || val.length <= 5000,
        "Notes must not exceed 5000 characters"
      )
      .transform((val) => val.trim())
      .optional()
      .or(z.literal("")),
    terms: z
      .string()
      .refine(
        (val) => !val || val.length <= 5000,
        "Terms must not exceed 5000 characters"
      )
      .transform((val) => val.trim())
      .optional()
      .or(z.literal("")),
    items: z
      .array(invoiceItemSchema)
      .min(1, "Invoice must have at least one line item")
      .max(100, "Invoice cannot have more than 100 line items"),
  })
  .refine(
    (data) => {
      const issue = new Date(data.issueDate);
      const due = new Date(data.dueDate);
      return due >= issue;
    },
    {
      message: "Due date must be on or after the issue date",
      path: ["dueDate"],
    }
  )
  .refine(
    (data) => {
      if (data.discountType === "percentage" && data.discountValue > 0) {
        return data.discountValue <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    }
  );

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  invoiceId?: string;
  invoiceNumber?: string;
  defaultValues?: Partial<InvoiceFormValues>;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function InvoiceForm({
  invoiceId,
  invoiceNumber,
  defaultValues,
  onDelete,
  isDeleting,
}: InvoiceFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);

  // Open collapsibles by default if editing and has data
  const hasTaxOrDiscount = Boolean(
    defaultValues?.taxRate ||
      (defaultValues?.discountType && defaultValues?.discountType !== "none")
  );
  const hasAdditionalInfo = Boolean(
    defaultValues?.notes || defaultValues?.terms
  );

  // Check if user has any clients (for empty state)
  const { data: hasClients = false, isLoading: isLoadingClients } =
    trpc.clients.hasAny.useQuery();

  const { data: nextInvoiceNumber } =
    trpc.invoices.getNextInvoiceNumber.useQuery(undefined, {
      enabled: !invoiceId,
    });

  const createMutation = trpc.invoices.create.useMutation({
    onSuccess: (data) => {
      // Invalidate invoices list and hasAny to refresh the list view
      utils.invoices.list.invalidate();
      utils.invoices.hasAny.invalidate();
      router.push(`/dashboard/invoices/${data.id}`);
    },
  });

  const updateMutation = trpc.invoices.update.useMutation({
    onSuccess: () => {
      // Invalidate both the specific invoice and the list to ensure fresh data
      if (invoiceId) {
        utils.invoices.getById.invalidate({ id: invoiceId });
      }
      utils.invoices.list.invalidate();
      router.push(`/dashboard/invoices/${invoiceId}`);
    },
  });

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: defaultValues || {
      clientId: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "draft",
      taxRate: 0,
      discountType: "none",
      discountValue: 0,
      notes: "",
      terms: "",
      items: [
        {
          description: "",
          quantity: 1,
          rate: 0,
          amount: 0,
          order: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watch clientId to disable fields when empty
  const clientId = form.watch("clientId");
  const isClientSelected = clientId && clientId.trim() !== "";

  // Load recent client from localStorage on mount (only for new invoices)
  // Using useEffect to avoid hydration issues
  useEffect(() => {
    if (!invoiceId && !defaultValues?.clientId) {
      const recentClientId = localStorage.getItem("recentClientId");
      if (recentClientId) {
        // Set the value directly - combobox will validate if client exists
        form.setValue("clientId", recentClientId);
      }
    }
  }, [invoiceId, form, defaultValues]);

  // Save selected client to localStorage whenever it changes
  useEffect(() => {
    if (clientId && clientId.trim() !== "") {
      localStorage.setItem("recentClientId", clientId);
    }
  }, [clientId]);

  // Calculate totals whenever form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      const items = value.items || [];
      const sub = roundMoney(
        items.reduce((sum, item) => sum + (item?.amount || 0), 0)
      );
      setSubtotal(sub);

      let disc = 0;
      if (value.discountType === "percentage") {
        disc = moneyMultiply(sub, (value.discountValue || 0) / 100);
      } else if (value.discountType === "fixed") {
        disc = roundMoney(value.discountValue || 0);
      }
      setDiscountAmount(disc);

      const afterDiscount = moneySubtract(sub, disc);
      const tax = moneyMultiply(afterDiscount, (value.taxRate || 0) / 100);
      setTaxAmount(tax);

      const tot = moneyAdd(afterDiscount, tax);
      setTotal(tot);
    });

    // Calculate totals on mount with default values
    const values = form.getValues();
    const items = values.items || [];
    const sub = roundMoney(
      items.reduce((sum, item) => sum + (item?.amount || 0), 0)
    );
    setSubtotal(sub);

    let disc = 0;
    if (values.discountType === "percentage") {
      disc = moneyMultiply(sub, (values.discountValue || 0) / 100);
    } else if (values.discountType === "fixed") {
      disc = roundMoney(values.discountValue || 0);
    }
    setDiscountAmount(disc);

    const afterDiscount = moneySubtract(sub, disc);
    const tax = moneyMultiply(afterDiscount, (values.taxRate || 0) / 100);
    setTaxAmount(tax);

    const tot = moneyAdd(afterDiscount, tax);
    setTotal(tot);

    return () => subscription.unsubscribe();
  }, [form]);

  // Update item amount when quantity or rate changes with proper rounding
  const updateItemAmount = (index: number) => {
    const item = form.getValues(`items.${index}`);
    const amount = moneyMultiply(item.quantity, item.rate);
    form.setValue(`items.${index}.amount`, amount);
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    // Convert date strings to Date objects
    const payload = {
      ...data,
      issueDate: new Date(data.issueDate),
      dueDate: new Date(data.dueDate),
      discountType:
        data.discountType === "none" ? undefined : data.discountType,
    };

    if (invoiceId) {
      await updateMutation.mutateAsync({
        id: invoiceId,
        data: payload as any,
      });
    } else {
      await createMutation.mutateAsync(payload as any);
    }
  };

  // Show loading state while checking if user has clients
  if (isLoadingClients) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingLogo />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-5xl space-y-6"
      >
        {/* Header Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-primary">
                {invoiceId ? "Edit Invoice" : "Create Invoice"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {nextInvoiceNumber && !invoiceId
                  ? `Invoice #${nextInvoiceNumber}`
                  : invoiceNumber && `Invoice #${invoiceNumber}`}
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Form */}
          <div className="space-y-8 lg:col-span-2">
            {/* Basic Details */}
            <Card className="gap-2 pb-2">
              <CardHeader className="gap-0">
                <CardTitle className="text-base font-medium">
                  Basic Details
                </CardTitle>
                <CardDescription className="text-xs">
                  Invoice information and client details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {/* Empty clients alert */}
                {!hasClients && (
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2 border-amber-400">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                    <p className="text-sm text-muted-foreground">
                      Add a client first to create an invoice,&nbsp;
                      <Link
                        href="/dashboard/clients/new"
                        className="font-medium text-primary hover:text-primary/80 transition-colors underline underline-offset-2 hover:underline-offset-4"
                      >
                        Add client
                      </Link>
                    </p>
                  </div>
                )}

                <div className="grid gap-1 pt-4 sm:grid-cols-2 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem className="space-y-1 min-w-0">
                        <FormLabel className="text-sm font-medium">
                          Client
                        </FormLabel>
                        <FormControl>
                          <ClientCombobox
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={!hasClients}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-1 min-w-0">
                        <FormLabel className="text-sm font-medium">
                          Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!isClientSelected}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* <Separator className="bg-border/50" /> */}

                <div className="grid gap-1 sm:grid-cols-2 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          Issue Date
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            value={
                              field.value ? new Date(field.value) : undefined
                            }
                            onChange={(date) =>
                              field.onChange(
                                date?.toISOString().split("T")[0] || ""
                              )
                            }
                            maxDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                            disabled={!isClientSelected}
                            placeholder="Select issue date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => {
                      const issueDate = form.watch("issueDate");
                      const minDate = issueDate
                        ? new Date(issueDate)
                        : new Date();

                      return (
                        <FormItem className="space-y-1">
                          <FormLabel className="flex items-center gap-2 text-sm font-medium">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            Due Date
                          </FormLabel>
                          <FormControl>
                            <DatePicker
                              value={
                                field.value ? new Date(field.value) : undefined
                              }
                              onChange={(date) =>
                                field.onChange(
                                  date?.toISOString().split("T")[0] || ""
                                )
                              }
                              minDate={minDate}
                              disabled={!isClientSelected}
                              placeholder="Select due date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">
                      Line Items
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Add products or services to this invoice
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9"
                    disabled={!isClientSelected}
                    onClick={() =>
                      append({
                        description: "",
                        quantity: 1,
                        rate: 0,
                        amount: 0,
                        order: fields.length,
                      })
                    }
                  >
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-0">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={cn(
                      "group relative rounded-lg p-4 transition-colors",
                      "hover:bg-accent/50",
                      index !== fields.length - 1 && "border-b"
                    )}
                  >
                    <div className="grid gap-1 sm:gap-4 md:grid-cols-12">
                      <div className="md:col-span-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-xs font-medium">
                                Description
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Item description"
                                  className="h-9"
                                  disabled={!isClientSelected}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-xs font-medium">
                                Quantity
                              </FormLabel>
                              <FormControl>
                                <NumberInput
                                  className="h-9"
                                  placeholder="0"
                                  disabled={!isClientSelected}
                                  value={field.value}
                                  onChange={(value) => {
                                    field.onChange(value);
                                    setTimeout(
                                      () => updateItemAmount(index),
                                      0
                                    );
                                  }}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.rate`}
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-xs font-medium">
                                Rate
                              </FormLabel>
                              <FormControl>
                                <NumberInput
                                  className="h-9"
                                  placeholder="0.00"
                                  disabled={!isClientSelected}
                                  value={field.value}
                                  onChange={(value) => {
                                    field.onChange(value);
                                    setTimeout(
                                      () => updateItemAmount(index),
                                      0
                                    );
                                  }}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.amount`}
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-xs font-medium">
                                Amount
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  disabled
                                  className="h-9 bg-muted/30"
                                  {...field}
                                  value={formatCurrency(field.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex items-end md:col-span-1">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive transition-colors"
                            disabled={!isClientSelected}
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tax & Discounts */}
            <Card className="pb-2">
              <Collapsible defaultOpen={hasTaxOrDiscount}>
                <CardHeader className="gap-0.5 pb-4">
                  <CollapsibleTrigger className="flex items-center justify-between w-full group">
                    <div className="text-left">
                      <CardTitle className="text-base font-medium">
                        Tax & Discounts
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Configure tax rates and discounts (optional)
                      </CardDescription>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-2 pt-0">
                    {/* Tax Rate */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Tax Rate</p>
                          <p className="text-xs text-muted-foreground">
                            Add tax percentage to invoice
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="taxRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <NumberInput
                                className="h-11"
                                placeholder="0.00"
                                max={100}
                                disabled={!isClientSelected}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                suffix="%"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Discount */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Discount</p>
                          <p className="text-xs text-muted-foreground">
                            Apply a discount to the invoice
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="discountType"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={!isClientSelected}
                                >
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">
                                      No Discount
                                    </SelectItem>
                                    <SelectItem value="percentage">
                                      Percentage (%)
                                    </SelectItem>
                                    <SelectItem value="fixed">
                                      Fixed Amount ($)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="discountValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <NumberInput
                                  className="h-11"
                                  placeholder="0.00"
                                  value={field.value}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  disabled={
                                    !isClientSelected ||
                                    !form.watch("discountType") ||
                                    form.watch("discountType") === "none"
                                  }
                                  suffix={
                                    form.watch("discountType") === "percentage"
                                      ? "%"
                                      : "$"
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Additional Information */}
            <Card className="pb-2">
              <Collapsible defaultOpen={hasAdditionalInfo}>
                <CardHeader className="gap-0.5 pb-4">
                  <CollapsibleTrigger className="flex items-center justify-between w-full group">
                    <div className="text-left">
                      <CardTitle className="text-base font-medium">
                        Additional Information
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Optional notes and terms
                      </CardDescription>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-2 pt-0">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-sm font-medium">
                            Notes
                          </FormLabel>
                          <FormControl>
                            <textarea
                              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Additional notes for the client..."
                              disabled={!isClientSelected}
                              value={field.value ?? ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-sm font-medium">
                            Terms & Conditions
                          </FormLabel>
                          <FormControl>
                            <textarea
                              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Payment terms and conditions..."
                              disabled={!isClientSelected}
                              value={field.value ?? ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>

          {/* Right Column - Summary Sidebar */}
          <div className="space-y-8 lg:col-span-1">
            {/* Invoice Summary */}
            <div className="sticky top-8 space-y-6">
              <Card>
                <CardHeader className="gap-0.5 pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    Summary
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Invoice calculation breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-mono text-foreground">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-mono text-green-600">
                          -{formatCurrency(discountAmount)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tax ({form.watch("taxRate") || 0}%)
                      </span>
                      <span className="font-mono text-foreground">
                        {formatCurrency(taxAmount)}
                      </span>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-base font-semibold">Total</span>
                      <span className="text-xl font-bold font-mono text-primary">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-10 font-medium"
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    !hasClients
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : !hasClients
                    ? "Create Client First"
                    : invoiceId
                    ? "Update Invoice"
                    : "Create Invoice"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10"
                  onClick={() => router.push("/dashboard/invoices")}
                >
                  Cancel
                </Button>
                {invoiceId && onDelete && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={onDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete Invoice"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
