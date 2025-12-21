"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { LogoUpload } from "@/components/ui/logo-upload";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { processImageForUpload } from "@/lib/image-utils";

const businessProfileSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .min(2, "Company name must be at least 2 characters long")
    .max(200, "Company name must not exceed 200 characters")
    .transform((val) => val.trim()),
  email: z
    .string()
    .min(1, "Business email address is required")
    .email("Please enter a valid email address (e.g., info@company.com)")
    .max(255, "Email address must not exceed 255 characters")
    .toLowerCase()
    .transform((val) => val.trim()),
  phone: z
    .string()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      "Phone number invalid"
    )
    .refine(
      (val) => !val || val.length >= 7,
      "Phone number must be at least 7 characters if provided"
    )
    .refine(
      (val) => !val || val.length <= 20,
      "Phone number must not exceed 20 characters"
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
      "Tax ID / EIN must be at least 5 characters if provided"
    )
    .refine(
      (val) => !val || val.length <= 50,
      "Tax ID / EIN must not exceed 50 characters"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  vatNumber: z
    .string()
    .refine(
      (val) => !val || /^[A-Z0-9]+$/i.test(val),
      "VAT number can only contain letters and numbers"
    )
    .refine(
      (val) => !val || val.length >= 8,
      "VAT number must be at least 8 characters if provided"
    )
    .refine(
      (val) => !val || val.length <= 15,
      "VAT number must not exceed 15 characters"
    )
    .transform((val) => (val ? val.trim().toUpperCase() : ""))
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .refine(
      (val) =>
        !val ||
        val === "" ||
        /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(
          val
        ),
      "Please enter a valid website URL (e.g., https://company.com)"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  bankName: z
    .string()
    .refine(
      (val) => !val || val.length <= 200,
      "Bank name must not exceed 200 characters"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  bankAccountNumber: z
    .string()
    .refine(
      (val) => !val || /^[A-Z0-9]+$/i.test(val),
      "Account number can only contain letters and numbers"
    )
    .refine(
      (val) => !val || val.length >= 6,
      "Account number must be at least 6 characters if provided"
    )
    .refine(
      (val) => !val || val.length <= 34,
      "Account number must not exceed 34 characters"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  bankRoutingNumber: z
    .string()
    .refine(
      (val) => !val || /^[0-9]+$/.test(val),
      "Routing number must contain only digits"
    )
    .refine(
      (val) => !val || val.length === 9,
      "Routing number must be exactly 9 digits"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  swiftCode: z
    .string()
    .refine(
      (val) => !val || /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(val),
      "SWIFT code must be 8 or 11 characters (e.g., BOFAUS3N)"
    )
    .transform((val) => (val ? val.trim().toUpperCase() : ""))
    .optional()
    .or(z.literal("")),
  iban: z
    .string()
    .refine(
      (val) => !val || /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/i.test(val),
      "IBAN must start with 2 letters followed by 2 digits (e.g., GB29NWBK60161331926819)"
    )
    .refine(
      (val) => !val || val.length >= 15,
      "IBAN must be at least 15 characters if provided"
    )
    .refine(
      (val) => !val || val.length <= 34,
      "IBAN must not exceed 34 characters"
    )
    .transform((val) =>
      val ? val.trim().replace(/\s/g, "").toUpperCase() : ""
    )
    .optional()
    .or(z.literal("")),
});

type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;

export function BusinessProfileForm() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const { data: profile, isLoading } = trpc.businessProfile.get.useQuery();
  const upsertMutation = trpc.businessProfile.upsert.useMutation();
  const uploadLogoMutation = trpc.businessProfile.uploadLogo.useMutation();
  const utils = trpc.useUtils();

  const form = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      companyName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      taxId: "",
      vatNumber: "",
      website: "",
      bankName: "",
      bankAccountNumber: "",
      bankRoutingNumber: "",
      swiftCode: "",
      iban: "",
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        companyName: profile.companyName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "",
        postalCode: profile.postalCode || "",
        taxId: profile.taxId || "",
        vatNumber: profile.vatNumber || "",
        website: profile.website || "",
        bankName: profile.bankName || "",
        bankAccountNumber: profile.bankAccountNumber || "",
        bankRoutingNumber: profile.bankRoutingNumber || "",
        swiftCode: profile.swiftCode || "",
        iban: profile.iban || "",
      });
      if (profile.logo) {
        setLogoPreview(profile.logo);
      }
    }
  }, [profile, form]);

  const onSubmit = async (data: BusinessProfileFormData) => {
    try {
      await upsertMutation.mutateAsync(data);
      await utils.businessProfile.get.invalidate();
      toast.success("Business profile saved successfully");
    } catch (error) {
      toast.error("Failed to save business profile");
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    setLogoError(null);

    try {
      const base64Image = await processImageForUpload(file);
      setLogoPreview(base64Image);

      await uploadLogoMutation.mutateAsync({ logo: base64Image });
      await utils.businessProfile.get.invalidate();
      toast.success("Logo uploaded successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload logo";
      setLogoError(errorMessage);
      toast.error(errorMessage);
      setLogoPreview(null);
    } finally {
      setUploadingLogo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto space-y-8"
      >
        {/* Logo Upload */}
        <Card className="gap-2 min-w-min">
          <CardHeader className="pb-4 text-center gap-0">
            <CardTitle className="text-base font-medium">
              Company Logo
            </CardTitle>
            <CardDescription className="text-xs">
              Square ratio recommended for best results
            </CardDescription>
          </CardHeader>
          <CardContent className="mx-auto">
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="py-2 flex justify-center sm:justify-center">
                <LogoUpload
                  preview={logoPreview}
                  onUpload={handleLogoUpload}
                  uploading={uploadingLogo}
                  error={logoError}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="gap-2">
          <CardHeader className="gap-0 pb-4">
            <CardTitle className="text-base font-medium">
              Company Information
            </CardTitle>
            <CardDescription className="text-xs">
              Basic information about your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">
                      Company Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Acme Inc."
                        className="h-10"
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
                        {...field}
                        type="email"
                        placeholder="info@company.com"
                        className="h-10"
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
                        {...field}
                        placeholder="+1 (555) 123-4567"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://company.com"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="gap-2">
          <CardHeader className="gap-0 pb-4">
            <CardTitle className="text-base font-medium">
              Business Address
            </CardTitle>
            <CardDescription className="text-xs">
              Your company's physical address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 Main St" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="San Francisco" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="United States" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="94102" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card className="gap-2">
          <CardHeader className="gap-0 pb-4">
            <CardTitle className="text-base font-medium">
              Tax Information
            </CardTitle>
            <CardDescription className="text-xs">
              Tax identification numbers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID / EIN</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12-3456789" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="GB123456789" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bank Information */}
        <Card className="gap-2">
          <CardHeader className="gap-0 pb-4">
            <CardTitle className="text-base font-medium">
              Bank Information
            </CardTitle>
            <CardDescription className="text-xs">
              Bank account details for payment instructions on invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Bank of America" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="bankAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1234567890" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankRoutingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Routing Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123456789" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="swiftCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SWIFT Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="BOFAUS3N" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="GB29 NWBK 6016 1331 9268 19"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mb-12">
          <Button
            type="submit"
            className="h-10 font-medium"
            disabled={upsertMutation.isPending}
          >
            {upsertMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Business Profile
          </Button>
        </div>
      </form>
    </Form>
  );
}
