"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trpc } from "@/lib/trpc/client";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
  Info,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

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
  defaultValues?: Partial<InvoiceFormValues>;
}

export function InvoiceForm({ invoiceId, defaultValues }: InvoiceFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);

  const { data: clients } = trpc.clients.list.useQuery();
  const { data: nextInvoiceNumber } =
    trpc.invoices.getNextInvoiceNumber.useQuery(undefined, {
      enabled: !invoiceId,
    });

  const createMutation = trpc.invoices.create.useMutation({
    onSuccess: () => {
      // Invalidate invoices list to refresh the list view
      utils.invoices.list.invalidate();
      router.push("/dashboard/invoices");
    },
  });

  const updateMutation = trpc.invoices.update.useMutation({
    onSuccess: () => {
      // Invalidate both the specific invoice and the list to ensure fresh data
      if (invoiceId) {
        utils.invoices.getById.invalidate({ id: invoiceId });
      }
      utils.invoices.list.invalidate();
      router.push("/dashboard/invoices");
    },
  });

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: defaultValues || {
      clientId: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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
  useEffect(() => {
    if (!invoiceId && clients && clients.length > 0) {
      const recentClientId = localStorage.getItem("recentClientId");
      if (recentClientId) {
        // Check if the client still exists in the list
        const clientExists = clients.some(
          (client) => client.id === recentClientId
        );
        if (clientExists && !defaultValues?.clientId) {
          form.setValue("clientId", recentClientId);
        } else if (!clientExists) {
          // Clean up if client no longer exists
          localStorage.removeItem("recentClientId");
        }
      }
    }
  }, [invoiceId, clients, form, defaultValues]);

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
      const sub = items.reduce((sum, item) => sum + (item?.amount || 0), 0);
      setSubtotal(sub);

      let disc = 0;
      if (value.discountType === "percentage") {
        disc = (sub * (value.discountValue || 0)) / 100;
      } else if (value.discountType === "fixed") {
        disc = value.discountValue || 0;
      }
      setDiscountAmount(disc);

      const afterDiscount = sub - disc;
      const tax = (afterDiscount * (value.taxRate || 0)) / 100;
      setTaxAmount(tax);

      const tot = afterDiscount + tax;
      setTotal(tot);
    });

    // Calculate totals on mount with default values
    const values = form.getValues();
    const items = values.items || [];
    const sub = items.reduce((sum, item) => sum + (item?.amount || 0), 0);
    setSubtotal(sub);

    let disc = 0;
    if (values.discountType === "percentage") {
      disc = (sub * (values.discountValue || 0)) / 100;
    } else if (values.discountType === "fixed") {
      disc = values.discountValue || 0;
    }
    setDiscountAmount(disc);

    const afterDiscount = sub - disc;
    const tax = (afterDiscount * (values.taxRate || 0)) / 100;
    setTaxAmount(tax);

    const tot = afterDiscount + tax;
    setTotal(tot);

    return () => subscription.unsubscribe();
  }, [form]);

  // Update item amount when quantity or rate changes
  const updateItemAmount = (index: number) => {
    const item = form.getValues(`items.${index}`);
    const amount = item.quantity * item.rate;
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-5xl space-y-8"
      >
        {/* Header Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {invoiceId ? "Edit Invoice" : "Create Invoice"}
              </h1>
              {nextInvoiceNumber && !invoiceId && (
                <p className="text-sm text-muted-foreground">
                  Invoice #{nextInvoiceNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Form */}
          <div className="space-y-8 lg:col-span-2">
            {/* Basic Details */}
            <Card>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-base font-medium">
                  Basic Details
                </CardTitle>
                <CardDescription className="text-xs">
                  Invoice information and client details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Empty clients alert */}
                {clients && clients.length === 0 && (
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2 -mt-4 border-amber-400">
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

                <div className="grid gap-6 sm:grid-cols-2 pt-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-medium">
                          Client *
                        </FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          onOpenChange={(open) => {
                            if (!open) field.onBlur();
                          }}
                          disabled={!clients || clients.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue
                                placeholder={
                                  !clients || clients.length === 0
                                    ? "No clients available"
                                    : "Select a client"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients?.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                                {client.company && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({client.company})
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                            {clients && clients.length > 0 && (
                              <>
                                <Separator className="my-0.5" />
                                <Link
                                  href="/dashboard/clients/new"
                                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-primary hover:opacity-90 cursor-pointer opacity-70"
                                >
                                  Add new client
                                </Link>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-medium">
                          Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!isClientSelected}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
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

                <div className="grid gap-6 sm:grid-cols-2">
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
                          <Input
                            type="date"
                            className="h-10"
                            disabled={!isClientSelected}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          Due Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="h-10"
                            disabled={!isClientSelected}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader className="space-y-1 pb-4">
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
              <CardContent className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="group relative space-y-4 rounded-lg border border-border/50 bg-muted/20 p-4 transition-all hover:border-border hover:bg-muted/30"
                  >
                    <div className="grid gap-4 md:grid-cols-12">
                      <div className="md:col-span-5">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs font-medium text-muted-foreground">
                                Description
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Item description"
                                  className="h-9 bg-background"
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
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs font-medium text-muted-foreground">
                                Quantity
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  className="h-9 bg-background"
                                  disabled={!isClientSelected}
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    );
                                    setTimeout(
                                      () => updateItemAmount(index),
                                      0
                                    );
                                  }}
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
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs font-medium text-muted-foreground">
                                Rate
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  className="h-9 bg-background"
                                  disabled={!isClientSelected}
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    );
                                    setTimeout(
                                      () => updateItemAmount(index),
                                      0
                                    );
                                  }}
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
                          name={`items.${index}.amount`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs font-medium text-muted-foreground">
                                Amount
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  disabled
                                  className="h-9 bg-muted/50"
                                  {...field}
                                  value={field.value.toFixed(2)}
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
                            className="h-9 w-9 opacity-50 transition-opacity hover:opacity-100"
                            disabled={!isClientSelected}
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tax & Discounts */}
            <Card>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-base font-medium">
                  Tax & Discounts
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure tax rates and discounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-medium">
                          Tax Rate (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            className="h-10"
                            disabled={!isClientSelected}
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            onBlur={field.onBlur}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-medium">
                          Discount Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!isClientSelected}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="percentage">
                              Percentage
                            </SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-medium">
                          Discount Value
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="h-10"
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            onBlur={field.onBlur}
                            disabled={
                              !isClientSelected ||
                              !form.watch("discountType") ||
                              form.watch("discountType") === "none"
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  Additional Information
                </CardTitle>
                <CardDescription className="text-xs">
                  Optional notes and terms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
            </Card>
          </div>

          {/* Right Column - Summary Sidebar */}
          <div className="space-y-8 lg:col-span-1">
            {/* Invoice Summary */}
            <div className="sticky top-8 space-y-6">
              <Card>
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
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
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-mono text-green-600">
                          -${discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tax ({form.watch("taxRate") || 0}%)
                      </span>
                      <span className="font-mono text-foreground">
                        ${taxAmount.toFixed(2)}
                      </span>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-base font-semibold">Total</span>
                      <span className="text-xl font-bold font-mono text-primary">
                        ${total.toFixed(2)}
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
                    !clients ||
                    clients.length === 0
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : !clients || clients.length === 0
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
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
