"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Trash2 } from "lucide-react";

const clientFormSchema = z.object({
  name: z
    .string()
    .min(1, "Client name is required")
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .transform((val) => val.trim()),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address (e.g., john@example.com)")
    .max(255, "Email address must not exceed 255 characters")
    .toLowerCase()
    .transform((val) => val.trim()),
  phone: z
    .string()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      "Phone number invalid"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .refine(
      (val) => !val || val.length <= 200,
      "Company name must not exceed 200 characters"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .refine(
      (val) => !val || val.length <= 500,
      "Address must not exceed 500 characters"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .refine(
      (val) => !val || /^[a-zA-Z\s\-']+$/.test(val),
      "City can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine(
      (val) => !val || val.length <= 100,
      "City name must not exceed 100 characters"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  state: z
    .string()
    .refine(
      (val) => !val || val.length <= 100,
      "State/Province must not exceed 100 characters"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .refine(
      (val) => !val || /^[a-zA-Z\s\-']+$/.test(val),
      "Country can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine(
      (val) => !val || val.length <= 100,
      "Country name must not exceed 100 characters"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .refine(
      (val) => !val || /^[A-Z0-9\s\-]+$/i.test(val),
      "Postal code can only contain letters, numbers, spaces, and hyphens"
    )
    .refine(
      (val) => !val || val.length <= 20,
      "Postal code must not exceed 20 characters"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  taxId: z
    .string()
    .refine(
      (val) => !val || val.length >= 5,
      "Tax ID must be at least 5 characters if provided"
    )
    .refine(
      (val) => !val || val.length <= 50,
      "Tax ID must not exceed 50 characters"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .refine(
      (val) => !val || val.length <= 2000,
      "Notes must not exceed 2000 characters"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  clientId?: string;
  defaultValues?: Partial<ClientFormValues>;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function ClientForm({
  clientId,
  defaultValues,
  onDelete,
  isDeleting,
}: ClientFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  // Open collapsible by default if editing and has tax ID or notes
  const hasAdditionalInfo = Boolean(
    defaultValues?.taxId || defaultValues?.notes
  );

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: (data) => {
      // Invalidate clients list and hasAny to refresh the list view
      utils.clients.list.invalidate();
      utils.clients.hasAny.invalidate();
      router.push(`/dashboard/clients/${data.id}`);
    },
  });

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      // Invalidate both the specific client and the list to ensure fresh data
      if (clientId) {
        utils.clients.getById.invalidate({ id: clientId });
      }
      utils.clients.list.invalidate();
      utils.invoices.list.invalidate();
      router.push(`/dashboard/clients/${clientId}`);
    },
  });

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      taxId: "",
      notes: "",
    },
  });

  const onSubmit = async (data: ClientFormValues) => {
    if (clientId) {
      await updateMutation.mutateAsync({
        id: clientId,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto space-y-8"
      >
        <Card className="gap-2 pb-2">
          <CardHeader className="gap-0">
            <CardTitle className="text-base font-medium">
              Basic Information
            </CardTitle>
            <CardDescription className="text-xs">
              Enter the client's contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">
                      Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">
                      Email *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 (555) 123-4567"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">
                      Company
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Acme Corp"
                        className="h-10"
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

        <Card className="gap-2 pb-2">
          <CardHeader className="gap-0">
            <CardTitle className="text-base font-medium">Address</CardTitle>
            <CardDescription className="text-xs">
              Enter the client's billing address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-sm font-medium">
                    Street Address
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="pb-2">
          <Collapsible defaultOpen={hasAdditionalInfo}>
            <CardHeader className="gap-0.5 pb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full group">
                <div className="text-left">
                  <CardTitle className="text-base font-medium">
                    Additional Information
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Tax ID and additional notes (optional)
                  </CardDescription>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-2 pt-0">
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="font-medium">
                        Tax ID / VAT Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tax identification number"
                          className="h-10"
                          {...field}
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
                    <FormItem className="space-y-0.5">
                      <FormLabel className="font-medium">Notes</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Additional notes about this client..."
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

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          {clientId && onDelete ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 order-last sm:order-first text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete Client"}
            </Button>
          ) : (
            <div className="hidden sm:block" />
          )}
          <div className="contents sm:flex sm:gap-3">
            <Button
              type="submit"
              className="h-10"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : clientId
                ? "Update Client"
                : "Create Client"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => router.push("/dashboard/clients")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
